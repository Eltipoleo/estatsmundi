# 1. Imagen base oficial de Node.js (versión ligera)
FROM node:18-alpine

# 2. Directorio de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiar archivos de dependencias
COPY package*.json ./

# 4. Instalar dependencias del proyecto
RUN npm install --production

# 5. Copiar el resto del código del servidor
COPY . .

# 6. Puerto en el que escucha Express
EXPOSE 3001

# 7. Variable de entorno por defecto para el puerto
ENV PORT=3001

# 8. Comando para arrancar el servidor
CMD ["node", "server.js"]