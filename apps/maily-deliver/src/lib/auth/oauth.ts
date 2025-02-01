import { Client as MicrosoftClient } from '@microsoft/microsoft-graph-client'
import { Client as GitHubClient } from '@octokit/rest'
import { OAuth2Client } from 'google-auth-library'

import { MetricsService } from '../monitoring'
import { SecurityService } from '../security'
import { KeycloakClient } from './keycloak'

interface OAuth2Config {
  providers: {
    google?: {
      clientId: string
      clientSecret: string
      redirectUri: string
      scopes: string[]
    }
    github?: {
      clientId: string
      clientSecret: string
      redirectUri: string
      scopes: string[]
    }
    microsoft?: {
      clientId: string
      clientSecret: string
      redirectUri: string
      scopes: string[]
      tenantId: string
    }
  }
  mfa?: {
    enabled: boolean
    providers: ('totp' | 'sms' | 'email')[]
    issuer: string
    totpWindow?: number
    smsProvider?: string
    emailProvider?: string
  }
}

interface OAuth2Token {
  accessToken: string
  refreshToken?: string
  idToken?: string
  expiresIn: number
  scope: string
  tokenType: string
}

interface MFASetup {
  secret: string
  qrCode: string
  backupCodes: string[]
  recoveryKeys: string[]
}

export class OAuth2Service {
  private googleClient?: OAuth2Client
  private githubClient?: GitHubClient
  private microsoftClient?: MicrosoftClient
  private mfaSecrets: Map<string, string> = new Map()
  
  constructor(
    private config: OAuth2Config,
    private metrics: MetricsService,
    private security: SecurityService,
    private keycloak: KeycloakClient
  ) {
    this.initializeClients()
  }

  // OAuth2 Provider Authentication
  async authenticateWithGoogle(code: string): Promise<OAuth2Token> {
    if (!this.googleClient) {
      throw new Error('Google OAuth2 is not configured')
    }

    try {
      const startTime = Date.now()
      
      const { tokens } = await this.googleClient.getToken(code)
      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: this.config.providers.google?.clientId
      })
      
      const payload = ticket.getPayload()!
      
      // Create or update user in Keycloak
      await this.syncUserWithKeycloak('google', payload)
      
      await this.metrics.recordLatency(
        'oauth_google_auth',
        Date.now() - startTime
      )
      
