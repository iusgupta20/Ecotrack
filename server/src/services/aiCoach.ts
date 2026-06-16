// AI Coach Service utilizing rules and Gemini API

interface ProfileData {
  transport: {
    carKm: number;
    bikeKm: number;
    transitKm: number;
    flightsHours: number;
    rideshareKm: number;
    co2: number;
  };
  energy: {
    electricityKwh: number;
    acHours: number;
    appliancesKwh: number;
    co2: number;
  };
  food: {
    dietType: string;
    co2: number;
  };
  waste: {
    recycling: boolean;
    plasticUsage: string;
    co2: number;
  };
  water: {
    dailyLiters: number;
    co2: number;
  };
  totalCo2: number;
  score: number;
}

// Fallback Expert Rules Engine
export const getRulesBasedAdvice = (profile: ProfileData): string => {
  const recommendations: string[] = [];

  // Transport advice
  if (profile.transport.carKm > 20) {
    const savings = Math.round(profile.transport.carKm * 30 * 0.18 * 0.4); // assume 40% reduction
    recommendations.push(
      `🚗 Your daily car mileage is quite high (${profile.transport.carKm} km/day). Switching to public transport or ridesharing just 2 days a week could reduce your carbon emissions by approximately ${savings} kg CO₂ per month.`
    );
  } else if (profile.transport.carKm > 0 && profile.transport.bikeKm === 0) {
    recommendations.push(
      `🚲 Consider replacing short car trips (under 3km) with cycling or walking. It has zero emissions and is great for health!`
    );
  }

  if (profile.transport.flightsHours > 10) {
    const savings = Math.round(profile.transport.flightsHours * 90 * 0.2);
    recommendations.push(
      `✈️ You have significant flight travel (${profile.transport.flightsHours} hours/year). Consider choosing direct flights, packing lighter, or offsetting your flights. A 20% reduction in flying could save around ${savings} kg CO₂ annually.`
    );
  }

  // Energy advice
  if (profile.energy.acHours > 4) {
    const savings = Math.round(profile.energy.acHours * 30 * 0.8 * 0.25); // assume 1 hour reduction daily
    recommendations.push(
      `❄️ Your AC runs for ${profile.energy.acHours} hours daily. Setting the thermostat to 24°C (75°F) instead of lower, or reducing usage by 1 hour daily, will save about ${savings} kg CO₂ per month on electricity bills.`
    );
  }

  if (profile.energy.electricityKwh > 250) {
    recommendations.push(
      `🔌 Your electricity consumption is ${profile.energy.electricityKwh} kWh/month. Unplugging appliances in standby mode ("vampire draw") and upgrading to LED bulbs can reduce your home energy footprint by up to 10%.`
    );
  }

  // Food advice
  if (profile.food.dietType === 'heavy-meat') {
    recommendations.push(
      `🥩 Switching from a heavy-meat diet to a mixed or vegetarian diet can cut your food-related emissions in half (saving up to 160 kg CO₂ per month). Try introducing a "Meatless Monday" routine!`
    );
  } else if (profile.food.dietType === 'mixed') {
    recommendations.push(
      `🥗 Your diet is mixed. Replacing one meat-based meal per day with a plant-based option (like beans, lentils, or tofu) can reduce your diet footprint by 20% (about 30 kg CO₂/month).`
    );
  }

  // Waste advice
  if (!profile.waste.recycling) {
    recommendations.push(
      `♻️ You do not currently recycle. Setting up a basic sorting bin for paper, plastics, and metals can reduce landfill waste emissions and save roughly 10 kg CO₂ per month.`
    );
  }

  if (profile.waste.plasticUsage === 'high') {
    recommendations.push(
      `🛍️ High plastic usage detected. Switching to reusable bags, water bottles, and avoiding single-use plastic packaging can save up to 20 kg CO₂ monthly and protect ecosystems.`
    );
  }

  // Water advice
  if (profile.water.dailyLiters > 250) {
    const savings = Math.round((profile.water.dailyLiters - 150) * 30 * 0.0005);
    recommendations.push(
      `💧 Your daily water usage is ${profile.water.dailyLiters} liters. Installing a low-flow showerhead and reducing shower times to 5 minutes can help you conserve hot water, saving about ${savings} kg CO₂ and hundreds of liters of water monthly.`
    );
  }

  if (recommendations.length === 0) {
    return "🌟 Outstanding job! Your carbon footprint is incredibly low across transport, energy, diet, and waste. Focus on maintaining your sustainable lifestyle and advocating for climate action in your community!";
  }

  return recommendations.join('\n\n');
};

