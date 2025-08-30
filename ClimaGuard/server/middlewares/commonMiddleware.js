const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5175",
  "https://sportshub-murex.vercel.app",
];

module.exports = (app) => {
    app.set('view engine', 'ejs'); // Assuming EJS is still used for other parts
    app.use(express.json()); // To parse JSON bodies from incoming requests
    app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies
    app.use(cookieParser());
    app.use(cors({
        origin:allowedOrigins, // Frontend URL
        credentials: true
    }));
    app.use(session({
        resave: false,
        saveUninitialized: false,
        secret: process.env.EXPRESS_SESSION_SECRET || 'your-super-secret-key', // Use env var for secret
    }));
    app.use(flash()); // For flash messages
    app.use(express.static(path.join(__dirname, '../public'))); // Serve static files from 'public'
};
