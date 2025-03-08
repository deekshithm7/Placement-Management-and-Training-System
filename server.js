// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./models/User');
const studentRoutes = require('./routes/addStudent');
const aptitudeTestRoutes = require('./routes/aptitudeTests');

const resourceRoutes = require('./routes/resourceRoutes');
const path = require('path');
const jobRoutes = require( './routes/jobRoutes.js');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/ptest' }),
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Passport config
passport.use(new LocalStrategy(  
  { usernameField: 'email' },
  async (email, password, done) => { 
    try {
      const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
      if (!user) return done(null, false, { message: 'User not found' });
      if (!user.registered) return done(null, false, { message: 'User not registered' });
      if (!user.password) return done(null, false, { message: 'No password set, please register' });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: 'Invalid credentials' });
      console.log(`[LOGIN SUCCESS] Email: ${email}, Role: ${user.role}`);
      return done(null, user);
    } catch (err) {
      console.error(`[LOGIN ERROR] Email: ${email}, Error: ${err.message}`);
      return done(err);
    }
  }
));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,  
  callbackURL: `http://localhost:${PORT}/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.findOne({ email: { $regex: new RegExp(`^${profile.emails[0].value}$`, 'i') } });
      if (user) {
        if (!user.registered) return done(null, false, { message: 'User not registered' });
        user.googleId = profile.id;
        await user.save();
      } else {
        return done(null, false, { message: 'Email not in allowed users list' });
      }
    }
    console.log(`[GOOGLE LOGIN SUCCESS] Email: ${user.email}, Role: ${user.role}`);
    return done(null, user);
  } catch (err) {
    console.error(`[GOOGLE LOGIN ERROR] Error: ${err.message}`);
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  console.log(`[SERIALIZE] User ID: ${user.id}`);
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    console.log(`[DESERIALIZE] User ID: ${id}, Found: ${user ? user.email : 'Not found'}`);
    done(null, user);
  } catch (err) {
    console.error(`[DESERIALIZE ERROR] ID: ${id}, Error: ${err.message}`);
    done(err);
  }
});

// Seed data
// Seed data
mongoose
  .connect(process.env.MONGO_URI || 'mongodb+srv://DEEKSHITH:deeku7208@cluster1.gbq6d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1')
  .then(async () => {
    console.log('MongoDB connected');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding users collection...');
      const salt = await bcrypt.genSalt(10);
      await User.insertMany([
        { name: 'Alice Smith', email: 'alice.student@gcek.ac.in', password: await bcrypt.hash('alicePass123', salt), role: 'Student', registered: true, registrationNumber: 'STU003', batch: 2022, semestersCompleted: 4, cgpa: 9.0, numberOfBacklogs: 0, branch: 'Mechanical' },
        { name: 'Bob Johnson', email: 'bob.alumni@gcek.ac.in', password: await bcrypt.hash('bobPass123', salt), role: 'Alumni', registered: true },
        { name: 'Carol Williams', email: 'carol.advisor@gcek.ac.in', password: await bcrypt.hash('carolPass123', salt), role: 'Advisor', registered: true, branch: 'Electrical' },
        { name: 'David Brown', email: 'david.coord@gcek.ac.in', password: await bcrypt.hash('davidPass123', salt), role: 'Coordinator', registered: true },
        { name: 'Eve Davis', email: 'eve.student@gcek.ac.in', password: null, role: 'Student', registered: false, registrationNumber: 'STU004', batch: 2024, branch: 'Civil' },
        { name: 'anto joji', email: '21b235@gcek.ac.in', password: null, role: 'Student', registered: false, registrationNumber: 'STU004', batch: 2024, branch: 'Cse' },
      ]);
      console.log('Users seeded successfully');
    }

    // Corrected seed for joneeta Johnson
    const salt = await bcrypt.genSalt(10); // Move this outside
    await User.insertMany([
      { name: 'rick morty', email: 'rickmorty@gcek.ac.in', password: await bcrypt.hash('123456', salt),role: 'Advisor', registered: true ,branch:'Cse'},
    ]);
  }).catch((err) => console.error('MongoDB connection error:', err));

  

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/students', studentRoutes);
app.use('/api/aptitude-tests', aptitudeTestRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/placement-drives', require('./routes/placementDrives'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));