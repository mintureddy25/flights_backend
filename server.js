const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const port = process.env.PORT || 3000;


// Swagger Setup
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flight Booking API',
      version: '1.0.0',
      description: 'API for booking and managing flight bookings',
    },
    servers: [
      {
        url: `https://api.saiteja.online`,
      },
    ],
  },
  apis: ['./routes/booking.js'], // Path to the file with your routes
};

const swaggerSpec = swaggerJsdoc(options);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Middleware to parse JSON requests
app.use(express.json());

app.use(cors({
    origin: process.env.CLIENT_URL,  // Allow requests from a specific domain
    methods: ['GET', 'POST', 'PATCH'],                 // Specify allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Specify allowed headers
  }));
  


const bookingRouter = require('./controllers/bookings');



app.use('/bookings', bookingRouter);







app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });