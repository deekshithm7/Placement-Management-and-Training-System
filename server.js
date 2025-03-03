require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./pmts0-186c0-firebase-adminsdk-fbsvc-693468005c.json');

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
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', require('./routes/auth')); // Ensure this line exists

app.listen(process.env.PORT || 5000, () => console.log(`Server running on port ${process.env.PORT || 5000}`));