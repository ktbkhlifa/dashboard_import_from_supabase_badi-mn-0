import React, { useMemo, useState } from 'react';
import Header from './components/Header';
import ChartCard from './components/ChartCard';
import LineChartComponent from './components/LineChartComponent';
import BarChartComponent from './components/BarChartComponent';
import ForecastCard from './components/ForecastCard';
import AnalysisCard from './components/AnalysisCard';
import PlantSelector from './components/PlantSelector';
import KPICard from './components/KPICard';
import { WaterSavingsIcon, SolarIrradianceIcon, PowerOutputIcon, WindSpeedIcon, HumidityIcon } from './components/Icons';
import { useAgrivoltaicData } from './hooks/useAgrivoltaicData';
import { formatDate } from './lib/utils';
import { KPI } from './types';
import { generateTempComment, generateDliComment, generateWaterComment } from './lib/commentGenerator';
import { generateDailyForecast, generateRecommendations } from './lib/forecastGenerator';

const App: React.FC = () => {
    // Had l'liste dyal les plantes m'qada bach t'matchi m3a smiyat dyal les fichiers dyalek
    const plants = [
        { id: 'Asparagus', name: 'Asparagus' },
        { id: 'Lettuce', name: 'Lettuce' },
        { id: 'Spinach', name: 'Spinach' },
        { id: 'Basil', name: 'Basil' },
        { id: 'tomato', name: 'Tomato' },
    ];
    
    const [selectedPlant, setSelectedPlant] = useState('Asparagus'); 
    const { selectedDate, setDate, dailyData, cumulativeWaterSavings, monthlyWaterSavings, hottestDayData, summerSolsticeData, annualMetrics, fullYearData } = useAgrivoltaicData(formatDate(new Date('2022-07-15')), selectedPlant);
    const [waterSavingsView, setWaterSavingsView] = useState<'cumulative' | 'monthly'>('cumulative');

    const kpiData: KPI[] = useMemo(() => {
        const dailyTotalProduction = dailyData?.dailyProduction || 0;
        const peakSolarIrradiance = Math.max(...(dailyData?.hourly.map(h => h.solarIrradiance) || [0]));
        const avgWindSpeed = dailyData?.hourly.reduce((sum, h) => sum + h.windSpeed, 0) / (dailyData?.hourly.length || 1) || 0;
        const avgHumidity = dailyData?.hourly.reduce((sum, h) => sum + h.humidity, 0) / (dailyData?.hourly.length || 1) || 0;
        
        return [
            { title: 'Daily Production', value: `${dailyTotalProduction.toFixed(2)} MWh`, icon: <PowerOutputIcon />, color: 'bg-green-500' },
            { title: 'Solar Irradiance', value: `${peakSolarIrradiance.toFixed(0)} W/m²`, icon: <SolarIrradianceIcon />, color: 'bg-amber-500' },
            { title: 'Wind Speed', value: `${avgWindSpeed.toFixed(1)} m/s`, icon: <WindSpeedIcon />, color: 'bg-sky-500' },
            { title: 'Humidity', value: `${avgHumidity.toFixed(0)}%`, icon: <HumidityIcon />, color: 'bg-indigo-500' },
        ];
    }, [dailyData]);

    const dliChartData = useMemo(() => {
        if (!dailyData) return [];
        return [
            { name: 'Open Field', value: parseFloat(dailyData.dli.openField.toFixed(2)) },
            { name: 'Agrivoltaic', value: parseFloat(dailyData.dli.agrivoltaic.toFixed(2)) },
        ];
    }, [dailyData]);
    
    const powerChartData = useMemo(() => {
        if (!dailyData) return [];
        return dailyData.hourly.map(h => ({
            ...h,
            powerOutput: h.powerOutput,
        }));
    }, [dailyData]);

    const analysisComments = useMemo(() => {
        if (!annualMetrics || !dailyData || !fullYearData) {
            return [];
        }

        const waterComment = generateWaterComment(
            annualMetrics.annualWaterSavingsPercentage,
            annualMetrics.avgDliInOpenField,
            annualMetrics.avgDliUnderPanels
        );

        const tempComment = generateTempComment(dailyData);
        const dliComment = generateDliComment(dailyData, annualMetrics);

        return [waterComment, tempComment, dliComment];

    }, [annualMetrics, dailyData, fullYearData]);

    const dailyForecast = useMemo(() => {
        if (!dailyData) return '';
        return generateDailyForecast(dailyData.hourly);
    }, [dailyData]);

    const dailyRecommendation = useMemo(() => {
        if (!dailyData) return '';
        return generateRecommendations(dailyData.hourly);
    }, [dailyData]);

    if (!dailyData || !hottestDayData || !summerSolsticeData || !annualMetrics || !fullYearData) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                Loading data...
            </div>
        );
    }

    const waterSavingsChartTitle = waterSavingsView === 'cumulative' ? 'Cumulative Water Savings (mm)' : 'Monthly Water Savings (mm)';
    const monthlyBarData = monthlyWaterSavings.map(m => ({ name: m.month, value: m.saved }));

    return (
        <main className="p-4 sm:p-6 bg-slate-100 dark:bg-slate-900 min-h-screen font-sans">
            <div id="dashboard-content">
                <Header selectedDate={selectedDate} onDateChange={setDate} >
                    <PlantSelector
                        plants={plants}
                        selectedPlant={selectedPlant}
                        onSelect={setSelectedPlant}
                    />
                </Header>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {kpiData.map(kpi => <KPICard key={kpi.title} kpi={kpi} />)}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <ChartCard title="Power & Irradiance">
                       <LineChartComponent 
                            data={powerChartData}
                            xAxisKey="time"
                            lines={[
                                { key: 'solarIrradiance', name: 'Irradiance (W/m²)', color: '#f59e0b', yAxisId: 'left' },
                                { key: 'powerOutput', name: 'Power Output (MW)', color: '#22c55e', yAxisId: 'right' },
                            ]}
                       />
                    </ChartCard>
                     <ChartCard title="Temperature & Humidity">
                        <LineChartComponent 
                                data={dailyData.hourly}
                                xAxisKey="time"
                                lines={[
                                    { key: 'temperature', name: 'Temperature (°C)', color: '#ef4444' },
                                    { key: 'humidity', name: 'Humidity (%)', color: '#3b82f6' },
                                ]}
                           />
                    </ChartCard>
                </div>
                
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <ChartCard title="Summer Solstice Irradiance">
                        <LineChartComponent
                            data={summerSolsticeData.hourly}
                            xAxisKey="time"
                            lines={[
                                { key: 'openFieldSolarIrradiance', name: 'Open Field (W/m²)', color: '#f97316' },
                                { key: 'solarIrradiance', name: 'Agrivoltaic Field (W/m²)', color: '#f59e0b' },
                            ]}
                       />
                    </ChartCard>
                     <ChartCard title={`Temperature on Hottest Day (${hottestDayData.date})`}>
                        <LineChartComponent
                            data={hottestDayData.hourly}
                            xAxisKey="time"
                            lines={[
                                { key: 'temperature', name: 'Temperature (°C)', color: '#dc2626' },
                            ]}
                        />
                    </ChartCard>
                    <ChartCard title="Daily Light Integral (DLI)">
                        <BarChartComponent data={dliChartData} colors={['#f59e0b', '#3b82f6']} />
                    </ChartCard>
                 </div>

                <div className="grid grid-cols-1 gap-6 mb-6">
                    <ChartCard title={waterSavingsChartTitle}>
                         <div className="flex justify-end mb-2 space-x-1">
                            <button onClick={() => setWaterSavingsView('cumulative')} className={`px-2 py-1 text-xs rounded ${waterSavingsView === 'cumulative' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Cumulative</button>
                            <button onClick={() => setWaterSavingsView('monthly')} className={`px-2 py-1 text-xs rounded ${waterSavingsView === 'monthly' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Monthly</button>
                        </div>
                        {waterSavingsView === 'cumulative' ? (
                             <LineChartComponent 
                                data={cumulativeWaterSavings}
                                xAxisKey="date"
                                lines={[{ key: 'saved', name: 'Total Savings (mm)', color: '#3b82f6' }]}
                            />
                        ) : (
                            <BarChartComponent data={monthlyBarData} colors={['#3b82f6']} />
                        )}
                    </ChartCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <AnalysisCard analyses={analysisComments} />
                    </div>
                    <div className="space-y-6">
                        <ForecastCard forecast={dailyForecast} recommendation={dailyRecommendation} />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default App;