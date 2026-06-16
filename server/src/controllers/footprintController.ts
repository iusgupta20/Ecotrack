import { Response } from 'express';
import { Footprint } from '../models/Footprint';
import { User } from '../models/User';
import { ActivityLog } from '../models/ActivityLog';
import { calculateCarbonFootprint } from '../services/calculatorService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const validDietTypes = new Set(['vegan', 'vegetarian', 'mixed', 'heavy-meat']);
const validPlasticUsage = new Set(['low', 'medium', 'high']);

const isValidNonNegativeNumber = (value: unknown) => {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
};

const validateFootprintInputs = (inputs: any): string | null => {
  if (!inputs || typeof inputs !== 'object') {
    return 'Invalid footprint payload';
  }

  const { transport, energy, food, waste, water } = inputs;
  if (!transport || !energy || !food || !waste || !water) {
    return 'Missing required footprint sections';
  }

  const numericFields: Array<[unknown, string]> = [
    [transport.carKm, 'transport.carKm'],
    [transport.bikeKm, 'transport.bikeKm'],
    [transport.transitKm, 'transport.transitKm'],
    [transport.flightsHours, 'transport.flightsHours'],
    [transport.rideshareKm, 'transport.rideshareKm'],
    [energy.electricityKwh, 'energy.electricityKwh'],
    [energy.acHours, 'energy.acHours'],
    [energy.appliancesKwh, 'energy.appliancesKwh'],
    [water.dailyLiters, 'water.dailyLiters']
  ];

  for (const [value, field] of numericFields) {
    if (!isValidNonNegativeNumber(value)) {
      return `Invalid value for ${field}`;
    }
  }

  if (typeof waste.recycling !== 'boolean') {
    return 'Invalid value for waste.recycling';
  }

  if (!validDietTypes.has(food.dietType)) {
    return 'Invalid diet type';
  }

  if (!validPlasticUsage.has(waste.plasticUsage)) {
    return 'Invalid plastic usage';
  }

  return null;
};

export const saveFootprint = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const inputs = req.body;
    const validationError = validateFootprintInputs(inputs);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const calculatedData = calculateCarbonFootprint(inputs);

    const footprint = new Footprint({
      userId: req.userId,
      date: new Date(),
      ...calculatedData
    });

    await footprint.save();

    // Update User rewards
    const user = await User.findById(req.userId);
    if (user) {
      let pointsEarned = 50; // award 50 points for tracking footprint
      let newBadges: string[] = [];

      // Award "Green Starter" if it's their first footprint calculation
      if (!user.badges.includes('Green Starter')) {
        user.badges.push('Green Starter');
        newBadges.push('Green Starter');
        pointsEarned += 100; // bonus points for first tracking
      }

      // Check if user carbon score is high (>80) for Climate Champion
      if (calculatedData.score >= 80 && !user.badges.includes('Climate Champion')) {
        user.badges.push('Climate Champion');
        newBadges.push('Climate Champion');
        pointsEarned += 200;
      }

      user.points += pointsEarned;
      await user.save();

      // Log activity
      const activity = new ActivityLog({
        userId: req.userId,
        type: 'calculation',
        description: `Logged carbon footprint. Score: ${calculatedData.score}/100.`,
        pointsEarned,
        co2Saved: 0
      });
      await activity.save();

      if (newBadges.length > 0) {
        for (const badge of newBadges) {
          const badgeActivity = new ActivityLog({
            userId: req.userId,
            type: 'badge_earned',
            description: `Earned the "${badge}" badge!`,
            pointsEarned: 0,
            co2Saved: 0
          });
          await badgeActivity.save();
        }
      }
    }

    res.status(201).json(footprint);
  } catch (error: any) {
    res.status(500).json({ message: 'Error saving footprint details', error: error?.message });
  }
};

export const getHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const history = await Footprint.find({ userId: req.userId }).sort({ date: -1 }).limit(12);
    res.status(200).json(history);
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving footprint history', error: error?.message });
  }
};

export const getLatestFootprint = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const latest = await Footprint.findOne({ userId: req.userId }).sort({ date: -1 });
    if (!latest) {
      return res.status(404).json({ message: 'No footprint logs found' });
    }
    res.status(200).json(latest);
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving latest footprint', error: error?.message });
  }
};
