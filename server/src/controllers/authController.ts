import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const normalizeName = (name: string) => name.trim();

const isStrongPassword = (password: string) => {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
};

const buildUserResponse = (user: { _id: any; name: string; email: string; points: number; streak: number; badges: string[] }) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  points: user.points,
  streak: user.streak,
  badges: user.badges
});

export const register = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const sanitizedName = typeof name === 'string' ? normalizeName(name) : '';
    const sanitizedEmail = typeof email === 'string' ? normalizeEmail(email) : '';

    if (!sanitizedName || !sanitizedEmail || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and include at least one letter and one number'
      });
    }

    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      points: 0,
      streak: 0,
      badges: []
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      getJwtSecret(),
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: buildUserResponse(user)
    });
  } catch (error: any) {
    console.error('Server error during registration:', error);
    res.status(500).json({ message: 'Server error during registration', error: error?.message });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    const sanitizedEmail = typeof email === 'string' ? normalizeEmail(email) : '';

    if (!sanitizedEmail || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check and update streak (if logged in on consecutive days)
    const today = new Date();
    const lastActive = new Date(user.lastActive);
    const diffTime = Math.abs(today.getTime() - lastActive.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      user.streak += 1;
    } else if (diffDays > 1) {
      user.streak = 1; // reset streak if gap > 1 day
    } else if (user.streak === 0) {
      user.streak = 1;
    }

    user.lastActive = today;
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      getJwtSecret(),
      { expiresIn: '30d' }
    );

    res.status(200).json({
      token,
      user: buildUserResponse(user)
    });
  } catch (error: any) {
    console.error('Server error during login:', error);
    res.status(500).json({ message: 'Server error during login', error: error?.message });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error retrieving profile', error: error?.message });
  }
};
