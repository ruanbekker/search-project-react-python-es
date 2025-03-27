FROM node:20-alpine

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN echo "VITE_API_URL=$VITE_API_URL" > .env
RUN npm run build

RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]

