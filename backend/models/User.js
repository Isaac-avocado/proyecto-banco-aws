const mongoose = require('mongoose');

// Esquema de la colección de usuarios en MongoDB
const userSchema = new mongoose.Schema({
    sequentialId: { 
        type: Number, 
        unique: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    accountNumber: { 
        type: String, 
        required: true, 
        unique: true, 
        match: [/^\d{10}$/, 'El número de cuenta debe tener exactamente 10 dígitos']
    },
    balance: { 
        type: Number, 
        default: 10000 // 💰 MEJORA: Bono inicial de $10,000 para pruebas de transferencias
    },
    savedDestinationAccounts: [{
        alias: String,
        accountNumber: String
    }]
}, {
    timestamps: true 
});

// Middleware para auto-incrementar el sequentialId antes de guardar
userSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const lastUser = await this.constructor.findOne({}, 'sequentialId').sort({ sequentialId: -1 });
            this.sequentialId = lastUser && lastUser.sequentialId ? lastUser.sequentialId + 1 : 1;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

module.exports = mongoose.model('User', userSchema);