const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.getDashboardData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const history = await Transaction.find({
            $or: [
                { originAccount: user.accountNumber },
                { destinationAccount: user.accountNumber }
            ]
        }).sort({ createdAt: -1 });

        res.json({
            user: {
                name: user.name,
                accountNumber: user.accountNumber,
                balance: user.balance,
                savedAccounts: user.savedDestinationAccounts
            },
            history
        });
    } catch (error) {
        res.status(500).json({ message: 'Error interno al cargar dashboard.' });
    }
};

exports.registerDestinationAccount = async (req, res) => {
    try {
        const { alias, accountNumber } = req.body;

        const regex = /^\d{10}$/;
        if (!regex.test(accountNumber)) {
            return res.status(400).json({ message: 'El número de cuenta destino debe tener exactamente 10 dígitos.' });
        }

        const destUser = await User.findOne({ accountNumber });
        if (!destUser) {
            return res.status(404).json({ message: 'La cuenta destino no existe en nuestro sistema.' });
        }

        const user = await User.findById(req.user.id);
        
        const alreadySaved = user.savedDestinationAccounts.find(acc => acc.accountNumber === accountNumber);
        if (alreadySaved) {
            return res.status(400).json({ message: 'Esta cuenta ya está registrada en tus destinos.' });
        }

        user.savedDestinationAccounts.push({ alias, accountNumber });
        await user.save();

        res.json({ message: 'Cuenta destino registrada exitosamente.', savedAccounts: user.savedDestinationAccounts });

    } catch (error) {
        res.status(500).json({ message: 'Error interno al registrar destino.' });
    }
};

exports.transfer = async (req, res) => {
    const { destinationAccount, amount, description } = req.body;
    const originUserId = req.user.id;
    const originUserAccount = req.user.accountNumber;

    // 🛡️ MEJORA: Límites estrictos de transferencia
    if (amount < 1 || amount > 1000000) {
        return res.status(400).json({ message: 'El monto a transferir debe estar entre $1.00 y $1,000,000.00' });
    }

    const regex = /^\d{10}$/;
    if (!regex.test(destinationAccount)) {
        return res.status(400).json({ message: 'El número de cuenta destino es inválido.' });
    }
    
    if (originUserAccount === destinationAccount) {
        return res.status(400).json({ message: 'No puedes transferir a tu propia cuenta.' });
    }

    // === INICIO DE TRANSACCIÓN ACID ===
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const originUser = await User.findById(originUserId).session(session);
        const destUser = await User.findOne({ accountNumber: destinationAccount }).session(session);

        if (!destUser) {
            throw new Error('Cuenta destino no encontrada.');
        }

        if (originUser.balance < amount) {
            throw new Error('Fondos insuficientes para realizar la transferencia.');
        }

        originUser.balance -= amount;
        destUser.balance += amount;

        await originUser.save({ session });
        await destUser.save({ session });

        const transactionLog = new Transaction({
            type: 'TRANSFER',
            originAccount: originUser.accountNumber,
            destinationAccount: destUser.accountNumber,
            amount,
            description
        });
        await transactionLog.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json({
            message: 'Transferencia realizada con éxito.',
            transactionId: transactionLog._id,
            newBalance: originUser.balance
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: error.message || 'Fallo en la transferencia ACID.' });
    }
};