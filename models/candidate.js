import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  }
}, {
  timestamps: true
});

// Add index for better query performance
candidateSchema.index({ email: 1 });
candidateSchema.index({ createdAt: -1 });

export default mongoose.model('Candidate', candidateSchema);