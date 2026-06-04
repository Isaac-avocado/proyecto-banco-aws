const mongoose = require('mongoose');

// Esquema para la bitácora de transferencias
const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['TRANSFER', 'DEPOSIT'], // Para este proyecto nos enfocamos en transferencias
        required: true
    },
    originAccount: {
        type: String,
        required: true
    },
    destinationAccount: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: 'Transferencia bancaria'
    },
    status: {
        type: String,
        enum: ['COMPLETED', 'FAILED'],
        default: 'COMPLETED'
    }
}, { 
    timestamps: true // Guarda createdAt y updatedAt (Fecha del movimiento)
});

module.exports = mongoose.model('Transaction', transactionSchema);