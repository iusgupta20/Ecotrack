import { Response } from 'express';
import { Goal } from '../models/Goal';
import { User } from '../models/User';
import { Footprint } from '../models/Footprint';
import { ActivityLog } from '../models/ActivityLog';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// Predefined catalog of goals by category
const GOAL_CATALOG = {
  transport: [
    { title: 'Public Transport Commute', description: 'Take public transit (bus or train) instead of driving for 2 days this week.', targetReduction: 12, points: 50 },
    { title: 'Bike to Work/School', description: 'Ride your bicycle for trips under 5km instead of driving.', targetReduction: 8, points: 60 },
    { title: 'Carpooling day', description: 'Share a ride with coworkers or friends for at least two commutes.', targetReduction: 6, points: 40 },
    { title: 'No-Drive Day', description: 'Leave your car parked for one full day and walk, cycle, or use transit.', targetReduction: 10, points: 70 }
  ],
  energy: [
    { title: 'Unplug Standby Devices', description: 'Unplug chargers, TVs, and appliances when not in use to eliminate vampire draw.', targetReduction: 4, points: 30 },
    { title: 'AC Control challenge', description: 'Turn off the AC 1 hour earlier than usual each day, or set the thermostat to 25°C.', targetReduction: 15, points: 60 },
    { title: 'Wash Clothes on Cold', description: 'Do all laundry loads using cold water settings to save heating energy.', targetReduction: 3, points: 30 },
    { title: 'Natural lighting', description: 'Rely purely on natural daylight for illumination during daytime hours.', targetReduction: 2, points: 20 }
  ],
  food: [
    { title: 'Meatless Weekdays', description: 'Go meat-free (vegetarian or vegan) from Monday to Friday.', targetReduction: 25, points: 80 },
    { title: 'Zero Food Waste', description: 'Plan meals carefully to ensure no edible food is thrown away this week.', targetReduction: 8, points: 50 },
    { title: 'Dairy Alternatives', description: 'Switch to plant-based milk (oat, soy, almond) instead of dairy milk this week.', targetReduction: 5, points: 40 },
    { title: 'Local produce only', description: 'Cook at least three meals using locally sourced, seasonal ingredients.', targetReduction: 6, points: 50 }
  ],
  waste: [
    { title: 'Zero Single-Use Plastic', description: 'Refuse all plastic bags, bottles, and straws. Carry reusable alternatives.', targetReduction: 7, points: 50 },
    { title: 'Composting Champion', description: 'Start sorting organic waste and compost your food scraps.', targetReduction: 10, points: 60 },
    { title: 'BYO Cup / Container', description: 'Bring your own travel mug or container when ordering takeaway food or coffee.', targetReduction: 4, points: 40 }
  ],
  water: [
    { title: '5-Minute Showers', description: 'Limit all showers to 5 minutes or less using a timer.', targetReduction: 5, points: 40 },
    { title: 'Fix Leaks & Save', description: 'Inspect and fix any dripping faucets or running toilets in your home.', targetReduction: 3, points: 30 },
    { title: 'Bucket Bath / Low Flow', description: 'Use a low-flow shower aerator or use a bucket for bathing to conserve hot water.', targetReduction: 6, points: 50 }
  ]
};

export const getGoals = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const today = new Date();
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Find active goals that haven't expired
    let activeGoals = await Goal.find({
      userId,
      weekEndDate: { $gte: today }
    });

    // If no active goals, generate a new batch for the week
    if (activeGoals.length === 0) {
      // Find user's latest footprint to target their high emission categories
      const latestFootprint: any = await Footprint.findOne({ userId }).sort({ date: -1 });

      let priorityCategories: ('transport' | 'energy' | 'food' | 'waste' | 'water')[] = ['transport', 'energy', 'food'];

      if (latestFootprint) {
        const categories = [
          { name: 'transport', co2: latestFootprint.transport?.co2 ?? 0 },
          { name: 'energy', co2: latestFootprint.energy?.co2 ?? 0 },
          { name: 'food', co2: latestFootprint.food?.co2 ?? 0 },
          { name: 'waste', co2: latestFootprint.waste?.co2 ?? 0 },
          { name: 'water', co2: latestFootprint.water?.co2 ?? 0 }
        ];
        // Sort descending by emissions
        categories.sort((a, b) => b.co2 - a.co2);
        priorityCategories = categories.slice(0, 3).map(c => c.name as any);
      }

      // Pick one random challenge from the catalog for each of the top 3 categories
      const newGoalsData = priorityCategories.map(category => {
        const catalogList = GOAL_CATALOG[category];
        const randomIndex = Math.floor(Math.random() * catalogList.length);
        const selected = catalogList[randomIndex];

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7); // 7 days from now

        return {
          userId,
          title: selected.title,
          category,
          description: selected.description,
          targetReduction: selected.targetReduction,
          points: selected.points,
          isCompleted: false,
          weekStartDate: new Date(),
          weekEndDate: endDate
        };
      });

      const insertedGoals = await Goal.insertMany(newGoalsData);
      activeGoals = insertedGoals as any;
    }

    res.status(200).json(activeGoals);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching/generating weekly goals', error: error?.message });
  }
};

