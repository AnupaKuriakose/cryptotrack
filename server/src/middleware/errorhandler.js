const errorHandler = (err, req, res, next) => {
//The 4-parameter signature is how Express identifies this as an error handler vs a 
// regular middleware. Regular middleware has (req, res, next). Error middleware has (err, req, res, next). Express checks the number of parameters — if it's 4, it only runs this when next(err) is called.
console.error(err.stack);
//Logs the full stack trace to your terminal. err.stack includes the error message plus every function call that led to the error. Invaluable for debugging.
const status = err.status || 500;
//Uses the error's status code if it has one, otherwise defaults to 500 (Internal Server Error). You can do const err = new Error('Not found'); err.status = 404; next(err); in a controller and this will correctly send a 404.
 res.status(status).json({
    error: err.message || 'Internal server error',
  });
};
//Sends a clean JSON error response to Angular. Angular's HTTP interceptor will catch this and show a snackbar. Much better than Express's default HTML error page.
//Exports so app.js can register it.
module.exports = errorHandler;
// The flow:
// Controller throws error
//       ↓
// next(err) called
//       ↓
// Express skips all remaining routes
//       ↓
// errorHandler runs
//       ↓
// Angular receives { "error": "message" }
//       ↓
// HTTP interceptor shows snackbar