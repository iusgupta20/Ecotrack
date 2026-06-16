interface CalculatorInputs {
  transport: {
    carKm: number;
    bikeKm: number;
    transitKm: number;
    flightsHours: number;
    rideshareKm: number;
  };
  energy: {
    electricityKwh: number;
    acHours: number;
    appliancesKwh: number;
  };
  food: {
    dietType: 'vegan' | 'vegetarian' | 'mixed' | 'heavy-meat';
  };
  waste: {
    recycling: boolean;
    plasticUsage: 'low' | 'medium' | 'high';
  };
  water: {
    dailyLiters: number;
  };
}

export const calculateCarbonFootprint = (inputs: CalculatorInputs) => {
  const { transport, energy, food, waste, water } = inputs;
  const asNonNegative = (value: number) => {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, value);
  };

  const carKm = asNonNegative(transport.carKm || 0);
  const bikeKm = asNonNegative(transport.bikeKm || 0);
  const transitKm = asNonNegative(transport.transitKm || 0);
  const flightsHours = asNonNegative(transport.flightsHours || 0);
  const rideshareKm = asNonNegative(transport.rideshareKm || 0);

  const electricityKwh = asNonNegative(energy.electricityKwh || 0);
  const acHours = asNonNegative(energy.acHours || 0);
  const appliancesKwh = asNonNegative(energy.appliancesKwh || 0);

  const dailyLiters = asNonNegative(water.dailyLiters || 0);

  // 1. Transport CO2 (monthly kg CO2)
  // Car: 0.18 kg CO2/km
  // Transit: 0.04 kg CO2/km
  // Rideshare: 0.12 kg CO2/km
  // Flights: 90 kg CO2/hour (divided by 12 to get monthly average)
  const carCo2 = carKm * 30 * 0.18;
  const transitCo2 = transitKm * 30 * 0.04;
  const rideshareCo2 = rideshareKm * 30 * 0.12;
  const flightsCo2 = (flightsHours * 90) / 12;
  const transportTotal = carCo2 + transitCo2 + rideshareCo2 + flightsCo2;

  // 2. Energy CO2 (monthly kg CO2)
  // Electricity & appliances: 0.45 kg CO2/kWh
  // AC: 0.8 kg CO2/hour
  const electricityCo2 = electricityKwh * 0.45;
  const appliancesCo2 = appliancesKwh * 0.45;
  const acCo2 = acHours * 30 * 0.8;
  const energyTotal = electricityCo2 + appliancesCo2 + acCo2;

  // 3. Food CO2 (monthly kg CO2)
  let foodTotal = 150; // mixed default
  if (food.dietType === 'vegan') foodTotal = 60;
  else if (food.dietType === 'vegetarian') foodTotal = 90;
  else if (food.dietType === 'heavy-meat') foodTotal = 250;

  // 4. Waste CO2 (monthly kg CO2)
  let wasteBase = 20; // medium default
  if (waste.plasticUsage === 'low') wasteBase = 10;
  else if (waste.plasticUsage === 'high') wasteBase = 40;
  const wasteTotal = wasteBase * (waste.recycling ? 0.5 : 1);

  // 5. Water CO2 (monthly kg CO2)
  // Water: 0.0005 kg CO2/liter
  const waterTotal = dailyLiters * 30 * 0.0005;

  // Totals
  const totalCo2 = transportTotal + energyTotal + foodTotal + wasteTotal + waterTotal;

  // 1 tree absorbs ~22 kg CO2 per year (so ~1.83 kg CO2 per month)
  const treeEquivalent = Math.round(totalCo2 / 1.83);

  // Score 0 to 100: Higher is better (less carbon)
  // The scale is intentionally curved so normal monthly footprints still
  // land in the high range while extreme emissions are penalized harder.
  // 0 kg CO2 = score 100, ~750 kg CO2 = score ~75, 1500+ kg CO2 = score 0.
  const normalized = totalCo2 / 1500;
  const score = Math.max(0, Math.min(100, Math.round(100 * (1 - Math.pow(normalized, 2)))));

  return {
    transport: {
      carKm,
      bikeKm,
      transitKm,
      flightsHours,
      rideshareKm,
      co2: Math.round(transportTotal * 10) / 10
    },
    energy: {
      electricityKwh,
      acHours,
      appliancesKwh,
      co2: Math.round(energyTotal * 10) / 10
    },
    food: {
      dietType: food.dietType,
      co2: foodTotal
    },
    waste: {
      recycling: waste.recycling,
      plasticUsage: waste.plasticUsage,
      co2: wasteTotal
    },
    water: {
      dailyLiters,
      co2: Math.round(waterTotal * 10) / 10
    },
    totalCo2: Math.round(totalCo2 * 10) / 10,
    treeEquivalent,
    score
  };
};
