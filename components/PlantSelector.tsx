// On définit les types pour les props du composant
interface PlantSelectorProps {
  plants: string[];
  selectedPlant: string;
  onPlantChange: (plant: string) => void;
}

// Le composant est une fonction qui prend ces props
const PlantSelector = ({ plants, selectedPlant, onPlantChange }: PlantSelectorProps) => {
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="plant-select" className="font-semibold text-gray-700">
        Crop:
      </label>
      <select
        id="plant-select"
        value={selectedPlant}
        onChange={(e) => onPlantChange(e.target.value)}
        className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      >
        {plants.map((plant) => (
          <option key={plant} value={plant}>
            {plant}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PlantSelector;

