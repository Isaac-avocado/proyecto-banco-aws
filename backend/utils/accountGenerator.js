/**
 * Implementación exacta del algoritmo de la Sección 6 del PDF:
 * Bloque 1: Prefijo fijo '180'
 * Bloque 2: ID Secuencial (6 dígitos, relleno con ceros a la izquierda)
 * Bloque 3: Dígito Verificador (Suma de dígitos de la base, módulo 10)
 */

function calculateCheckDigit(baseString) {
    let sum = 0;
    // Suma todos los dígitos de la cadena base
    for (let i = 0; i < baseString.length; i++) {
        sum += parseInt(baseString.charAt(i));
    }
    // Calcula el módulo 10
    const remainder = sum % 10;
    // Si el residuo es 0, el dígito es 0 (según el PDF)
    return remainder === 0 ? 0 : remainder;
}

function generateAccountNumber(userSequentialId) {
    const prefix = "180";
    
    // Rellenar con ceros a la izquierda hasta tener 6 dígitos
    const formattedId = String(userSequentialId).padStart(6, '0');
    
    // Concatenar base (9 dígitos)
    const base = prefix + formattedId;
    
    // Calcular el décimo dígito
    const checkDigit = calculateCheckDigit(base);
    
    // Devolver la cuenta completa de 10 dígitos (ej. 1800000018)
    return base + checkDigit;
}

module.exports = { generateAccountNumber };