export const completeGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { goalId } = req.params;

    const goal = await Goal.findOne({ _id: goalId, userId: req.userId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.isCompleted) {
      return res.status(400).json({ message: 'Goal is already marked completed' });
    }

    goal.isCompleted = true;
    goal.completedAt = new Date();
    await goal.save();

    // Award Points & Streak to User
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.points += goal.points;
    await user.save();

    // Log Activity
    const activity = new ActivityLog({
      userId: req.userId,
      type: 'goal_completed',
      description: `Completed goal: "${goal.title}"`,
      pointsEarned: goal.points,
      co2Saved: goal.targetReduction
    });
    await activity.save();

    // Check Badge milestones:
    // 1. "Eco Explorer" - Completed 3 goals
    // 2. "Carbon Saver" - Total carbon saved >= 50 kg
    // 3. "Net Zero Hero" - Total carbon saved >= 200 kg
    const completedGoalsCount = await Goal.countDocuments({ userId: req.userId, isCompleted: true });
    
    // Sum total CO2 saved
    const logs = await ActivityLog.find({ userId: req.userId, type: 'goal_completed' });
    const totalCo2Saved = logs.reduce((sum, log) => sum + (log.co2Saved || 0), 0);

    let badgesAdded: string[] = [];

    if (completedGoalsCount >= 3 && !user.badges.includes('Eco Explorer')) {
      user.badges.push('Eco Explorer');
      badgesAdded.push('Eco Explorer');
      user.points += 100;
    }

    if (totalCo2Saved >= 50 && !user.badges.includes('Carbon Saver')) {
      user.badges.push('Carbon Saver');
      badgesAdded.push('Carbon Saver');
      user.points += 150;
    }

    if (totalCo2Saved >= 200 && !user.badges.includes('Net Zero Hero')) {
      user.badges.push('Net Zero Hero');
      badgesAdded.push('Net Zero Hero');
      user.points += 300;
    }

    if (badgesAdded.length > 0) {
      await user.save();
      for (const badge of badgesAdded) {
        const badgeLog = new ActivityLog({
          userId: req.userId,
          type: 'badge_earned',
          description: `Earned "${badge}" Badge for sustainable achievements!`,
          pointsEarned: badge === 'Eco Explorer' ? 100 : badge === 'Carbon Saver' ? 150 : 300,
          co2Saved: 0
        });
        await badgeLog.save();
      }
    }

    res.status(200).json({ goal, user, badgesEarned: badgesAdded });
  } catch (error: any) {
    res.status(500).json({ message: 'Error completing goal', error: error?.message });
  }
};

export const getLeaderboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Select top 10 users ranked by points
    const topUsers = await User.find({}).sort({ points: -1 }).limit(10).select('name points streak badges');
    
    // Add mock users if the count is small to simulate a competitive leaderboard
    const baseLeaderboard = topUsers.map((u, i) => ({
      rank: i + 1,
      name: u.name,
      points: u.points,
      streak: u.streak,
      isCurrentUser: u._id.toString() === req.userId?.toString()
    }));

    const mockCompetitors = [
      { name: 'Greta Thunberg', points: 1250, streak: 15 },
      { name: 'David Attenborough', points: 980, streak: 8 },
      { name: 'Solar Sam', points: 450, streak: 4 },
      { name: 'Recycle Rachel', points: 320, streak: 3 },
      { name: 'Windpower Wendy', points: 210, streak: 2 }
    ];

    let combined = [...baseLeaderboard];
    
    // Add mock competitors if not already in list, then resort
    mockCompetitors.forEach(mock => {
      // Avoid duplication if mock name exists
      if (!combined.some(c => c.name === mock.name)) {
        combined.push({
          rank: 0,
          name: mock.name,
          points: mock.points,
          streak: mock.streak,
          isCurrentUser: false
        });
      }
    });

    combined.sort((a, b) => b.points - a.points);
    combined = combined.map((item, index) => ({ ...item, rank: index + 1 }));

    res.status(200).json(combined.slice(0, 10));
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving leaderboard details', error: error?.message });
  }
};

export const getActivityLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await ActivityLog.find({ userId: req.userId }).sort({ date: -1 }).limit(20);
    res.status(200).json(logs);
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving activity logs', error: error?.message });
  }
};
