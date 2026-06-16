import { calculateCarbonFootprint } from '../src/services/calculatorService';

describe('Carbon Footprint Calculator Service', () => {
  test('should compute correct carbon emissions for standard mixed lifestyle', () => {
    const inputs = {
      transport: { carKm: 20, bikeKm: 0, transitKm: 10, flightsHours: 0, rideshareKm: 0 },
      energy: { electricityKwh: 200, acHours: 2, appliancesKwh: 0 },
      food: { dietType: 'mixed' as const },
      waste: { recycling: false, plasticUsage: 'medium' as const },
      water: { dailyLiters: 150 }
    };

    const results = calculateCarbonFootprint(inputs);

    // Car: 20 * 30 * 0.18 = 108 kg CO2
    // Transit: 10 * 30 * 0.04 = 12 kg CO2
    // Electricity: 200 * 0.45 = 90 kg CO2
    // AC: 2 * 30 * 0.8 = 48 kg CO2
    // Food (mixed): 150 kg CO2
    // Waste (medium, no recycling): 20 kg CO2
    // Water: 150 * 30 * 0.0005 = 2.25 kg CO2
    // Expected Total: 108 + 12 + 90 + 48 + 150 + 20 + 2.25 = 430.25 kg CO2
    expect(results.totalCo2).toBeCloseTo(430.3, 1);
    expect(results.score).toBe(71); // 100 - Math.round(430.3 / 15) = 100 - 29 = 71
    expect(results.treeEquivalent).toBe(Math.round(430.25 / 1.83)); // 235
  });

  test('should reflect reduction when recycling is enabled and plastic usage is low', () => {
    const inputs = {
      transport: { carKm: 0, bikeKm: 10, transitKm: 0, flightsHours: 0, rideshareKm: 0 },
      energy: { electricityKwh: 0, acHours: 0, appliancesKwh: 0 },
      food: { dietType: 'vegan' as const },
      waste: { recycling: true, plasticUsage: 'low' as const },
      water: { dailyLiters: 100 }
    };

    const results = calculateCarbonFootprint(inputs);

    // Transport = 0
    // Energy = 0
    // Food (vegan) = 60 kg CO2
    // Waste (low=10, recycling=true -> * 0.5) = 5 kg CO2
    // Water = 100 * 30 * 0.0005 = 1.5 kg CO2
    // Expected Total: 60 + 5 + 1.5 = 66.5 kg CO2
    expect(results.totalCo2).toBeCloseTo(66.5, 1);
    expect(results.score).toBe(96); // 100 - Math.round(66.5 / 15) = 100 - 4 = 96
  });

  test('should clamp score to 0 when emissions are excessively high', () => {
    const inputs = {
      transport: { carKm: 150, bikeKm: 0, transitKm: 0, flightsHours: 50, rideshareKm: 0 },
      energy: { electricityKwh: 800, acHours: 12, appliancesKwh: 0 },
      food: { dietType: 'heavy-meat' as const },
      waste: { recycling: false, plasticUsage: 'high' as const },
      water: { dailyLiters: 400 }
    };

    const results = calculateCarbonFootprint(inputs);
    expect(results.score).toBe(0);
  });

  test('should include appliance electricity in energy emissions', () => {
    const inputs = {
      transport: { carKm: 0, bikeKm: 0, transitKm: 0, flightsHours: 0, rideshareKm: 0 },
      energy: { electricityKwh: 100, acHours: 0, appliancesKwh: 50 },
      food: { dietType: 'vegan' as const },
      waste: { recycling: true, plasticUsage: 'low' as const },
      water: { dailyLiters: 100 }
    };

    const results = calculateCarbonFootprint(inputs);

    // Electricity + appliances = (100 + 50) * 0.45 = 67.5 kg CO2
    expect(results.energy.co2).toBeCloseTo(67.5, 1);
  });
});
