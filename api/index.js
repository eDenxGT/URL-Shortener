require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes//userRoute');
const urlRoutes = require('./routes/urlRoute');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json({ limit: '50mb' }));
const corsOptions = {
    origin: '*', // Be careful in production
    methods: ['GET', 'POST'],
    optionsSuccessStatus: 200
  };

app.use(cors(corsOptions));
// Routes
app.use('/auth', authRoutes);
app.use('/urls', urlRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
