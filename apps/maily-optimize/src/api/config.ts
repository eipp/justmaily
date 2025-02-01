import { OptimizationService } from '../services/optimization.service';

export interface APIConfig {
  optimizationService: OptimizationService;
  port: number;
}

export const loadConfig = (): APIConfig => {
  const port = parseInt(process.env.PORT || '3002', 10); // Default port for maily-optimize service
  const optimizationService = new OptimizationService();

  return {
    optimizationService,
    port,
  };
};