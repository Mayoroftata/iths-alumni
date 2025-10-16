import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import Candidate from '../models/candidate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/iths-alumni')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// API Routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, position, email } = req.body;
    
    if (!name || !position || !email) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if already registered
    const existing = await Candidate.findOne({ email });
    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: `${name} has already registered for a position` 
      });
    }

    // Create new candidate
    const candidate = new Candidate({ name, position, email });
    await candidate.save();

    console.log('✅ New registration:', { name, email, position });

    res.json({ 
      success: true,
      message: 'Registration successful!',
      candidate 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again.' 
    });
  }
});

app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    console.error('Candidates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// HTML Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'dashboard.html'));
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

// Only start server if not in Vercel
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;