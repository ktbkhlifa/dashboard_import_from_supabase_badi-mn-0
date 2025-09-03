import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Header from './components/Header';
import PlantSelector from './components/PlantSelector';
import KPICard from './components/KPICard';
import { Icons } from './components/Icons';
import { Simulation } from './types';

function App() {
  const [plants, setPlants] = useState<string[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<string>('');
  const [latestSimulation, setLatestSimulation] = useState<Simulation | null>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [noDataFound, setNoDataFound] = useState<boolean>(false);

  // L'useEffect l'asli li kayjib la liste o akhir simulation
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingSummary(true);
      setError(null);
      setNoDataFound(false);

      const { data: plantsData, error: plantsError } = await supabase.rpc('get_unique_crop_names');

      if (plantsError) {
        setError('Could not load plant list from the database.');
        setLoadingSummary(false);
        return;
      }
      
      const uniquePlants = plantsData?.map((p: any) => p.crop_name).filter(Boolean) ?? [];
      setPlants(uniquePlants);

      if (uniquePlants.length > 0) {
        const { data: latestSimData, error: latestSimError } = await supabase
          .from('simulations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (latestSimError) {
          setError('Could not load the latest simulation data.');
        } else if (latestSimData) {
          setSelectedPlant(latestSimData.crop_name);
          setLatestSimulation(latestSimData);
        }
      } else {
        setNoDataFound(true);
      }
      setLoadingSummary(false);
    };

    fetchInitialData();
  }, []);

  // L'useEffect li kayjib data mli kan'beddlo l'plante
  useEffect(() => {
    if (!selectedPlant || (latestSimulation && latestSimulation.crop_name === selectedPlant)) return;
    
    const fetchSimulationForPlant = async () => {
      setLoadingSummary(true);
      const { data, error } = await supabase
        .from('simulations')
        .select('*')
        .eq('crop_name', selectedPlant)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        setError(`Could not load simulation data for ${selectedPlant}.`);
        setLatestSimulation(null);
      } else {
        setLatestSimulation(data);
      }
      setLoadingSummary(false);
    };

    fetchSimulationForPlant();
  }, [selectedPlant]);

  // Fonction jdida dyal l'affichage (mbssṭa)
  const renderContent = () => {
    if (loadingSummary) return <p className="text-center font-semibold text-lg mt-10">🔄 Loading simulation summary...</p>;
    if (error) return <p className="text-center text-red-600 bg-red-100 p-4 rounded-md mt-10">❌ Error: {error}</p>;
    if (noDataFound) return <div className="text-center mt-10"><p className="text-xl font-semibold">No simulation data found.</p></div>;
    if (!latestSimulation) return <p className="text-center font-semibold text-lg mt-10">🤔 No simulation found for {selectedPlant}.</p>;

    // Hna kan'affichiw ghir les KPIs
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <KPICard title="Water Savings" value={`${(latestSimulation.water_savings_percent ?? 0).toFixed(2)}%`} icon={Icons.droplet()} description="Annual water savings" />
        <KPICard title="Peak Temp. Reduction" value={`${((latestSimulation.peak_temp_open_field ?? 0) - (latestSimulation.peak_temp_under_panels ?? 0)).toFixed(2)}°C`} icon={Icons.thermometer()} description="Cooling effect" />
        <KPICard title="DLI Under Panels" value={`${(latestSimulation.dli_under_panels ?? 0).toFixed(2)}`} icon={Icons.sun()} description="mol/m²/day" />
        <KPICard title="Optimal Pitch" value={`${(latestSimulation.pitch_simulated ?? 0).toFixed(1)} m`} icon={Icons.bolt()} description="For this simulation" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-700">Agrivoltaic Dashboard</h1>
          {plants.length > 0 && selectedPlant && (
            <PlantSelector
              plants={plants}
              selectedPlant={selectedPlant}
              onPlantChange={setSelectedPlant}
            />
          )}
        </div>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;