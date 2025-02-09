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

container.register({
  config: asValue(config),
  securityService: asClass(SecurityService, { lifetime: Lifetime.SINGLETON }),
  metricsService: asClass(MetricsService, { lifetime: Lifetime.SINGLETON }),
  keycloakClient: asClass(KeycloakClient, { lifetime: Lifetime.SINGLETON })
})

export { container } 