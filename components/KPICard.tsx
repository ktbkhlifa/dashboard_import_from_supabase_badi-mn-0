import React from 'react';

// L'interface dyal les props dyal l composant
interface KPICardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode; // Ghadi nsta3mlo React.ReactNode bach nkono kter مرونة
}

const KPICard: React.FC<KPICardProps> = ({ title, value, description, icon }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-start space-x-4">
      {/* Container dyal l'icône b lawn iftiradi, haka kan7ello l mochkil */}
      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </div>
  );
};

export default KPICard;
