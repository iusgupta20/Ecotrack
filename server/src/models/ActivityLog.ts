import { Schema, model } from 'mongoose';

const activityLogSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['calculation', 'goal_completed', 'badge_earned', 'quiz_completed']
  },
  description: {
    type: String,
    required: true
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  co2Saved: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const ActivityLog = model('ActivityLog', activityLogSchema);
export default ActivityLog;
