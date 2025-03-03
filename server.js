require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./pmts0-186c0-firebase-adminsdk-fbsvc-693468005c.json');
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
    const count = await AllowedEmail.countDocuments();
    if (count === 0) {
      console.log('Seeding allowedEmails collection...');
      await AllowedEmail.insertMany([
        { email: "jack@gcek.ac.in", role: "Student", addedAt: new Date() },
        { email: "john@gmail.com", role: "Student", addedAt: new Date() },
        { email: "alum@gmail.com", role: "Alumni", addedAt: new Date() },
        { email: "coord@gcek.ac.in", role: "Coordinator", addedAt: new Date() }
      ]);
      console.log('allowedEmails seeded successfully');
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', require('./routes/auth'));

app.listen(process.env.PORT || 5000, () => console.log(`Server running on port ${process.env.PORT || 5000}`));