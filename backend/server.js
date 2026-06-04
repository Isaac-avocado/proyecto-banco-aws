require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// ==========================================
// 🛡️ VALIDACIÓN ESTRICTA DE ENTORNO (Mejora)
// ==========================================
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    console.error('❌ ERROR CRÍTICO: Faltan variables de entorno.');
    console.error('Asegúrate de tener MONGO_URI y JWT_SECRET configurados.');
    process.exit(1); // Detiene el servidor inmediatamente para evitar daños
}

// Inicializar la aplicación Express
const app = express();

// Middlewares
app.use(cors({
    origin: '*', // En producción, es mejor poner la IP de tu frontend: 'http://tu-ip-aws:8080'
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// 1. Conexión a la Base de Datos (MongoDB Atlas)
mongoose.connect(process.env.MONGO_URI, {
    family: 4 // Fuerza a usar IPv4 para evitar bloqueos de red locales
})
    .then(() => console.log('✅ Conectado a MongoDB Atlas de forma segura'))
    .catch(err => console.error('❌ Error crítico al conectar a MongoDB:', err));

// 2. Ruta básica para comprobar salud (Healthcheck para AWS)
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: '🏦 API del Sistema Bancario operando correctamente' 
    });
});

// Espacio para las rutas de los módulos
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/account', require('./routes/accountRoutes'));

// 3. Levantar el Servidor
const PORT = process.env.PUERTO || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});