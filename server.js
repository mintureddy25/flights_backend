const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

app.use(cors({
    origin: process.env.CLIENT_URL,  // Allow requests from a specific domain
    methods: ['GET', 'POST'],                 // Specify allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Specify allowed headers
  }));
  


const bookingRouter = require('./controllers/bookings');



app.use('/bookings', bookingRouter);







app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });