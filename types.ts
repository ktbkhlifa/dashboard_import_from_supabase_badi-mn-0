// types.ts (Version Corrigée et Finale)
// Hada howa l'fichier li kaygoul l'application chno hiya la structure s7i7a dyal data

// L'interface dyal résumé dyal simulation
export interface Simulation {
  id: number;
  created_at: string;
  simulation_mode: string | null;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  panel_width: number | null;
  pivot_height: number | null;
  max_tilt: number | null;
  axis_azimuth: number | null;
  pitch_simulated: number | null;
  crop_name: string; // Hada darori ykoun
  water_savings_percent: number | null;
  dli_under_panels: number | null;
  dli_open_field: number | null;
  peak_temp_under_panels: number | null;
  peak_temp_open_field: number | null;
  et_under_panels_mm: number | null;
  et_open_field_mm: number | null;
}

// L'interface dyal data dyal kola sa3a (dyal les graphiques)
export interface HourlyData {
  id: number;
  simulation_id: number;
  timestamp: string;
  ghi_open_field: number | null;
  ghi_agrivoltaic: number | null;
  // === LA CORRECTION EST ICI ===
  // On utilise les noms corrects de la base de données
  temp_open_field: number | null;
  temp_agrivoltaic: number | null;
  wind_speed: number | null;
  relative_humidity: number | null;
  panel_tilt: number | null;
}

