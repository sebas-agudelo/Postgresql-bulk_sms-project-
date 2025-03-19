# Usa la imagen oficial de Node.js
FROM node:18

# Configurar el directorio de trabajo
WORKDIR /app

# Copiar los archivos del proyecto
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Exponer el puerto en el que corre el servidor
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "src/app.js"]
