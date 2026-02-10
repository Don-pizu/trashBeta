//app.js

require('dotenv').config();

const express = require('express');
const app = express();

const connectDB = require('./config/db');
const path = require ('path');
const http = require ('http');


// NEW: security libs
const cors = require("cors");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const { swaggerUi, swaggerSpec } = require('./swagger');

//DB connection
connectDB();

//Middleware to parse JSON
// Increase payload limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Security hardening
//helmet
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: [
        "'self'",
        "http://localhost:5000"
      ],
      scriptSrc: [
        "'self'",
        "https://cdn.jsdelivr.net",
        "https://cdn.socket.io",   // allow socket.io CDN
      ],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
      connectSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://cdn.jsdelivr.net",   // allow worker importScripts
        "https://cdn.socket.io",
        //"http://localhost:5000",
        //"http://127.0.0.1:5500",
        //"http://localhost:5500",
        "https://trashbeta.onrender.com",
        "https://res.cloudinary.com"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "blob:", 
        "http://localhost:5000", 
        "https://trashbeta.onrender.com", 
        "https://res.cloudinary.com"
      ], // FIX: allow blob: images
    },
  })
);


//ratelimit
const limiter = rateLimit({ 
windowMs: 15 * 60 * 1000, // 15 minutes 
max: 100, // max 100 requests per IP 
message: 'Too many requests from this IP, please try again later.' 
}); 
app.use('/api', limiter);



// CORS configuration
const allowedOrigins = [
  "'self'",
  //'http://localhost:5000',   // If frontend serves on 5000
  //'http://127.0.0.1:5500',
  //'null', //To allow frontend guys to work freely for now
  'https://trashbeta.onrender.com', //deployed backend 
  'https://thrashbeta.vercel.app'  // deployed frontend  
  //'http://localhost:5500',
  ]; 

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


//Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', reportRoutes);
app.use('/api/v1', integrationRoutes);
app.use('/api/v1', webhookRoutes);

// Swagger docs route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;