

const express = require('express');
const app = express();
const routes = require('./routes/index');
const connectDB = require('./config/db');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Use the routes
app.use('/api', routes);

module.exports = app;
