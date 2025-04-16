import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
  licensePlate: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['Car', 'Motorcycle', 'Bus']
  },
  size: {
    type: String,
    enum: ['Motorcycle', 'Compact', 'Large']
  },
  spotsNeeded: {
    type: Number,
    required: true
  },
  isParked: {
    type: Boolean,
    default: false
  },
  level: {
    type: Number,
    default: null
  },
  spots: {
    type: [Number],
    default: []
  },
  parkedAt: {
    type: Date,
    default: null
  },
  exitedAt: {
    type: Date,
    default: null
  }
});

export default mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);