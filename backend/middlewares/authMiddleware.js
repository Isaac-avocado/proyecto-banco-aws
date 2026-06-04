const jwt = require('jsonwebtoken');

// Middleware para proteger rutas usando JWT
module.exports = function(req, res, next) {
    // 1. Leer el token de los headers (puede venir como x-auth-token o Bearer Token)
    const token = req.header('x-auth-token') || req.header('Authorization')?.split(' ')[1];

    // 2. Si no hay token, denegar el acceso
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No hay token de seguridad.' });
    }

    try {
        // 3. Verificar y desencriptar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Adjuntar los datos del usuario a la petición para usarlos en el controlador
        req.user = decoded; // Contiene { id, accountNumber }
        next(); // Permitir que la petición continúe
    } catch (err) {
        res.status(401).json({ message: 'El token de seguridad no es válido o ha expirado.' });
    }
};