import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  Simulation,
  HourlyDataPoint,
  RealSensorData,
  AgrivoltaicData,
  LiveHourlyDataPoint,
} from '../types';

interface UseSupabaseDataState {
  data: AgrivoltaicData | null;
  loading: boolean;
  error: string | null;
}

export const useSupabaseData = (selectedPlant: string, selectedDate: string) => {
  const [state, setState] = useState<UseSupabaseDataState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isInitialLoad = true;

    const fetchData = async () => {
      if (isInitialLoad) {
        setState({ data: null, loading: true, error: null });
        isInitialLoad = false;
      }

      try {
        const [plantsResult, latestSimResult] = await Promise.all([
          supabase.rpc('get_unique_crop_names'),
          supabase
            .from('simulations')
            .select('*')
            .eq('crop_name', selectedPlant)
            .order('created_at', { ascending: false })
            .limit(1)
            .single(),
        ]);

        if (plantsResult.error) {
          throw new Error('Could not load plant list.');
        }

        const latestSimulation = latestSimResult.data as Simulation | null;
        if (latestSimResult.error && latestSimResult.status !== 406) {
          throw new Error(`Could not load simulation data for ${selectedPlant}.`);
        }

        if (!latestSimulation) {
          setState({
            data: {
              plants: plantsResult.data?.map((p: any) => p.crop_name) ?? [],
              latestSimulation: null,
              hourlyData: null,
              latestSensorData: null,
              liveHourlyData: null,
            },
            loading: false,
            error: null,
          });
          return;
        }

        const [hourlyDataResult, sensorDataResult] = await Promise.all([
          supabase
            .from('donnees_horaires')
            .select('*')
            .eq('simulation_id', latestSimulation.id)
            .order('timestamp', { ascending: true }),
          supabase
            .from('donnees_capteurs_reels')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single(),
        ]);

        const sensorDataForDateResult = await supabase
          .from('donnees_capteurs_reels')
          .select('created_at, power_output_mw, ghi_agrivoltaic, wind_speed, relative_humidity')
          .gte('created_at', selectedDate)
          .lt('created_at', `${selectedDate}T23:59:59Z`)
          .order('created_at', { ascending: true });

        if (hourlyDataResult.error) {
          throw new Error('Could not load hourly data.');
        }
        if (sensorDataResult.error && sensorDataResult.status !== 406) {
          throw new Error('Could not load real sensor data.');
        }
        if (sensorDataForDateResult.error) {
          throw new Error('Could not load live hourly data for the selected date.');
        }

        const liveHourlyData: LiveHourlyDataPoint[] = (sensorDataForDateResult.data as any[] || []).map(row => {
          const time = new Date(row.created_at).getUTCHours().toString().padStart(2, '0') + ':00';
          return {
            time,
            power_output_mw: row.power_output_mw,
            ghi_agrivoltaic: row.ghi_agrivoltaic,
            wind_speed: row.wind_speed,
            relative_humidity: row.relative_humidity,
          };
        });

        const combinedData: AgrivoltaicData = {
          plants: plantsResult.data?.map((p: any) => p.crop_name) ?? [],
          latestSimulation: latestSimulation,
          hourlyData: hourlyDataResult.data as HourlyDataPoint[],
          latestSensorData: sensorDataResult.data as RealSensorData,
          liveHourlyData: liveHourlyData,
        };

        setState({ data: combinedData, loading: false, error: null });

      } catch (e: any) {
        console.error('Data fetching error:', e);
        setState({ data: null, loading: false, error: e.message || 'An unknown error occurred' });
      }
    };

    fetchData();
    const refreshInterval = setInterval(fetchData, 3000);
    return () => clearInterval(refreshInterval);

  }, [selectedPlant, selectedDate]);

  return state;
};
