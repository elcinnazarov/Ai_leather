# 1-ci Mərhələ: React kodlarının yığılması (Build)
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2-ci Mərhələ: Yüngül Nginx ilə canlıya verilməsi
FROM nginx:alpine

# Yığılmış dist qovluğunu Nginx-ə kopyalayırıq
COPY --from=build /app/dist /usr/share/nginx/html

# Az əvvəl yaratdığımız nginx.conf faylını tətbiq edirik
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]