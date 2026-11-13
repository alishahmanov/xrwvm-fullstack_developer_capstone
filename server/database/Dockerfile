FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY app.js dealership.js review.js ./
COPY data ./data
ENV HOST=0.0.0.0
EXPOSE 3030
CMD ["node", "app.js"]
