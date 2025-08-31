const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
require("dotenv").config();
const config = require("config");
 
// Import modular components
const connectDB = require('./config/db');
const commonMiddleware = require('./middlewares/commonMiddleware');
const postsRouter=require('./routes/postRouter');
const usersRouter = require("./routes/usersRouter");
const customErrorHandler=require('./utils/customErrorHandler');
const cookieParser = require("cookie-parser");
const path = require('path');
const flash = require("connect-flash");
const cors = require('cors');
const session = require('express-session');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const server = http.createServer(app);
allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:5175",
  "https://sportshub-murex.vercel.app",
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));


// const io = socketIO(server, {
//   cors: {
//     origin: allowedOrigins,
//     credentials: true,
//     methods: ["GET", "POST"],
//   }
// });

//handel websocket server
// handleSocketConnection(io)



const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Apply common middleware
    commonMiddleware(app);


    // Simple request logging (only method and URL)
    app.use((req, res, next) => {
      // console.log(`${req.method} ${req.url}`);
      next();
    });
    app.get("/", (req, res) => {
    res.send("API is running...");
    });
    app.use("/users", usersRouter);
    app.use("/posts",postsRouter);


    // Error handling middleware (should be last middleware)
    app.use(customErrorHandler);

    // Start a single HTTP + WebSocket server (Vercel-compatible behind proxy)
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
      // Server running
    });


  } catch (error) {
    process.exit(1);
  }
};

startServer();


// Export app and server for testing if needed
module.exports = { app, server };