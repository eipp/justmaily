import { readFile } from 'fs/promises'
import * as Handlebars from 'handlebars'
import { minify } from 'html-minifier'
import { Redis } from 'ioredis'
import * as Juice from 'juice'
import * as Mjml from 'mjml'
import { join } from 'path'

import { MetricsService } from '../monitoring'
import { SecurityService } from '../security'

interface TemplateConfig {
  engine: 'handlebars' | 'mjml'
  templatesDir: string
  caching: {
    enabled: boolean
    ttl: number
  }
  minification: {
    enabled: boolean
    options?: any
  }
  defaults: {
    layout?: string
    partials?: string[]
    helpers?: Record<string, Function>
    data?: Record<string, any>
  }
}

interface Template {
  id: string
  name: string
  description?: string
  engine: 'handlebars' | 'mjml'
  content: string
  layout?: string
  partials?: string[]
  helpers?: string[]
  version: string
  metadata?: Record<string, any>
}

interface CompiledTemplate {
  id: string
  version: string
  template: any
  dependencies: {
    layout?: string
    partials: string[]
    helpers: string[]
  }
  lastCompiled: Date
}

export class EmailTemplates {
  private redis: Redis
  private compiledTemplates: Map<string, CompiledTemplate> = new Map()
  private handlebars: typeof Handlebars
  
  constructor(
    private config: TemplateConfig,
    private metrics: MetricsService,
    private security: SecurityService,
    redisUrl: string
  ) {
    this.redis = new Redis(redisUrl)
    this.handlebars = Handlebars.create()
    this.initializeService()
  }

  async renderTemplate(
    templateId: string,
    data: Record<string, any>,
    options?: {
      layout?: string
      partials?: string[]
      helpers?: Record<string, Function>
      inline?: boolean
      minify?: boolean
    }
  ): Promise<{
    html: string
    text: string
    subject: string
    metadata: Record<string, any>
  }> {
    try {
      const startTime = Date.now()
      
      // Get compiled template
      const compiled = await this.getCompiledTemplate(templateId)
      if (!compiled) {
        throw new Error(`Template not found: ${templateId}`)
      }

      // Merge data with defaults
      const mergedData = {
        ...this.config.defaults.data,
        ...data
      }

      // Render template
      const rendered = await this.renderWithEngine(
        compiled,
        mergedData,
        options
      )

      // Post-process output
      const processed = await this.postProcess(rendered, options)

      await this.metrics.recordLatency(
        'template_render',
        Date.now() - startTime
      )
      
      return processed
    } catch (error) {
      await this.metrics.recordError('template_render', error.message)
      throw error
    }
  }

  async createTemplate(template: Omit<Template, 'version'>): Promise<Template> {
    try {
      const newTemplate: Template = {
        ...template,
        version: '1.0.0'
      }

      // Validate template
      await this.validateTemplate(newTemplate)

      // Store template
      await this.storeTemplate(newTemplate)

      // Precompile template
      await this.compileTemplate(newTemplate)

      return newTemplate
    } catch (error) {
      await this.metrics.recordError('template_create', error.message)
      throw error
    }
  }

  async updateTemplate(
    templateId: string,
    updates: Partial<Template>
  ): Promise<Template> {
    try {
      // Get existing template
      const existing = await this.getTemplate(templateId)
      if (!existing) {
        throw new Error(`Template not found: ${templateId}`)
      }

      // Create new version
      const updated: Template = {
        ...existing,
        ...updates,
        version: this.incrementVersion(existing.version)
      }

      // Validate template
      await this.validateTemplate(updated)

      // Store template
      await this.storeTemplate(updated)

      // Precompile template
      await this.compileTemplate(updated)

      // Invalidate cache
      this.compiledTemplates.delete(templateId)

      return updated
    } catch (error) {
      await this.metrics.recordError('template_update', error.message)
      throw error
    }
  }

  async deleteTemplate(templateId: string): Promise<void> {
    try {
      // Delete from Redis
      await this.redis.del(`template:${templateId}`)
      
      // Remove from cache
      this.compiledTemplates.delete(templateId)
    } catch (error) {
      await this.metrics.recordError('template_delete', error.message)
      throw error
    }
  }

  // Private Methods
  private async initializeService(): Promise<void> {
    try {
      // Register default helpers
      await this.registerDefaultHelpers()
      
      // Register default partials
      await this.registerDefaultPartials()
      
      // Load templates from disk
      await this.loadTemplates()
      
      // Setup metrics
      this.setupMetrics()
    } catch (error) {
      console.error('Failed to initialize email templates:', error)
    }
  }

  private async registerDefaultHelpers(): Promise<void> {
    // Register built-in helpers
    this.handlebars.registerHelper('formatDate', (date: Date, format: string) => {
      // Implementation
    })

    this.handlebars.registerHelper('currency', (amount: number, currency: string) => {
      // Implementation
    })

    // Register custom helpers
    if (this.config.defaults.helpers) {
      Object.entries(this.config.defaults.helpers).forEach(([name, helper]) => {
        this.handlebars.registerHelper(name, helper)
      })
    }
  }

  private async registerDefaultPartials(): Promise<void> {
    if (this.config.defaults.partials) {
      for (const partial of this.config.defaults.partials) {
        const content = await readFile(
          join(this.config.templatesDir, 'partials', `${partial}.hbs`),
          'utf-8'
        )
        this.handlebars.registerPartial(partial, content)
      }
    }
  }