      return {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        idToken: tokens.id_token,
        expiresIn: tokens.expiry_date! - Date.now(),
        scope: tokens.scope!,
        tokenType: tokens.token_type!
      }
    } catch (error) {
      await this.metrics.recordAuthFailure('oauth_google')
      throw error
    }
  }

  async authenticateWithGitHub(code: string): Promise<OAuth2Token> {
    if (!this.githubClient) {
      throw new Error('GitHub OAuth2 is not configured')
    }

    try {
      const startTime = Date.now()
      
      const response = await this.githubClient.auth.createToken({
        client_id: this.config.providers.github?.clientId!,
        client_secret: this.config.providers.github?.clientSecret!,
        code,
        redirect_uri: this.config.providers.github?.redirectUri
      })
      
      const userResponse = await this.githubClient.users.getAuthenticated()
      
      // Create or update user in Keycloak
      await this.syncUserWithKeycloak('github', userResponse.data)
      
      await this.metrics.recordLatency(
        'oauth_github_auth',
        Date.now() - startTime
      )
      
      return {
        accessToken: response.data.token,
        expiresIn: 0, // GitHub tokens don't expire
        scope: response.data.scopes.join(' '),
        tokenType: 'bearer'
      }
    } catch (error) {
      await this.metrics.recordAuthFailure('oauth_github')
      throw error
    }
  }

  async authenticateWithMicrosoft(code: string): Promise<OAuth2Token> {
    if (!this.microsoftClient) {
      throw new Error('Microsoft OAuth2 is not configured')
    }

    try {
      const startTime = Date.now()
      
      const response = await this.microsoftClient.api('/oauth2/v2.0/token').post({
        client_id: this.config.providers.microsoft?.clientId,
        client_secret: this.config.providers.microsoft?.clientSecret,
        code,
        redirect_uri: this.config.providers.microsoft?.redirectUri,
        grant_type: 'authorization_code'
      })
      
      const userInfo = await this.microsoftClient.api('/me').get()
      
      // Create or update user in Keycloak
      await this.syncUserWithKeycloak('microsoft', userInfo)
      
      await this.metrics.recordLatency(
        'oauth_microsoft_auth',
        Date.now() - startTime
      )
      
      return {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        idToken: response.id_token,
        expiresIn: response.expires_in,
        scope: response.scope,
        tokenType: response.token_type
      }
    } catch (error) {
      await this.metrics.recordAuthFailure('oauth_microsoft')
      throw error
    }
  }

  // MFA Management
  async setupMFA(
    userId: string,
    method: 'totp' | 'sms' | 'email'
  ): Promise<MFASetup> {
    if (!this.config.mfa?.enabled) {
      throw new Error('MFA is not enabled')
    }

    try {
      const startTime = Date.now()
      
      let setup: MFASetup
      
      switch (method) {
        case 'totp':
          setup = await this.setupTOTP(userId)
          break
        case 'sms':
          setup = await this.setupSMS(userId)
          break
        case 'email':
          setup = await this.setupEmail(userId)
          break
        default:
          throw new Error(`Unsupported MFA method: ${method}`)
      }

      // Store encrypted MFA secret
      const encryptedSecret = await this.security.encrypt({
        method,
        secret: setup.secret,
        timestamp: Date.now()
      })
      
      this.mfaSecrets.set(userId, encryptedSecret.encryptedData)
      
      await this.metrics.recordLatency(
        'mfa_setup',
        Date.now() - startTime
      )
      
      return setup
    } catch (error) {
      await this.metrics.recordAuthFailure('mfa_setup')
      throw error
    }
  }

  async verifyMFA(
    userId: string,
    method: 'totp' | 'sms' | 'email',
    code: string
  ): Promise<boolean> {
    if (!this.config.mfa?.enabled) {
      throw new Error('MFA is not enabled')
    }

    try {
      const startTime = Date.now()
      
      const encryptedSecret = this.mfaSecrets.get(userId)
      if (!encryptedSecret) {
        throw new Error('MFA not set up for user')
      }

      const decrypted = await this.security.decrypt({
        encryptedData: encryptedSecret,
        iv: '', // Get from storage
        tag: '' // Get from storage
      })

      let isValid = false
      
      switch (method) {
        case 'totp':
          isValid = await this.verifyTOTP(code, decrypted.secret)
          break
        case 'sms':
          isValid = await this.verifySMS(code, decrypted.secret)
          break
        case 'email':
          isValid = await this.verifyEmail(code, decrypted.secret)
          break
      }

      await this.metrics.recordLatency(
        'mfa_verify',
        Date.now() - startTime
      )
      
      if (isValid) {
        await this.metrics.recordAuthSuccess('mfa_verify')
      } else {
        await this.metrics.recordAuthFailure('mfa_verify')
      }
      
      return isValid
    } catch (error) {
      await this.metrics.recordAuthFailure('mfa_verify')
      throw error
    }
  }

  // Private Methods
  private initializeClients(): void {
    if (this.config.providers.google) {
      this.googleClient = new OAuth2Client({
        clientId: this.config.providers.google.clientId,
        clientSecret: this.config.providers.google.clientSecret,
        redirectUri: this.config.providers.google.redirectUri
      })
    }

    if (this.config.providers.github) {
      this.githubClient = new GitHubClient({
        auth: {
          clientId: this.config.providers.github.clientId,
          clientSecret: this.config.providers.github.clientSecret
        }
      })
    }

    if (this.config.providers.microsoft) {
      this.microsoftClient = MicrosoftClient.init({
        authProvider: (done) => {
          done(null, this.config.providers.microsoft?.clientId!)
        }
      })
    }
  }

  private async syncUserWithKeycloak(
    provider: string,
    userData: any
  ): Promise<void> {
    // Implementation for syncing OAuth2 user data with Keycloak
  }

  private async setupTOTP(userId: string): Promise<MFASetup> {
    // Implementation for TOTP setup
    return {
      secret: '',
      qrCode: '',
      backupCodes: [],
      recoveryKeys: []
    }
  }

  private async setupSMS(userId: string): Promise<MFASetup> {
    // Implementation for SMS setup
    return {
      secret: '',
      qrCode: '',
      backupCodes: [],
      recoveryKeys: []
    }
  }

  private async setupEmail(userId: string): Promise<MFASetup> {
    // Implementation for Email setup
    return {
      secret: '',
      qrCode: '',
      backupCodes: [],
      recoveryKeys: []
    }
  }

  private async verifyTOTP(code: string, secret: string): Promise<boolean> {
    // Implementation for TOTP verification
    return false
  }

  private async verifySMS(code: string, secret: string): Promise<boolean> {
    // Implementation for SMS verification
    return false
  }

  private async verifyEmail(code: string, secret: string): Promise<boolean> {
    // Implementation for Email verification
    return false
  }
} 