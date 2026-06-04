# Usamos una versión ligera de Node.js
FROM node:18-alpine

# Creamos la carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero los archivos de dependencias (para optimizar caché)
COPY package*.json ./

# Instalamos las dependencias (Express, Mongoose, etc.)
RUN npm install

# Copiamos el resto de nuestro código
COPY . .

# Exponemos el puerto 3000 para que se pueda comunicar
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["node", "server.js"]