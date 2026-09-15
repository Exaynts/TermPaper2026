# Сборка React-приложения
FROM node:20-alpine AS build

WORKDIR /app

# Скопировать файлы зависимостей
COPY package*.json ./

# Переключить npm на зеркало (ускоряет установку в РФ)
RUN npm config set registry https://registry.npmmirror.com

# Отключить скачивание бинарника Cypress (250 МБ, не нужен для сборки)
ENV CYPRESS_INSTALL_BINARY=0

# Установить зависимости
RUN npm ci

# Скопировать исходный код фронтенда
COPY . .

# Собрать продакшен-версию React (папка dist)
RUN npm run build

# Раздача статики через Nginx

FROM nginx:stable-alpine

# Скопировать собранную статику из стадии сборки
COPY --from=build /app/dist /usr/share/nginx/html

# Скопировать конфиг Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]