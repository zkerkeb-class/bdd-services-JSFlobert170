const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./utils/swagger');
const dotenv = require("dotenv");
const performanceMetricsMiddleware = require('./middlewares/performanceMetrics');
const logger = require("./utils/logger");

// Importer les registres de métriques
const { register } = require('./metrics/performanceMetrics');

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(cors());

// Middleware de métriques
app.use(performanceMetricsMiddleware);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Route pour les métriques
app.get('/api/metrics', async (req, res) => {
    try {
        const metrics = await register.metrics();
        res.set('Content-Type', register.contentType);
        res.end(metrics);
    } catch (err) {
        res.status(500).end(err);
    }
});

// initial route
app.get("/", (req, res) => {
    res.send({ message: "Welcome to the application." });
});

// api routes prefix
app.use("/api", routes);

// run server
app.listen(process.env.PORT || 3000, () => {
    logger.info(`Server is running on http://localhost:${process.env.PORT || 3000}`);
});

module.exports = app;
