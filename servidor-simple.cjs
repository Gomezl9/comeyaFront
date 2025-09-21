const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5173;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Simulación de almacenamiento en memoria
const comedores = [];
let comedorId = 1;

// Rutas API
// Archivo backend deshabilitado temporalmente para desarrollo frontend
