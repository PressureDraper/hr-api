FROM node:24.11-alpine3.23 AS deps

WORKDIR /app
COPY package.json .
COPY prisma/ ./prisma
RUN npm install
RUN npx prisma generate --schema prisma/schema.prisma


FROM node:18.17.1-alpine3.18 AS builder
WORKDIR /app
COPY --chown=node --from=deps /app/node_modules/ ./node_modules/
COPY . .
RUN npm run build

FROM node:24.11.1-bullseye AS prod
WORKDIR /app
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
COPY --chown=node .env_api .env
COPY prisma/ ./prisma
COPY --chown=node --from=deps /app/node_modules/ ./node_modules/
COPY --chown=node --from=builder /app/build ./build/
COPY --chown=node:node infra/cert/ /cert/
RUN chown -R node:node /app
EXPOSE 3000
USER node
RUN npx puppeteer browsers install chrome
CMD [ "node", "build/index.js" ]