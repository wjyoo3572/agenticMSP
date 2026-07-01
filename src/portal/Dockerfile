FROM node:22-alpine

ENV NODE_ENV=production \
    PORT=8080 \
    AGENT_CATALOG_PATH=/app/agents/catalog.json

WORKDIR /app

COPY --chown=node:node src/portal/package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node src/portal/app.js ./app.js
COPY --chown=node:node src/portal/public ./public
COPY --chown=node:node agents ./agents

USER node
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/health || exit 1

CMD ["node", "app.js"]