  private async loadTemplates(): Promise<void> {
    const templates = await this.redis.keys('template:*')
    for (const key of templates) {
      const template = await this.redis.get(key)
      if (template) {
        const parsed = JSON.parse(template)
        await this.compileTemplate(parsed)
      }
    }
  }

  private async getTemplate(id: string): Promise<Template | null> {
    const template = await this.redis.get(`template:${id}`)
    return template ? JSON.parse(template) : null
  }

  private async storeTemplate(template: Template): Promise<void> {
    await this.redis.set(
      `template:${template.id}`,
      JSON.stringify(template)
    )
  }

  private async validateTemplate(template: Template): Promise<void> {
    // Validate required fields
    if (!template.id || !template.name || !template.content) {
      throw new Error('Missing required template fields')
    }

    // Validate engine
    if (!['handlebars', 'mjml'].includes(template.engine)) {
      throw new Error('Invalid template engine')
    }

    // Try compiling template
    try {
      await this.compileTemplate(template)
    } catch (error) {
      throw new Error(`Template compilation failed: ${error.message}`)
    }
  }

  private async compileTemplate(template: Template): Promise<void> {
    const compiled: CompiledTemplate = {
      id: template.id,
      version: template.version,
      template: null,
      dependencies: {
        layout: template.layout,
        partials: template.partials || [],
        helpers: template.helpers || []
      },
      lastCompiled: new Date()
    }

    switch (template.engine) {
      case 'handlebars':
        compiled.template = this.handlebars.compile(template.content)
        break
      case 'mjml':
        compiled.template = Mjml(template.content, {
          validationLevel: 'strict'
        })
        break
    }

    this.compiledTemplates.set(template.id, compiled)
  }

  private async getCompiledTemplate(
    id: string
  ): Promise<CompiledTemplate | null> {
    // Check memory cache first
    if (this.compiledTemplates.has(id)) {
      return this.compiledTemplates.get(id)!
    }

    // Get template from Redis and compile
    const template = await this.getTemplate(id)
    if (template) {
      await this.compileTemplate(template)
      return this.compiledTemplates.get(id)!
    }

    return null
  }

  private async renderWithEngine(
    compiled: CompiledTemplate,
    data: Record<string, any>,
    options?: {
      layout?: string
      partials?: string[]
      helpers?: Record<string, Function>
    }
  ): Promise<string> {
    // Register template-specific helpers
    if (options?.helpers) {
      Object.entries(options.helpers).forEach(([name, helper]) => {
        this.handlebars.registerHelper(name, helper)
      })
    }

    let rendered: string
    
    switch (compiled.template.engine) {
      case 'handlebars':
        rendered = compiled.template(data)
        
        // Apply layout if specified
        if (options?.layout || compiled.dependencies.layout) {
          const layoutTemplate = await this.getCompiledTemplate(
            options?.layout || compiled.dependencies.layout!
          )
          if (layoutTemplate) {
            rendered = layoutTemplate.template({
              ...data,
              body: rendered
            })
          }
        }
        break
        
      case 'mjml':
        rendered = compiled.template.html
        break
    }

    // Cleanup registered helpers
    if (options?.helpers) {
      Object.keys(options.helpers).forEach(name => {
        this.handlebars.unregisterHelper(name)
      })
    }

    return rendered
  }

  private async postProcess(
    html: string,
    options?: {
      inline?: boolean
      minify?: boolean
    }
  ): Promise<{
    html: string
    text: string
    subject: string
    metadata: Record<string, any>
  }> {
    let processed = html

    // Inline CSS
    if (options?.inline !== false) {
      processed = Juice(processed)
    }

    // Minify HTML
    if (options?.minify !== false && this.config.minification.enabled) {
      processed = minify(processed, {
        collapseWhitespace: true,
        removeComments: true,
        ...this.config.minification.options
      })
    }

    // Extract subject from HTML
    const subject = this.extractSubject(processed)

    // Generate text version
    const text = this.generateTextVersion(processed)

    // Extract metadata
    const metadata = this.extractMetadata(processed)

    return {
      html: processed,
      text,
      subject,
      metadata
    }
  }

  private extractSubject(html: string): string {
    const match = html.match(/<title>(.*?)<\/title>/)
    return match ? match[1] : ''
  }

  private generateTextVersion(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<style[^>]*>.*?<\/style>/gs, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private extractMetadata(html: string): Record<string, any> {
    const metadata: Record<string, any> = {}
    
    // Extract meta tags
    const metaRegex = /<meta\s+name="([^"]+)"\s+content="([^"]+)"/g
    let match
    
    while ((match = metaRegex.exec(html)) !== null) {
      metadata[match[1]] = match[2]
    }
    
    return metadata
  }

  private incrementVersion(version: string): string {
    const [major, minor, patch] = version.split('.').map(Number)
    return `${major}.${minor}.${patch + 1}`
  }

  private setupMetrics(): void {
    this.metrics.registerCounter(
      'template_renders_total',
      'Total number of template renders'
    )
    this.metrics.registerHistogram(
      'template_render_latency',
      'Template render latency in seconds',
      [0.01, 0.05, 0.1, 0.5, 1]
    )
    this.metrics.registerGauge(
      'compiled_templates_count',
      'Number of compiled templates in cache'
    )
  }
} 