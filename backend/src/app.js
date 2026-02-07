// src/app.js
const express = require('express');
const auth = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const cors = require("cors");

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://factory-acceptance-test-1.onrender.com"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const templateRoutes = require('./routes/templateRoutes');
const wikiRoutes = require('./routes/wikiRoutes');
const inspectionFormRoutes = require('./routes/inspectionFormRoutes');
const pdfRoutes = require('./routes/pdfRoutes');

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', auth(true), userRoutes);
app.use('/api/templates', auth(true), templateRoutes);
app.use('/api/wiki', auth(true), wikiRoutes);
app.use('/api/forms', auth(true), inspectionFormRoutes);
app.use('/api/pdf', auth(true), pdfRoutes);

app.use(errorHandler);

module.exports = app;