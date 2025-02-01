import KeycloakConnect from 'keycloak-connect'

import { MetricsService } from './monitoring'
import { SecurityService } from './security'

interface KeycloakConfig {
  realm: string
  authServerUrl: string
  clientId: string
  clientSecret: string
  bearerOnly?: boolean
  confidentialPort?: number
  cookieKey?: string
  minimumTokenValidity?: number
}

interface TokenData {
  accessToken: string
  refreshToken: string
  expiresIn: number
  refreshExpiresIn: number
  tokenType: string
}

interface UserInfo {
  id: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
  permissions: string[]
  metadata: Record<string, any>
}

export class KeycloakClient {
  private keycloak: KeycloakConnect.Keycloak
  private tokenCache: Map<string, TokenData> = new Map()
  
  constructor(
    private config: KeycloakConfig,
    private metrics: MetricsService,
    private security: SecurityService
  ) {
    this.keycloak = new KeycloakConnect({}, {
      realm: config.realm,
      'auth-server-url': config.authServerUrl,
      'bearer-only': config.bearerOnly || false,
      'confidential-port': config.confidentialPort || 0,
      'ssl-required': 'external',
      resource: config.clientId,
      credentials: {
        secret: config.clientSecret
      }
    })

    this.setupMetrics()
  }

  // Authentication
  async authenticate(
    username: string,
    password: string
  ): Promise<TokenData> {
    try {
      const startTime = Date.now()
      
      const response = await this.keycloak.grantManager.obtainDirectly(
        username,
        password
      )
      
      const tokenData: TokenData = {
        accessToken: response.access_token.token,
        refreshToken: response.refresh_token?.token || '',
        expiresIn: response.access_token.expires_in,
        refreshExpiresIn: response.refresh_token?.expires_in || 0,
        tokenType: response.token_type
      }

      // Cache token
      this.tokenCache.set(username, tokenData)
      
      // Record metrics
      await this.metrics.recordAuthSuccess('password_grant')
      await this.metrics.recordLatency(
        'auth_password_grant',
        Date.now() - startTime
      )

      // Audit log
      await this.security.logAuditEvent({
        action: 'user_login',
        userId: username,
        resource: 'auth',
        details: { method: 'password_grant' }
      })

      return tokenData
    } catch (error) {
      await this.metrics.recordAuthFailure('password_grant')
      throw error
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const startTime = Date.now()
      const grant = await this.keycloak.grantManager.createGrant({
        access_token: token
      })
      
      const isValid = await this.keycloak.grantManager.validateGrant(grant)
      
      await this.metrics.recordLatency(
        'token_validation',
        Date.now() - startTime
      )
      
      return isValid
    } catch (error) {
      await this.metrics.recordAuthFailure('token_validation')
      return false
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenData> {
    try {
      const startTime = Date.now()
      
      const grant = await this.keycloak.grantManager.createGrant({
        refresh_token: refreshToken
      })
      
      const response = await this.keycloak.grantManager.refresh(grant)
      
      const tokenData: TokenData = {
        accessToken: response.access_token.token,
        refreshToken: response.refresh_token?.token || '',
        expiresIn: response.access_token.expires_in,
        refreshExpiresIn: response.refresh_token?.expires_in || 0,
        tokenType: response.token_type
      }

      await this.metrics.recordLatency(
        'token_refresh',
        Date.now() - startTime
      )
      
      return tokenData
    } catch (error) {
      await this.metrics.recordAuthFailure('token_refresh')
      throw error
    }
  }

  // User Management
  async getUserInfo(token: string): Promise<UserInfo> {
    try {
      const startTime = Date.now()
      
      const grant = await this.keycloak.grantManager.createGrant({
        access_token: token
      })
      
      const userInfo = await this.keycloak.grantManager.userInfo(grant)
      
      await this.metrics.recordLatency(
        'user_info_fetch',
        Date.now() - startTime
      )
      
      return {
        id: userInfo.sub,
        email: userInfo.email,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        roles: await this.getUserRoles(grant),
        permissions: await this.getUserPermissions(grant),
        metadata: userInfo
      }
    } catch (error) {
      await this.metrics.recordAuthFailure('user_info_fetch')
      throw error
    }
  }

  async hasRole(token: string, role: string): Promise<boolean> {
    try {
      const grant = await this.keycloak.grantManager.createGrant({
        access_token: token
      })
      
      return this.keycloak.grantManager.hasRole(grant, role)
    } catch (error) {
      await this.metrics.recordAuthFailure('role_check')
      return false
    }
  }

  async hasPermission(
    token: string,
    resource: string,
    scope: string
  ): Promise<boolean> {
    try {
      const grant = await this.keycloak.grantManager.createGrant({
        access_token: token
      })
      
      const permission = await this.keycloak.grantManager.checkPermission(
        grant,
        resource,
        scope
      )
      
      return permission.isGranted()
    } catch (error) {
      await this.metrics.recordAuthFailure('permission_check')
      return false
    }
  }

  // Token Management
  async revokeToken(token: string): Promise<void> {
    try {
      const startTime = Date.now()
      
      await this.keycloak.grantManager.logout({
        access_token: token
      })
      
      await this.metrics.recordLatency(
        'token_revocation',
        Date.now() - startTime
      )
    } catch (error) {
      await this.metrics.recordAuthFailure('token_revocation')
      throw error
    }
  }

  async validateSession(sessionId: string): Promise<boolean> {
    try {
      const response = await this.keycloak.grantManager.validateSession(sessionId)
      return response.isActive()
    } catch (error) {
      await this.metrics.recordAuthFailure('session_validation')
      return false
    }
  }

  // Helper Methods
  private async getUserRoles(grant: any): Promise<string[]> {
    const realmAccess = grant.access_token.content.realm_access || {}
    const clientAccess = grant.access_token.content.resource_access || {}
    
    const roles = new Set([
      ...(realmAccess.roles || []),
      ...(clientAccess[this.config.clientId]?.roles || [])
    ])
    
    return Array.from(roles)
  }

  private async getUserPermissions(grant: any): Promise<string[]> {
    const permissions = grant.access_token.content.authorization?.permissions || []
    return permissions.map((p: any) => `${p.resource_set_name}:${p.scopes.join(',')}`)
  }

  private setupMetrics(): void {
    // Register auth-specific metrics
    this.metrics.registerCounter('auth_success_total', 'Total successful authentications')
    this.metrics.registerCounter('auth_failure_total', 'Total failed authentications')
    this.metrics.registerHistogram(
      'auth_latency_seconds',
      'Authentication latency in seconds',
      [0.1, 0.5, 1, 2, 5]
    )
  }
} 