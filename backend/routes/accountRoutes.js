const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middlewares/authMiddleware');

// IMPORTANTE: router.use() aplica el "guardia de seguridad" a todas las rutas de este archivo
// Así nadie que no esté logueado puede intentar transferir
router.use(authMiddleware);

// Ruta GET: /api/account/dashboard (Obtiene saldo y movimientos)
router.get('/dashboard', accountController.getDashboardData);

// Ruta POST: /api/account/register-destination (Guarda una cuenta frecuente)
router.post('/register-destination', accountController.registerDestinationAccount);

// Ruta POST: /api/account/transfer (Ejecuta la transacción ACID)
router.post('/transfer', accountController.transfer);

module.exports = router;