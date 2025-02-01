export interface SiteConfig {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    twitter: string
    github: string
  }
  creator: string
}

export const siteConfig: SiteConfig = {
  name: 'Maily',
  description: 'Next-generation email marketing platform powered by AI',
  url: 'https://maily.app',
  ogImage: 'https://maily.app/og.png',
  links: {
    twitter: 'https://twitter.com/mindburnlabs',
    github: 'https://github.com/mindburn-labs',
  },
  creator: 'Mindburn Labs',
} as const 