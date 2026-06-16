import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { HelpCircle, Info, Leaf, Sparkles, TrendingDown } from 'lucide-react';

interface FootprintType {
  totalCo2: number;
  score: number;
  transport: { carKm: number; bikeKm: number; transitKm: number; flightsHours: number; rideshareKm: number; co2: number };
  energy: { electricityKwh: number; acHours: number; appliancesKwh: number; co2: number };
  food: { dietType: string; co2: number };
  waste: { recycling: boolean; plasticUsage: string; co2: number };
  water: { dailyLiters: number; co2: number };
}

export const Simulator: React.FC = () => {
  const [baseFootprint, setBaseFootprint] = useState<FootprintType | null>(null);
  
  // Sliders states
  const [carKm, setCarKm] = useState(20);
  const [transitKm, setTransitKm] = useState(10);
  const [flightsHours, setFlightsHours] = useState(5);
  const [electricityKwh, setElectricityKwh] = useState(200);
  const [acHours, setAcHours] = useState(3);
  const [dietType, setDietType] = useState<string>('mixed');
  const [recycling, setRecycling] = useState(false);
  const [plasticUsage, setPlasticUsage] = useState<string>('medium');
  const [dailyLiters, setDailyLiters] = useState(150);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestFootprint();
  }, []);

  const fetchLatestFootprint = async () => {
    try {
      const data = await api.get<FootprintType>('/footprint/latest');
      setBaseFootprint(data);
      
      // Init sliders with base data
      setCarKm(data.transport.carKm);
      setTransitKm(data.transport.transitKm);
      setFlightsHours(data.transport.flightsHours);
      setElectricityKwh(data.energy.electricityKwh);
      setAcHours(data.energy.acHours);
      setDietType(data.food.dietType);
      setRecycling(data.waste.recycling);
      setPlasticUsage(data.waste.plasticUsage);
      setDailyLiters(data.water.dailyLiters);
    } catch (err) {
      console.log('No latest footprint, using default values for simulator.');
      // Initialize with default global average
      const defaults: FootprintType = {
        totalCo2: 585,
        score: 61,
        transport: { carKm: 30, bikeKm: 0, transitKm: 10, flightsHours: 12, rideshareKm: 5, co2: 275 },
        energy: { electricityKwh: 200, acHours: 4, appliancesKwh: 50, co2: 186 },
        food: { dietType: 'mixed', co2: 150 },
        waste: { recycling: false, plasticUsage: 'medium', co2: 20 },
        water: { dailyLiters: 180, co2: 2.7 }
      };
      setBaseFootprint(defaults);
      setCarKm(30);
      setTransitKm(10);
      setFlightsHours(12);
      setElectricityKwh(200);
      setAcHours(4);
      setDietType('mixed');
      setRecycling(false);
      setPlasticUsage('medium');
      setDailyLiters(180);
    } finally {
      setLoading(false);
    }
  };

  // Live calculation based on sliders
  const calculateSimulatedCo2 = () => {
    const transportCo2 = (carKm * 30 * 0.18) + (transitKm * 30 * 0.04) + ((flightsHours * 90) / 12);
    const energyCo2 = (electricityKwh * 0.45) + (acHours * 30 * 0.8);
    
    let foodCo2 = 150;
    if (dietType === 'vegan') foodCo2 = 60;
    else if (dietType === 'vegetarian') foodCo2 = 90;
    else if (dietType === 'heavy-meat') foodCo2 = 250;

    let wasteBase = 20;
    if (plasticUsage === 'low') wasteBase = 10;
    else if (plasticUsage === 'high') wasteBase = 40;
    const wasteCo2 = wasteBase * (recycling ? 0.5 : 1);

    const waterCo2 = dailyLiters * 30 * 0.0005;

    const total = transportCo2 + energyCo2 + foodCo2 + wasteCo2 + waterCo2;
    return Math.round(total * 10) / 10;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-slate-500">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-medium">Setting up simulator sandbox...</p>
      </div>
    );
  }

  const baseCo2 = baseFootprint?.totalCo2 || 585;
  const simulatedCo2 = calculateSimulatedCo2();
  const savings = Math.max(0, Math.round((baseCo2 - simulatedCo2) * 10) / 10);
  const percentReduction = Math.max(0, Math.round((savings / baseCo2) * 100));
  const annualSavings = Math.round(savings * 12);
  const annualTrees = Math.round(annualSavings / 22); // 1 tree absorbs ~22kg CO2/year

  const chartData = [
    { name: 'Current Footprint', CO2: baseCo2, color: '#64748b' },
    { name: 'Simulated Footprint', CO2: simulatedCo2, color: '#10b981' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Intro Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Carbon Saving Simulator</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Adjust sliders to test alternative scenarios (e.g. cutting car trips, altering diets) and view simulated carbon reductions instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sliders Panel */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Adjust Your Lifestyle Sliders</h2>

          {/* Transport group */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Transportation</h3>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-350">Daily Car Travel: <b className="text-slate-800 dark:text-white">{carKm} km</b></span>
              </div>
              <input 
                type="range" min="0" max="150" step="5" value={carKm} 
                onChange={(e) => setCarKm(Number(e.target.value))}
                className="w-full accent-emerald-500" 
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-350">Daily Public Transit: <b className="text-slate-800 dark:text-white">{transitKm} km</b></span>
              </div>
              <input 
                type="range" min="0" max="150" step="5" value={transitKm} 
                onChange={(e) => setTransitKm(Number(e.target.value))}
                className="w-full accent-emerald-500" 
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-350">Annual Flights: <b className="text-slate-800 dark:text-white">{flightsHours} hours</b></span>
              </div>
              <input 
                type="range" min="0" max="100" step="2" value={flightsHours} 
                onChange={(e) => setFlightsHours(Number(e.target.value))}
                className="w-full accent-emerald-500" 
              />
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Energy Group */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Home Energy</h3>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-350">Monthly Electricity: <b className="text-slate-800 dark:text-white">{electricityKwh} kWh</b></span>
              </div>
              <input 
                type="range" min="0" max="1000" step="20" value={electricityKwh} 
                onChange={(e) => setElectricityKwh(Number(e.target.value))}
                className="w-full accent-emerald-500" 
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-350">Daily AC Usage: <b className="text-slate-800 dark:text-white">{acHours} hours</b></span>
              </div>
              <input 
                type="range" min="0" max="24" step="1" value={acHours} 
                onChange={(e) => setAcHours(Number(e.target.value))}
                className="w-full accent-emerald-500" 
              />
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Diet, Waste & Water */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dietary Selection</h3>
              <select 
                value={dietType} 
                onChange={(e) => setDietType(e.target.value)}
                className="w-full p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-200"
              >
                <option value="vegan">🌱 Vegan (No meat/dairy)</option>
                <option value="vegetarian">🥚 Vegetarian (No meat)</option>
                <option value="mixed">🥗 Mixed / Average Diet</option>
                <option value="heavy-meat">🥩 Heavy Red Meat Diet</option>
              </select>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Plastic Usage</h3>
              <select 
                value={plasticUsage} 
                onChange={(e) => setPlasticUsage(e.target.value)}
                className="w-full p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-200"
              >
                <option value="low">Low (Zero single-use)</option>
                <option value="medium">Medium (Standard plastic)</option>
                <option value="high">High (Bottled water & takeout)</option>
              </select>
            </div>

            <div className="space-y-3 flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Recycling bin</span>
                <span className="text-[10px] text-slate-400">Sort papers and glass</span>
              </div>
              <button
                onClick={() => setRecycling(!recycling)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${recycling ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform transform ${recycling ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Daily Water: {dailyLiters}L</span>
              <input 
                type="range" min="50" max="500" step="25" value={dailyLiters} 
                onChange={(e) => setDailyLiters(Number(e.target.value))}
                className="w-full accent-emerald-500" 
              />
            </div>
          </div>
        </div>

        {/* Results Sidebar Panel */}
        <div className="lg:col-span-5 space-y-8">
          {/* Main simulator comparisons metrics card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles size={20} className="text-yellow-300 fill-yellow-300" />
              Simulated Reduction
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/10">
                <span className="text-xs text-emerald-100 block">Monthly Savings</span>
                <span className="text-2xl font-bold block mt-1">{savings} kg</span>
                <span className="text-[10px] text-emerald-200">CO₂ avoided / month</span>
              </div>

              <div className="p-4 rounded-xl bg-white/10">
                <span className="text-xs text-emerald-100 block">Reduction Percent</span>
                <span className="text-2xl font-bold block mt-1 flex items-center gap-1.5">
                  <TrendingDown size={20} className="text-yellow-300" />
                  {percentReduction}%
                </span>
                <span className="text-[10px] text-emerald-200">Lower than current</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-yellow-300">
                <Leaf size={24} />
              </div>
              <div>
                <span className="text-xs text-emerald-100 block">Annual Net Impact</span>
                <p className="text-sm font-semibold mt-0.5">
                  Save {annualSavings} kg CO₂ / year. Equivalent to planting <strong className="text-yellow-300">{annualTrees} trees</strong>!
                </p>
              </div>
            </div>

            {/* Quick reset button */}
            <button
              onClick={fetchLatestFootprint}
              className="w-full py-2.5 rounded-lg bg-white text-emerald-800 font-semibold text-xs hover:bg-emerald-50 transition shadow-sm"
            >
              Reset to Current Settings
            </button>
          </div>

          {/* Side by side chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4">Emissions Comparison (kg CO₂)</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" />
                  <Tooltip formatter={(value) => [`${value} kg CO₂`, 'Monthly Footprint']} />
                  <Bar dataKey="CO2" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
