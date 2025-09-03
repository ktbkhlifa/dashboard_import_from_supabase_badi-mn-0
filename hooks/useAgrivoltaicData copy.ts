import { useState, useMemo, useCallback, useEffect } from 'react';
import Papa from 'papaparse';
import { DailyData, HourlyDataPoint, AnnualMetrics, MonthlyData } from '../types';
import { formatDate } from '../lib/utils';

interface RawDataPoint {
    timestamp: string;
    ghi_agrivoltaic_w_m2: string;
    ghi_open_field_w_m2: string;
    temp_agrivoltaic_c: string;
    temp_open_field_c: string;
    wind_speed_m_s: string;
    relative_humidity_percent: string;
    soil_moisture: string;
    power_output: string;
    dli_agri: string;
    dli_open: string;
    et_open: string;
    et_agri: string;
    water_savings: string;
    daily_production: string;
}

const parseData = (data: RawDataPoint[]): Map<string, DailyData> => {
    const dailyDataMap = new Map<string, DailyData>();
    
    data.forEach(row => {
        if (!row.timestamp) {
            return;
        }

        const timestamp = new Date(row.timestamp.replace(' ', 'T').replace('+00:00', 'Z'));
        const dateStr = formatDate(timestamp);
        const timeStr = `${timestamp.getUTCHours().toString().padStart(2, '0')}:00`;

        if (isNaN(timestamp.getTime())) {
             return;
        }

        if (!dailyDataMap.has(dateStr)) {
            dailyDataMap.set(dateStr, {
                date: dateStr,
                hourly: [],
                dli: { openField: 0, agrivoltaic: 0 },
                forecast: "",
                recommendation: "",
                dailyProduction: parseFloat(row.daily_production),
            });
        }

        const dailyEntry = dailyDataMap.get(dateStr)!;
        
        const hourlyData: HourlyDataPoint = {
            time: timeStr,
            soilMoisture: parseFloat(row.soil_moisture),
            temperature: parseFloat(row.temp_agrivoltaic_c),
            humidity: parseFloat(row.relative_humidity_percent),
            solarIrradiance: parseFloat(row.ghi_agrivoltaic_w_m2),
            openFieldSolarIrradiance: parseFloat(row.ghi_open_field_w_m2),
            powerOutput: parseFloat(row.power_output),
            waterSavings: parseFloat(row.water_savings),
            windSpeed: parseFloat(row.wind_speed_m_s),
        };
        dailyEntry.hourly.push(hourlyData);
        
        if (timestamp.getUTCHours() === 23) {
             dailyEntry.dli = {
                openField: parseFloat(row.dli_open),
                agrivoltaic: parseFloat(row.dli_agri),
            };
        }
    });
    
    return dailyDataMap;
};

export const useAgrivoltaicData = (initialDate: string, plantId: string) => {
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [fullYearData, setFullYearData] = useState<Map<string, DailyData> | null>(null);
    const [annualMetrics, setAnnualMetrics] = useState<AnnualMetrics | null>(null);
    
    useEffect(() => {
        // Had la ligne li m'sawab w m'khdem
        const csvFilePath = `/${plantId}.csv`;
        
        Papa.parse(csvFilePath, {
            download: true,
            header: true,
            complete: (results) => {
                const parsedData = results.data as RawDataPoint[];
                const dailyMap = parseData(parsedData);
                setFullYearData(dailyMap);
                
                const avgDliUnderPanels = parsedData.reduce((sum, row) => sum + parseFloat(row.dli_agri || '0'), 0) / 365;
                const avgDliInOpenField = parsedData.reduce((sum, row) => sum + parseFloat(row.dli_open || '0'), 0) / 365;
                const totalEtOpen = parsedData.reduce((sum, row) => sum + parseFloat(row.et_open || '0'), 0);
                const totalEtAgri = parsedData.reduce((sum, row) => sum + parseFloat(row.et_agri || '0'), 0);
                const waterSavingsPercentage = (1 - (totalEtAgri / totalEtOpen)) * 100;
                
                setAnnualMetrics({
                    annualWaterSavingsPercentage: parseFloat(waterSavingsPercentage.toFixed(2)),
                    avgDliUnderPanels: parseFloat(avgDliUnderPanels.toFixed(2)),
                    avgDliInOpenField: parseFloat(avgDliInOpenField.toFixed(2))
                });
            },
            error: (err) => {
                console.error("Papa Parse error:", err);
            }
        });
    }, [plantId]);

    const dailyData = useMemo(() => {
        return fullYearData?.get(selectedDate);
    }, [selectedDate, fullYearData]);

    const cumulativeWaterSavings = useMemo(() => {
        if (!fullYearData) return [];
        const data = [];
        let cumulativeSavings = 0;
        const sortedKeys = Array.from(fullYearData.keys()).sort();
        
        for (const dateKey of sortedKeys) {
            const dayData = fullYearData.get(dateKey);
            if (dayData && dayData.hourly.length > 0) {
                const dailyWaterSavings = dayData.hourly[0].waterSavings;
                cumulativeSavings += dailyWaterSavings;
                data.push({
                    date: dateKey,
                    saved: parseFloat(cumulativeSavings.toFixed(2))
                });
            }
        }
        return data;
    }, [fullYearData]);

    const monthlyWaterSavings = useMemo((): MonthlyData[] => {
        if (!fullYearData) return [];
        const monthlyData: { [key: string]: number } = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
        for (const [dateStr, dayData] of fullYearData.entries()) {
            const monthIndex = new Date(dateStr).getUTCMonth();
            const monthName = monthNames[monthIndex];
            if (!monthlyData[monthName]) {
                monthlyData[monthName] = 0;
            }
            if (dayData.hourly.length > 0) {
                const dailyWaterSavings = dayData.hourly[0].waterSavings;
                monthlyData[monthName] += dailyWaterSavings;
            }
        }
        
        return monthNames.map(month => ({
            month,
            saved: parseFloat(monthlyData[month]?.toFixed(2) || '0')
        }));
    }, [fullYearData]);

    const hottestDayData = useMemo(() => {
        if (!fullYearData) return null;
        let maxTemp = -Infinity;
        let hottestDay: DailyData | null = null;
        
        const days = Array.from(fullYearData.values());
        if (days.length === 0) return null;
        
        for (const day of days) {
            const dailyMaxTemp = Math.max(...day.hourly.map(h => h.temperature));
            if (dailyMaxTemp > maxTemp) {
                maxTemp = dailyMaxTemp;
                hottestDay = day;
            }
        }
        
        return hottestDay;
    }, [fullYearData]);

    const summerSolsticeData = useMemo(() => {
        return fullYearData?.get('2022-06-21');
    }, [fullYearData]);

    const setDate = useCallback((date: string) => {
        if (fullYearData?.has(date)) {
            setSelectedDate(date);
        }
    }, [fullYearData]);
    
    return { selectedDate, setDate, dailyData, cumulativeWaterSavings, monthlyWaterSavings, hottestDayData, summerSolsticeData, annualMetrics, fullYearData };
};