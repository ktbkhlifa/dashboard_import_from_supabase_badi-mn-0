import { useState } from 'react';
import Header from './components/Header';
import PlantSelector from './components/PlantSelector';
import KPICard from './components/KPICard';
import { Icons } from './components/Icons';
import { useSupabaseData } from './hooks/useSupabaseData';
import { Simulation } from './types';
import LineChartComponent from './components/LineChartComponent';
import ChartCard from './components/ChartCard';
import { formatDate } from './lib/utils';
import { PowerOutputIcon, SolarIrradianceIcon, WindSpeedIcon, HumidityIcon } from './components/Icons';

function App() {
  const [selectedPlant, setSelectedPlant] = useState<string>('Asparagus');
  const [selectedDate, setSelectedDate] = useState<string>('2022-01-01');

  const { data, loading, error } = useSupabaseData(selectedPlant, selectedDate);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
  };

  const renderContent = () => {
    if (loading) {
      return <p className="text-center font-semibold text-lg mt-10">🔄 Loading data...</p>;
    }
    if (error) {
      return <p className="text-center text-red-600 bg-red-100 p-4 rounded-md mt-10">❌ Error: {error}</p>;
    }
    if (!data || !data.latestSimulation) {
      return <p className="text-center font-semibold text-lg mt-10">🤔 No data found for {selectedPlant}.</p>;
    }

    const latestSimulation = data.latestSimulation;
    const latestSensorData = data.latestSensorData;
    const liveHourlyData = data.liveHourlyData;

    return (
      <div id="dashboard-content">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KPICard
            title="Daily Production"
            value={latestSensorData?.daily_production_mwh ? `${latestSensorData.daily_production_mwh.toFixed(2)} MWh` : 'N/A'}
            icon={Icons.bolt()}
            description="Daily energy output"
          />
          <KPICard
            title="DLI Under Panels"
            value={`${(latestSimulation.dli_under_panels ?? 0).toFixed(2)} mol/m²/day`}
            icon={Icons.sun()}
            description="Daily Light Integral"
          />
           <KPICard
            title="Wind Speed"
            value={latestSensorData?.wind_speed ? `${latestSensorData.wind_speed.toFixed(2)} m/s` : 'N/A'}
            icon={Icons.bolt()}
            description="Live wind speed"
          />
          <KPICard
            title="Optimal Pitch"
            value={`${(latestSimulation.pitch_simulated ?? 0).toFixed(1)} m`}
            icon={Icons.bolt()}
            description="For this simulation"
          />
        </div>

        {/* Updated: Charts for live hourly data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Hourly Production & Irradiance">
             <LineChartComponent 
                  data={liveHourlyData}
                  xAxisKey="time"
                  lines={[
                      { key: 'ghi_agrivoltaic', name: 'Irradiance (W/m²)', color: '#f59e0b', yAxisId: 'left' },
                      { key: 'power_output_mw', name: 'Power Output (MW)', color: '#22c55e', yAxisId: 'right' },
                  ]}
             />
          </ChartCard>
          <ChartCard title="Live Temperature, Humidity & Wind">
              <LineChartComponent 
                  data={liveHourlyData}
                  xAxisKey="time"
                  lines={[
                      { key: 'relative_humidity', name: 'Humidity (%)', color: '#3b82f6', yAxisId: 'left' },
                      { key: 'wind_speed', name: 'Wind Speed (m/s)', color: '#94a3b8', yAxisId: 'right' },
                  ]}
              />
          </ChartCard>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header 
        selectedPlantName={data?.latestSimulation?.crop_name || selectedPlant} 
        onDateChange={handleDateChange}
        selectedDate={selectedDate}
        liveTime={data?.latestSensorData?.created_at}
      >
        {data?.plants.length > 0 && (
          <PlantSelector
            plants={data.plants}
            selectedPlant={selectedPlant}
            onPlantChange={setSelectedPlant}
          />
        )}
      </Header>
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-700 mb-6">Agrivoltaic Dashboard</h1>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
