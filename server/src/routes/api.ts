import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { saveFootprint, getHistory, getLatestFootprint } from '../controllers/footprintController';
import { getGoals, completeGoal, getLeaderboard, getActivityLogs } from '../controllers/goalController';
import { getAdvice, getSustainabilityReport } from '../controllers/coachController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// --- Auth Routes ---
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/profile', authMiddleware, getProfile);

// --- Footprint Routes ---
router.post('/footprint', authMiddleware, saveFootprint);
router.get('/footprint/history', authMiddleware, getHistory);
router.get('/footprint/latest', authMiddleware, getLatestFootprint);

// --- Goals & Gamification Routes ---
router.get('/goals', authMiddleware, getGoals);
router.post('/goals/:goalId/complete', authMiddleware, completeGoal);
router.get('/goals/leaderboard', authMiddleware, getLeaderboard);
router.get('/goals/activities', authMiddleware, getActivityLogs);

// --- AI Coach Routes ---
router.post('/coach/chat', authMiddleware, getAdvice);
router.get('/coach/report', authMiddleware, getSustainabilityReport);

export default router;
