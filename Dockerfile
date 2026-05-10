FROM node:22-alpine

RUN apk add --no-cache openssl netcat-openbsd

WORKDIR /app

COPY package*.json ./
RUN npm ci

# --- CORRECCIÓN AQUÍ ---
# Copiamos la carpeta prisma antes de generar el cliente
COPY prisma ./prisma/
RUN npx prisma generate  

COPY . .

RUN npm run build

EXPOSE ${PORT}

CMD sh -c "until nc -z db 5432; do echo waiting for db; sleep 2; done; npx prisma migrate deploy && node dist/main.js"