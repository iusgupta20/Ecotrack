import { Response } from 'express';
import { Footprint } from '../models/Footprint';
import { askAiCoach, getRulesBasedAdvice } from '../services/aiCoach';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getAdvice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    // Retrieve latest footprint profile if available
    const latestFootprint = await Footprint.findOne({ userId: req.userId }).sort({ date: -1 });

    const reply = await askAiCoach(prompt, latestFootprint as any || undefined);
    res.status(200).json({ reply });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving coach advice', error: error?.message });
  }
};

export const getSustainabilityReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const latestFootprint = await Footprint.findOne({ userId: req.userId }).sort({ date: -1 });

    if (!latestFootprint) {
      return res.status(200).json({
        report: "📊 No footprint data calculated yet! Run your first carbon footprint check in the Calculator tab to get custom reports."
      });
    }

    const reportText = getRulesBasedAdvice(latestFootprint as any);
    res.status(200).json({ report: reportText });
  } catch (error: any) {
    res.status(500).json({ message: 'Error generating sustainability report', error: error?.message });
  }
};
