import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { 
  Car, Flame, Heart, Info, ArrowLeft, ArrowRight, Save, 
  Trash2, Droplet, CheckCircle 
} from 'lucide-react';

interface CalculatorProps {
  onSuccess?: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ onSuccess }) => {
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [carKm, setCarKm] = useState(0);
  const [bikeKm, setBikeKm] = useState(0);
  const [transitKm, setTransitKm] = useState(0);
  const [flightsHours, setFlightsHours] = useState(0);
  const [rideshareKm, setRideshareKm] = useState(0);

  const [electricityKwh, setElectricityKwh] = useState(150);
  const [acHours, setAcHours] = useState(2);
  const [appliancesKwh, setAppliancesKwh] = useState(50);

  const [dietType, setDietType] = useState<'vegan' | 'vegetarian' | 'mixed' | 'heavy-meat'>('mixed');

  const [recycling, setRecycling] = useState(false);
  const [plasticUsage, setPlasticUsage] = useState<'low' | 'medium' | 'high'>('medium');

  const [dailyLiters, setDailyLiters] = useState(150);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const inputs = {
      transport: { carKm, bikeKm, transitKm, flightsHours, rideshareKm },
      energy: { electricityKwh, acHours, appliancesKwh },
      food: { dietType },
      waste: { recycling, plasticUsage },
      water: { dailyLiters }
    };

    try {
      await api.post('/footprint', inputs);
      setSuccess(true);
      await refreshUser();
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to calculate footprint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setCarKm(0);
    setBikeKm(0);
    setTransitKm(0);
    setFlightsHours(0);
    setRideshareKm(0);
    setElectricityKwh(150);
    setAcHours(2);
    setAppliancesKwh(50);
    setDietType('mixed');
    setRecycling(false);
    setPlasticUsage('medium');
    setDailyLiters(150);
    setSuccess(false);
    setError('');
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md text-center space-y-4 my-12">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mx-auto animate-bounce">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Calculation Complete!</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Your footprint has been logged. We've awarded you points and updated your recommendations dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-8 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl space-y-6">
      {/* Step header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Carbon Footprint Calculator</h1>
          <p className="text-xs text-slate-400 mt-0.5">Let's gather details to calculate your monthly impact</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
          Step {step} of 5
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-emerald-500 h-full transition-all duration-300"
          style={{ width: `${(step / 5) * 100}%` }}
          aria-valuenow={(step / 5) * 100}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        ></div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      {/* Form Steps */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: TRANSPORTATION */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Car size={18} className="text-emerald-500" />
              Transportation Habits
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Daily Car Travel (km)</label>
                <input 
                  type="number" 
                  min="0"
                  value={carKm} 
                  onChange={(e) => setCarKm(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2.5 rounded border border-slate-350 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Daily Rideshare / Taxi (km)</label>
                <input 
                  type="number" 
                  min="0"
                  value={rideshareKm} 
                  onChange={(e) => setRideshareKm(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2.5 rounded border border-slate-350 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Daily Public Transport (km)</label>
                <input 
                  type="number" 
                  min="0"
                  value={transitKm} 
                  onChange={(e) => setTransitKm(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2.5 rounded border border-slate-350 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Daily Bicycle / Walk (km)</label>
                <input 
                  type="number" 
                  min="0"
                  value={bikeKm} 
                  onChange={(e) => setBikeKm(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2.5 rounded border border-slate-350 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Annual Flight Duration (Hours)</label>
              <input 
                type="number" 
                min="0"
                value={flightsHours} 
                onChange={(e) => setFlightsHours(Math.max(0, Number(e.target.value)))}
                className="w-full p-2.5 rounded border border-slate-350 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Includes short-haul and long-haul flights combined</span>
            </div>
          </div>
        )}

        {/* STEP 2: HOME ENERGY */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Flame size={18} className="text-emerald-500" />
              Household Energy Consumption
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Monthly Electricity Consumption (kWh)</label>
                <input 
                  type="number" 
                  min="0"
                  value={electricityKwh} 
                  onChange={(e) => setElectricityKwh(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2.5 rounded border border-slate-350 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Check your monthly utility bill for this value (Average: ~150-300 kWh)</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Daily Air Conditioner Usage (Hours)</label>
                <input 
                  type="number" 
                  min="0"
                  max="24"
                  value={acHours} 
                  onChange={(e) => setAcHours(Math.max(0, Math.min(24, Number(e.target.value))))}
                  className="w-full p-2.5 rounded border border-slate-350 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: FOOD HABITS */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Heart size={18} className="text-emerald-500" />
              Food & Diet Plan
            </h2>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-3">Which option best describes your diet?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { type: 'vegan', label: '🌱 Vegan', desc: 'No animal products' },
                  { type: 'vegetarian', label: '🥚 Vegetarian', desc: 'Dairy & eggs, no meat' },
                  { type: 'mixed', label: '🥗 Mixed / Average', desc: 'Moderate meat & veg' },
                  { type: 'heavy-meat', label: '🥩 High Meat', desc: 'Regular red meat/poultry' }
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setDietType(item.type as any)}
                    className={`p-4 rounded-xl border text-left transition ${
                      dietType === item.type 
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 text-slate-800 dark:text-white font-medium' 
                        : 'bg-transparent border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                    }`}
                  >
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: WASTE & PLASTICS */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Trash2 size={18} className="text-emerald-500" />
              Waste & Recycling
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Plastic usage rating</label>
                <div className="flex gap-4">
                  {[
                    { val: 'low', label: 'Low', desc: 'Avoid plastics, use bags' },
                    { val: 'medium', label: 'Medium', desc: 'Standard usage' },
                    { val: 'high', label: 'High', desc: 'Frequent bottles & packaging' }
                  ].map((rate) => (
                    <button
                      key={rate.val}
                      type="button"
                      onClick={() => setPlasticUsage(rate.val as any)}
                      className={`flex-1 p-3 rounded-lg border text-center transition ${
                        plasticUsage === rate.val 
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 text-slate-800 dark:text-white font-medium' 
                          : 'bg-transparent border-slate-200 dark:border-slate-800 hover:border-slate-350'
                      }`}
                    >
                      <span className="text-sm font-bold block">{rate.label}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{rate.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 block">Do you recycle?</span>
                  <span className="text-xs text-slate-400 mt-0.5 block">Paper, bottles, tins, organic compost sorting</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRecycling(!recycling)}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                    recycling ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-pressed={recycling}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform transform ${
                    recycling ? 'translate-x-6' : 'translate-x-0'
                  }`}></div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: WATER USAGE */}
        {step === 5 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Droplet size={18} className="text-emerald-500" />
              Water Consumption
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Daily Water Usage (Liters per person)</label>
                <input 
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={dailyLiters}
                  onChange={(e) => setDailyLiters(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>50L (Conservative)</span>
                  <span className="text-emerald-500 font-bold">{dailyLiters} Liters/day</span>
                  <span>500L (High usage)</span>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
                  <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <p>Includes average shower (approx 40-80L), flushing (6L per flush), sink usage, washing machine, and dishwasher cycles.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form navigation buttons */}
        <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1 || loading}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-sm transition flex items-center gap-1.5 disabled:opacity-30"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm transition flex items-center gap-1.5"
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save size={16} /> {loading ? 'Saving Metrics...' : 'Calculate Footprint'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Calculator;
