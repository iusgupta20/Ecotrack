import { Schema, model } from 'mongoose';

const footprintSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  transport: {
    carKm: { type: Number, default: 0 },
    bikeKm: { type: Number, default: 0 },
    transitKm: { type: Number, default: 0 },
    flightsHours: { type: Number, default: 0 },
    rideshareKm: { type: Number, default: 0 },
    co2: { type: Number, default: 0 } // in kg CO2 per month
  },
  energy: {
    electricityKwh: { type: Number, default: 0 },
    acHours: { type: Number, default: 0 },
    appliancesKwh: { type: Number, default: 0 },
    co2: { type: Number, default: 0 } // in kg CO2 per month
  },
  food: {
    dietType: { type: String, default: 'mixed' }, // vegan, vegetarian, mixed, heavy-meat
    co2: { type: Number, default: 0 }
  },
  waste: {
    recycling: { type: Boolean, default: false },
    plasticUsage: { type: String, default: 'medium' }, // low, medium, high
    co2: { type: Number, default: 0 }
  },
  water: {
    dailyLiters: { type: Number, default: 0 },
    co2: { type: Number, default: 0 }
  },
  totalCo2: {
    type: Number,
    required: true
  },
  treeEquivalent: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

export const Footprint = model('Footprint', footprintSchema);
export default Footprint;
