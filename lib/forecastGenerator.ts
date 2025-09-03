import { AnnualMetrics } from '../types';

// On ajoute le mot-clé "export" ici pour rendre le type Forecast utilisable
export interface Forecast {
  next_day_dli: { value: number; trend: 'up' | 'down' | 'stable' };
  next_week_water_savings: { value: number; trend: 'up' | 'down' | 'stable' };
}

// On ajoute le mot-clé "export" ici pour rendre la fonction utilisable
export function generateForecast(metrics: AnnualMetrics): Forecast {
  // Simple pseudo-random forecast for demonstration
  const next_day_dli_value = metrics.dli_agri * (1 + (Math.random() - 0.5) * 0.1); // +/- 5% variation
  const next_week_water_savings_value = (metrics.total_water_saved_mm / 52) * (1 + (Math.random() - 0.5) * 0.2); // +/- 10% variation

  return {
    next_day_dli: {
      value: next_day_dli_value,
      trend: next_day_dli_value > metrics.dli_agri ? 'up' : 'down',
    },
    next_week_water_savings: {
      value: next_week_water_savings_value,
      trend: next_week_water_savings_value > (metrics.total_water_saved_mm / 52) ? 'up' : 'stable',
    },
  };
}
