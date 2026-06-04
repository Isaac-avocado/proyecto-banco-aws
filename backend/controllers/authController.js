const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateAccountNumber } = require('../utils/accountGenerator');

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El correo ya está registrado en el banco.' });
        }

        const lastUser = await User.findOne({}, 'sequentialId').sort({ sequentialId: -1 });
        const nextSequentialId = lastUser && lastUser.sequentialId ? lastUser.sequentialId + 1 : 1;

        const accountNumber = generateAccountNumber(nextSequentialId);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            sequentialId: nextSequentialId,
            name,
            email,
            password: hashedPassword,
            accountNumber
        });

        await newUser.save();

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: {
                name: newUser.name,
                email: newUser.email,
                accountNumber: newUser.accountNumber,
                balance: newUser.balance
            }
        });

    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).json({ message: 'Error interno del servidor al registrar usuario.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        const token = jwt.sign(
            { id: user._id, accountNumber: user.accountNumber },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                name: user.name,
                accountNumber: user.accountNumber,
                balance: user.balance
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.' });
    }
};