const getCategoryCo2 = (profile: ProfileData, category: string): number => {
  if (category === 'transport') return profile.transport.co2;
  if (category === 'energy') return profile.energy.co2;
  if (category === 'food') return profile.food.co2;
  if (category === 'waste') return profile.waste.co2;
  if (category === 'water') return profile.water.co2;
  return 0;
};

// Generative AI Chat/Report Engine
export const askAiCoach = async (prompt: string, profile?: ProfileData): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // If no API key, use context-aware custom rules response
    let responseText = `👋 Hello! I am your EcoTrack AI Sustainability Coach.\n\n`;

    if (profile) {
      const highestEmissionCategory = getHighestEmissionCategory(profile);
      const categoryCo2 = getCategoryCo2(profile, highestEmissionCategory);
      responseText += `Based on your footprint analysis, your highest emissions come from **${highestEmissionCategory.toUpperCase()}** (${Math.round(categoryCo2)} kg CO₂/month).\n\n`;
      
      if (prompt.toLowerCase().includes('reduce') || prompt.toLowerCase().includes('tip') || prompt.toLowerCase().includes('help')) {
        responseText += `Here are personalized recommendations to target your emissions:\n\n` + getRulesBasedAdvice(profile);
      } else {
        responseText += `You asked: "${prompt}"\n\nHere are some helpful tips for your profile:\n- Try reducing AC usage by 1 hour daily.\n- Switch to public transport or bike for trips under 5km.\n- Adopt a plant-based diet for a few days a week.\n\nWhat category would you like to focus on optimizing today?`;
      }
    } else {
      responseText += `I can help you understand and reduce your carbon footprint. Try running a calculator check first, then ask me specific questions like:\n- "How can I reduce my transportation emissions?"\n- "What is the impact of a vegetarian diet?"\n- "How does recycling save carbon?"`;
    }

    return responseText;
  }

  try {
    const context = profile 
      ? `User profile: Monthly Carbon Footprint: ${profile.totalCo2} kg CO2, Score: ${profile.score}/100. Category breakdown: Transport: ${profile.transport.co2} kg CO2, Energy: ${profile.energy.co2} kg CO2, Food: ${profile.food.co2} kg CO2, Waste: ${profile.waste.co2} kg CO2, Water: ${profile.water.co2} kg CO2. Transport details: Car: ${profile.transport.carKm} km/day, Flights: ${profile.transport.flightsHours} hrs/year. Energy: Electricity: ${profile.energy.electricityKwh} kWh/mo, AC: ${profile.energy.acHours} hrs/day. Food: ${profile.food.dietType}. Waste: Recycling: ${profile.waste.recycling}, Plastic: ${profile.waste.plasticUsage}. Water: ${profile.water.dailyLiters} L/day.`
      : `User is looking for general sustainability advice.`;

    const requestBody = {
      contents: [{
        parts: [{
          text: `You are an expert Sustainability Coach. Assist the user with simple, encouraging, and highly actionable carbon footprint advice.
          
          ${context}
          
          User prompt: "${prompt}"
          
          Provide a structured, engaging, and professional response using markdown. Do not exceed 300 words. Keep it clear, positive, and focused on practical daily habit changes.`
        }]
      }]
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data: any = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error: any) {
    console.error('Error calling Gemini API:', error?.message || error);
    // Fallback to rules if API fails
    return `⚠️ (Gemini API Error - using fallback engine)\n\n` + (profile ? getRulesBasedAdvice(profile) : "Try checking your internet connection or API Key. In the meantime, focus on walking more and reducing energy use!");
  }
};

const getHighestEmissionCategory = (profile: ProfileData): string => {
  const categories = [
    { name: 'transport', co2: profile.transport.co2 },
    { name: 'energy', co2: profile.energy.co2 },
    { name: 'food', co2: profile.food.co2 },
    { name: 'waste', co2: profile.waste.co2 },
    { name: 'water', co2: profile.water.co2 }
  ];
  
  categories.sort((a, b) => b.co2 - a.co2);
  return categories[0].name;
};
