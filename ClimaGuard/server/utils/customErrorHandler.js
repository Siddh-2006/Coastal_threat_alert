// SportsHub/server/utils/customErrorHandler.js

const customErrorHandler = (err, req, res, next) => {
    console.error('Unhandled Backend Error:', err.stack); // Log the full stack trace for debugging

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Default to 500 if status not set
    res.status(statusCode).json({
        message: err.message || 'An unexpected error occurred on the server.',
        // In production, you might not want to send the full error stack
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = customErrorHandler;
