import { createContainer, asClass, asValue, InjectionMode, Lifetime } from 'awilix'

import { KeycloakClient } from './auth'
import { MetricsService } from './monitoring'
import { SecurityService } from './security'
import { config } from '../api/config'

export interface Container {
  securityService: SecurityService
  metricsService: MetricsService
  keycloakClient: KeycloakClient
  config: typeof config
}

const container = createContainer<Container>({
  injectionMode: InjectionMode.CLASSIC
})

// Register services in dependency order
container.register({
  config: asValue(config),
  metricsService: asClass(MetricsService, { lifetime: Lifetime.SINGLETON }),
  keycloakClient: asClass(KeycloakClient, { lifetime: Lifetime.SINGLETON }),
  securityService: asClass(SecurityService, {
    lifetime: Lifetime.SINGLETON,
    injectionMode: InjectionMode.CLASSIC,
    dependencies: ['config', 'metricsService']
  })
})

export { container } 