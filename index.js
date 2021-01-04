const express = require("express");
const logger = require("./logger");
const morgan = require("morgan");

const PORT = 3000;
const app = express();

const morganFormat = process.env.NODE_ENV !== "production" ? "dev" : "combined";

app.use(
  morgan(morganFormat, {
    skip: function(req, res) {
      return res.statusCode < 400;
    },
    stream: process.stderr
  })
);

app.use(
  morgan(morganFormat, {
    skip: function(req, res) {
      return res.statusCode >= 400;
    },
    stream: process.stdout
  })
);

app.get("/", function(req, res) {
  logger.debug("Debug statement");
  logger.info("Info statement");
  res.send(req.method + ' ' + req.originalURL);
});

app.get("/error", function(req, res) {
  throw new Error('Problem Here!');
});

// All errors are sent back as JSON
app.use((err, req, res, next) => {
  // Fallback to default node handler
  if (res.headersSent) {
    next(err);
    return;
  }

  logger.error(err.message, {url: req.originalUrl});

  res.status(500);
  res.json({ error: err.message });
});

// Start server
app.listen(PORT, function() {
  logger.info("Example app listening on port " + PORT);
  logger.debug("More detailed log", {PORT});
});