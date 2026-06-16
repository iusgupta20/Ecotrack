import { Schema, model } from 'mongoose';

const goalSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['transport', 'energy', 'food', 'waste', 'water']
  },
  description: {
    type: String,
    required: true
  },
  targetReduction: {
    type: Number, // in kg CO2 saved
    required: true
  },
  points: {
    type: Number,
    required: true,
    default: 50
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  weekStartDate: {
    type: Date,
    default: Date.now
  },
  weekEndDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

export const Goal = model('Goal', goalSchema);
export default Goal;
