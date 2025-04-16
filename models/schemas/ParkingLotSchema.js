import mongoose from 'mongoose';

const SpotSchema = new mongoose.Schema({
  row: {
    type: Number,
    required: true
  },
  spotNumber: {
    type: Number,
    required: true
  },
  size: {
    type: String,
    enum: ['Motorcycle', 'Compact', 'Large'],
    required: true
  },
  isOccupied: {
    type: Boolean,
    default: false
  },
  vehicleId: {
    type: String,
    default: null
  }
}, { _id: false });

const LevelSchema = new mongoose.Schema({
  floorNumber: {
    type: Number,
    required: true
  },
  spots: {
    type: [SpotSchema],
    required: true
  },
  availableSpots: {
    type: Number,
    required: true
  }
}, { _id: false });

const ParkingLotSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: 'config'
  },
  levels: {
    type: [LevelSchema],
    required: true
  },
  totalSpots: {
    type: Number,
    required: true
  },
  availableSpots: {
    type: Number,
    required: true
  }
});

export default mongoose.models.ParkingLot || mongoose.model('ParkingLot', ParkingLotSchema);