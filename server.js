require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./pmts0-186c0-firebase-adminsdk-fbsvc-693468005c.json');
const User = require('./models/User');
const AllowedEmail = require('./models/AllowedEmail');

const app = express();

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin initialized successfully');
} catch (err) {
  console.error('Firebase Admin initialization failed:', err);
}

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ptest')
  .then(async () => {
    console.log('MongoDB connected');

    // Seed allowedEmails if empty
    const allowedCount = await AllowedEmail.countDocuments();
    if (allowedCount === 0) {
      console.log('Seeding allowedEmails collection...');
      await AllowedEmail.insertMany([
        { email: "student@gcek.ac.in", role: "Student", addedAt: new Date() },
        { email: "alumni@gmail.com", role: "Alumni", addedAt: new Date() },
        { email: "coord@gcek.ac.in", role: "Coordinator", addedAt: new Date() },
        { email: "advisor@gcek.ac.in", role: "Advisor", addedAt: new Date() }
      ]);
      console.log('allowedEmails seeded successfully');
    }

    // Seed default users for all roles
    const defaultUsers = [
      {
        email: 'student@gcek.ac.in',
        password: 'studentPass123',
        role: 'Student',
      },
      {
        email: 'alumni@gmail.com',
        password: 'alumniPass123',
        role: 'Alumni',
      },
      {
        email: 'coord@gcek.ac.in',
        password: 'coordPass123',
        role: 'Coordinator',
      },
      {
        email: 'advisor@gcek.ac.in',
        password: 'advisorPass123',
        role: 'Advisor',
      },
    ];

    for (const { email, password, role } of defaultUsers) {
      try {
        let user = await User.findOne({ email });
        if (!user) {
          console.log(`Creating default ${role} in Firebase and MongoDB...`);
          const firebaseUser = await admin.auth().createUser({
            email,
            password,
          });
          user = new User({
            firebaseUid: firebaseUser.uid,
            email,
            role,
            isVerified: true,
          });
          await user.save();
          console.log(`Default ${role} created:`, user);
        } else {
          console.log(`Default ${role} already exists in MongoDB:`, user);
          await admin.auth().updateUser(user.firebaseUid, { password });
          console.log(`${role} Firebase password synced`);
        }
      } catch (err) {
        console.error(`Error seeding default ${role}:`, err);
      }
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', require('./routes/auth'));

app.listen(process.env.PORT || 5000, () => console.log(`Server running on port ${process.env.PORT || 5000}`));