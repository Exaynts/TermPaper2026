# MathJam — платформа для онлайн-курсов по математике

**MathJam** — это веб-приложение для размещения и изучения онлайн-курсов по математике.  
Проект разработан в рамках курсовой работы по дисциплине «Технология разработки программного обеспечения» (траектория Б: Django REST + React SPA).  
Приложение позволяет пользователям регистрироваться, просматривать курсы, покупать доступ, отслеживать прогресс, сохранять курсы в избранное и восстанавливать удалённые курсы из корзины.

---

## 📊 Статистика разработки

- **Всего коммитов:** 70+  
- **Период разработки:** 18 недель  
- **Ветки:** `main` (основная)  

![График активности](docs/images/git-commit-activity.png)

---

## 🚀 Технологический стек

### Backend

| Технология | Версия | Назначение |
|------------|--------|------------|
| **Python** | 3.13 | Язык программирования |
| **Django** | 5.1 | Веб-фреймворк |
| **Django REST Framework (DRF)** | 3.15.2 | Создание REST API |
| **Simple JWT** | 5.3.1 | JWT-аутентификация (access/refresh) |
| **django-cors-headers** | 4.4.0 | Настройка CORS |
| **django-filter** | 25.1 | Фильтрация запросов |
| **drf-spectacular** | 0.27.2 | OpenAPI 3.0 (Swagger/ReDoc) |
| **Pillow** | 10.4.0 | Обработка изображений |
| **psycopg2-binary** | 2.9.10 | Драйвер PostgreSQL |
| **python-dotenv** | 1.0.1 | Управление переменными окружения |
| **pytest** | 9.0.3 | Модульное тестирование |
| **pytest-django** | 4.12.0 | Интеграция pytest с Django |
| **pytest-cov** | 7.1.0 | Отчёт о покрытии кода |
| **gunicorn** | 21.2.0 | WSGI-сервер для продакшена |

### Frontend

| Технология | Версия | Назначение |
|------------|--------|------------|
| **React** | 18.2.0 | Библиотека для построения интерфейсов |
| **React Router** | 7.15.1 | Маршрутизация |
| **Vite** | 6.0.0 | Сборщик |
| **Axios** | 1.16.1 | HTTP-клиент (перехватчики для JWT) |
| **CSS Modules** | — | Изоляция стилей |
| **Vitest** | — | Модульное тестирование |
| **React Testing Library** | — | Тестирование компонентов |
| **Cypress** | 15.16.0 | Интеграционное (E2E) тестирование |

### База данных и контейнеризация

| Технология | Версия | Назначение |
|------------|--------|------------|
| **SQLite** | — | База данных для разработки |
| **PostgreSQL** | 15 | База данных для продакшена |
| **Docker** | 29.5.2 | Контейнеризация |
| **Docker Compose** | 2.0+ | Оркестрация контейнеров |

---

## 📋 Основной функционал

### Публичная часть (доступна всем)
- Просмотр списка курсов (с пагинацией)
- Просмотр карточки курса (описание, цена, рейтинг, список уроков)
- Поиск курсов по названию
- Регистрация и аутентификация (JWT)

### Приватная часть (для авторизованных пользователей)
- Покупка курсов
- Просмотр приобретённых курсов и прогресса
- Отметка уроков как пройденных
- Сохранение курсов в избранное
- Перемещение курсов в корзину восстановления и их возврат
- Редактирование профиля (аватар, уровень математики, контакты)

### Административная часть (для администраторов)
- Управление курсами и уроками (CRUD)
- Управление категориями
- Управление пользователями

---

### Структура проекта
**Backend**
```bash
backend/
├── config/             # Настройки проекта
│   ├── settings.py
│   └── urls.py
├── courses/            # Приложение курсов (модели, API)
├── users/              # Приложение пользователей (аутентификация)
├── media/              # Загруженные изображения
├── static/             # Статические файлы
├── manage.py
└── requirements.txt
```
**Frontend**
```bash
frontend/
├── public/
├── src/
│   ├── components/     # Переиспользуемые компоненты
│   ├── pages/          # Страницы приложения
│   ├── contexts/       # AuthContext
│   ├── services/       # API-клиент (Axios)
│   ├── styles/         # CSS Modules
│   └── App.jsx
├── package.json
└── vite.config.js
```

**Документация и диаграммы**
```bash
analysis/                   # Этап 0: Бизнес-анализ
├── diagrams/               # IDEF0, BUC, матрица стейкхолдеров
└── sources/                # Исходники PlantUML
requirements/               # Этап 1: Требования
├── diagrams/               # Use Case, диаграмма активности
└── sources/                # Исходники PlantUML
design/                     # Этапы 2-4: Архитектура, БД, детальное проектирование
├── diagrams/               # ER, компонентов, последовательности, состояния
└── sources/                # Исходники PlantUML
implementation/             # Реализационные артефакты (опционально)
└── diagrams/               # Структуры проектов Django и React
docs/                       # Вспомогательные материалы
├── images/                 # Скриншоты интерфейса
├── sources/                # DDL-скрипты
└── testing/                # Скриншоты тестов
```

---

## 🧠 Особенности реализации

Проект построен с учётом современных архитектурных подходов и лучших практик веб-разработки:

### 🔐 JWT-аутентификация
- Используется **access/refresh токены** (access — 30 минут, refresh — 15 дней).
- На клиенте настроен **Axios-перехватчик**, автоматически обновляющий токен при истечении срока.
- Токены хранятся в `localStorage` с механизмом автоматического обновления.

### 🧱 Раздельная архитектура (Django REST + React SPA)
- Бэкенд и фронтенд развиваются независимо, что упрощает масштабирование.
- REST API обеспечивает унифицированный интерфейс для потенциальных мобильных клиентов.
- CORS настроен для безопасного взаимодействия между фронтендом и бэкендом.

### 📬 Модуль уведомлений (Django Signals + SMTP)
- Реализовано приложение `notifications`, которое автоматически создаёт уведомления при ключевых событиях:
  - Регистрация пользователя
  - Покупка курса
  - Отметка урока как пройденного
  - Перемещение / восстановление / удаление курса из корзины
- Уведомления дублируются на **email** через SMTP-сервер (Gmail).
- На фронтенде отображается **иконка колокольчика** с бейджем непрочитанных уведомлений.

### 🎨 Стилизация (CSS Modules)
- Все стили изолированы на уровне компонентов, что исключает конфликты имён классов.
- Поддерживается адаптивная вёрстка для разных устройств.

### 🗂️ ORM Django и паттерны проектирования
- Использование `select_related` и `prefetch_related` для оптимизации запросов к БД.
- Применены паттерны:
  - **ViewSet** — группировка CRUD-логики.
  - **Serializer** — валидация и преобразование данных.
  - **Repository** (через ORM) — абстракция доступа к данным.
  - **Permission** — разграничение доступа для гостей, пользователей и администраторов.

---

## 🛠 Установка и запуск (для разработки)

### Требования
- Python 3.10+
- Node.js 18+
- npm или yarn

### 1. Клонирование репозитория и установка зависимостей
```bash
git clone https://github.com/Exaynts/TermPaper2026.git
cd TermPaper2026
```

Cоздайте/активируйте виртуальное окружение и установите все необходимые библиотеки
```bash
venv/scripts/activate
pip install -r requirements.txt
``` 

### 2. Настройка бэкенда
```bash
cd backend
python -m venv venv

# Активация окружения:
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env              # Pаположите SECRET_KEY и другие переменные для корректной работы
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 3. Настройка фронтенда
```bash
cd ../frontend
npm install
cp .env.example .env              # При необходимости укажите VITE_API_URL
npm run dev
```

### 4. Открыть в браузере
```bash
- Фронтенд: http://localhost:5173
- Админка Django: http://localhost:8000/admin
- API (browsable): http://localhost:8000/api/courses/
```

### 5. Запуск через Docker (продакшен-режим)
Убедитесь, что Docker Desktop запущен
```bash
docker-compose up -d --build
- Фронтенд: http://localhost
- API: http://localhost:8000/api/
- Админка: http://localhost:8000/admin
```

---

## 🐳 Установка через Docker (только продакшен)

Этот раздел — для тех, кому нужно **просто запустить готовый проект** без настройки среды разработки. Понадобится только **Docker Desktop**. Python, Node.js, виртуальные окружения и IDE устанавливать **не нужно**.

### Требования

- **Docker Desktop** — [скачать](https://www.docker.com/products/docker-desktop/)
  - Windows 10/11 (Pro/Enterprise), macOS 11+, или Linux (Ubuntu 20.04+)
  - Минимум **6 ГБ свободной оперативной памяти** (рекомендуется 8 ГБ)
  - 5 ГБ свободного места на диске
  - **Git** — [скачать](https://git-scm.com/) (для клонирования репозитория)
  - Стабильное интернет-соединение **на время первой сборки** (~5–10 минут)

### Шаг 1. Установить и запустить Docker Desktop

1. Скачать и установить Docker Desktop с официального сайта.
2. Запустить Docker Desktop.
3. Дождаться, пока индикатор в левом нижнем углу станет **зелёным** (`Engine running`).

> ⚠️ Если зелёного индикатора нет — перезагрузите компьютер после установки.

### Шаг 2. Клонировать репозиторий

Откройте терминал (PowerShell, cmd, Git Bash) и выполните:

```bash
git clone https://github.com/Exaynts/TermPaper2026.git
cd TermPaper2026
```

### Шаг 3. Создать файл `.env`

В корне проекта (рядом с `docker-compose.yml`) создайте файл `.env`. Скопируйте содержимое `.env.example` и заполните **3 обязательных переменные**:

```ini
SECRET_KEY=замените-на-длинную-случайную-строку
DB_PASSWORD=придумайте-надёжный-пароль
EMAIL_HOST_PASSWORD=пароль-приложения-gmail
```

Полный минимальный `.env`:

```ini
# Django
SECRET_KEY=change-me-to-a-long-random-string
DEBUG=False

# Database
USE_POSTGRES=True
DB_NAME=mathjam_db
DB_USER=mathjam_user
DB_PASSWORD=change-me-to-a-strong-password
DB_HOST=db
DB_PORT=5432

# Hosts
ALLOWED_HOSTS=localhost,127.0.0.1,backend
CORS_ALLOWED_ORIGINS=http://localhost,http://127.0.0.1

# Email (SMTP) — опционально, но нужно для уведомлений
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

> 💡 **Как получить пароль приложения Gmail:**
> 1. Включите двухэтапную аутентификацию: [myaccount.google.com/security](https://myaccount.google.com/security)
> 2. Создайте пароль приложения: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
> 3. Скопируйте 16-значный код без пробелов в `EMAIL_HOST_PASSWORD`.

### Шаг 4. Запустить приложение

В корне проекта (где `docker-compose.yml`) выполните:

```bash
docker-compose up -d --build
```

- Первая сборка занимает **5–10 минут** — скачиваются образы Python, Node, PostgreSQL, Nginx и собираются контейнеры.
- Последующие запуски (`docker-compose up -d`) — **10–20 секунд**.

Дождитесь сообщения:

```
✔ Container mathjam_db        Healthy
✔ Container mathjam_backend   Started
✔ Container mathjam_frontend  Started
```

### Шаг 5. Создать администратора

```bash
docker-compose exec backend python manage.py createsuperuser
```

Введите **email**, **nickname**, **имя**, **фамилию** и **пароль** (минимум 8 символов, не только цифры).

### Шаг 6. Открыть в браузере

| Что | Адрес |
|-----|-------|
| **Фронтенд** | http://localhost |
| **API** | http://localhost:8000/api/ |
| **Админка Django** | http://localhost:8000/admin |
| **Swagger UI** | http://localhost:8000/api/schema/swagger-ui/ |
| **ReDoc** | http://localhost:8000/api/schema/redoc/ |

### 🎛 Управление контейнерами

| Действие | Команда |
|----------|---------|
| Запустить | `docker-compose up -d` |
| Остановить (данные сохраняются) | `docker-compose stop` |
| Перезапустить | `docker-compose restart` |
| Удалить контейнеры (данные сохраняются) | `docker-compose down` |
| **Полный сброс** (⚠️ удалит БД) | `docker-compose down -v` |
| Пересобрать образы | `docker-compose up -d --build` |
| Логи конкретного сервиса | `docker-compose logs -f backend` |
| Список контейнеров | `docker-compose ps` |
| Войти в shell контейнера | `docker-compose exec backend bash` |

### 🧱 Что «внутри коробки»

Docker Compose поднимает **три изолированных контейнера**:

| Контейнер | Образ | Порт | Назначение |
|-----------|-------|------|------------|
| `mathjam_db` | `postgres:15` | 5432 | База данных |
| `mathjam_backend` | собран из `backend/Dockerfile` | 8000 | Django + DRF + Gunicorn |
| `mathjam_frontend` | собран из `frontend/Dockerfile` | 80 | React (статика) + Nginx |

**Тома (volumes):**
- `postgres_data` — данные БД (сохраняются между перезапусками)
- `static_volume` — CSS/JS админки Django (общий для Nginx и backend)
- `media_volume` — загруженные картинки курсов и аватары

**Особенности:**
- Фронтенд и API доступны через **один порт 80** — Nginx проксирует `/api/` на backend.
- `entrypoint.sh` автоматически применяет миграции и собирает статику при старте.
- Healthcheck гарантирует, что backend стартует **после** готовности PostgreSQL.

### ⚠️ Частые проблемы при первом запуске

| Симптом | Причина | Решение |
|---------|---------|---------|
| `failed to solve: python:3.13-slim` | Нет доступа к Docker Hub | Настроить зеркало или включить VPN на время сборки |
| `cannot allocate memory` | Мало RAM для Docker | Увеличить лимит через `.wslconfig` (Windows) или Settings → Resources |
| `port is already allocated` | Порты 80/8000/5432 заняты | Закрыть конфликтующие приложения (Skype, старый Django) |
| Контейнер `backend` перезапускается | Не задан `SECRET_KEY` или `DB_PASSWORD` | Проверить `.env` |
| Стили админки не грузятся | Nginx не видит `static_volume` | Проверить `docker-compose.yml` и `nginx.conf` |
| Страница открывается, но API не работает | Nginx не проксирует `/api/` | Проверить логи: `docker-compose logs frontend` |

Полный список — в разделе [«Устранение неполадок»](#-устранение-неполадок-troubleshooting).

### ✅ Преимущества Docker-варианта

- **Ничего не нужно устанавливать вручную** — только Docker Desktop.
- **Одинаковое окружение** — работает одинаково на Windows, macOS, Linux.
- **Изоляция** — не конфликтует с другими Python/Node-проектами.
- **Продакшен-режим** — `DEBUG=False`, Gunicorn, PostgreSQL, Nginx.
- **Быстрый запуск** — вторая сборка за 10 секунд, остановка за 2 секунды.

---

## ⚠️ Устранение неполадок

### Локальная разработка (без Docker)

- **Медиафайлы не загружаются** — проверьте `MEDIA_URL`, `MEDIA_ROOT` и `static()` в `urls.py` (работает только при `DEBUG=True`).
- **Ошибка 401 при запросе к API** — токен истёк или отсутствует; проверьте `localStorage` и перехватчик Axios.
- **Email-уведомления не приходят** — используйте пароль приложения Gmail; для отладки включите `EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'`.

### Docker / продакшен

См. раздел [«Частые проблемы при первом запуске»](#-частые-проблемы-при-первом-запуске).

---

## 📚 Документация API
После запуска бэкенда документация будет доступна по адресам:

- **Swagger UI**: http://localhost:8000/api/schema/swagger-ui/
- **ReDoc**: http://localhost:8000/api/schema/redoc/
- **Сырая OpenAPI-схема (JSON)**: http://localhost:8000/api/schema/

---

## 👥 API-эндпоинты (основные)

| Метод | Эндпоинт | Права доступа | Описание |
|-------|----------|---------------|----------|
| POST | `/api/auth/register/` | AllowAny | Регистрация нового пользователя |
| POST | `/api/auth/login/` | AllowAny | Вход (JWT-токены) |
| POST | `/api/auth/token/refresh/` | AllowAny | Обновление access-токена |
| GET/PATCH | `/api/auth/profile/` | IsAuthenticated | Профиль пользователя |
| POST | `/api/auth/logout/` | IsAuthenticated | Выход (блокировка refresh-токена) |
| GET | `/api/courses/` | AllowAny | Список курсов (фильтрация, пагинация) |
| GET | `/api/courses/{id}/` | AllowAny | Детали курса с уроками |
| POST | `/api/courses/{id}/purchase/` | IsAuthenticated | Покупка курса |
| POST | `/api/courses/{id}/save/` | IsAuthenticated | Сохранить в избранное |
| POST | `/api/courses/{id}/unsave/` | IsAuthenticated | Удалить из избранного |
| POST | `/api/courses/{id}/move_to_bin/` | IsAuthenticated | Переместить в корзину |
| POST | `/api/courses/{id}/restore_from_bin/` | IsAuthenticated | Восстановить из корзины |
| GET | `/api/courses/my_courses/` | IsAuthenticated | Список купленных курсов |
| GET | `/api/courses/saved_courses/` | IsAuthenticated | Список сохранённых курсов |
| GET | `/api/courses/recycle_bin/` | IsAuthenticated | Список курсов в корзине |
| POST | `/api/progress/mark/` | IsAuthenticated | Отметить урок пройденным |
| GET | `/api/progress/my-progress/` | IsAuthenticated | Прогресс по купленным курсам |
| POST | `/api/courses/{id}/rate/` | IsAuthenticated | Оценка курса |
| GET | `/api/courses/{id}/my-rating/` | IsAuthenticated | Оценка пользователя |
| GET | `/api/notifications/` | IsAuthenticated | Список уведомлений |
| POST | `/api/notifications/{id}/mark_as_read/` | IsAuthenticated | Отметить уведомление прочитанным |
| POST | `/api/notifications/mark_all_read/` | IsAuthenticated | Отметить все прочитанными |

---

### 🧪 Тестирование
- Бэкенд (pytest)
```bash
cd backend  
pytest -v
```

- Фронтенд (Jest + React Testing Library)  
```bash  
cd frontend  
npm test
```

- Интеграционное тестирование (Cypress)
```bash
cd frontend
npm run test:e2e:open    # интерактивный режим
# или
npm run test:e2e         # автоматический режим (headless)
```

---

## 📐 Диаграммы и проектная документация

Все диаграммы проекта распределены по этапам:

- **Анализ** (`analysis/diagrams/`): [IDEF0](analysis/diagrams/idef0-a0.PNG), [BUC](analysis/diagrams/buc-diagram.PNG), [Матрица стейкхолдеров](analysis/diagrams/stakeholder-matrix.PNG)
- **Требования** (`requirements/diagrams/`): [Use Case](requirements/diagrams/use-case-diagram.PNG), [Диаграмма активности покупки](requirements/diagrams/activity-purchase.PNG)
- **Проектирование** (`design/diagrams/`): [Domain Model](design/diagrams/domain-model-diagram.PNG), [ER-диаграмма](design/diagrams/er-diagram.PNG), [Компонентная](design/diagrams/component-diagram.PNG), [Последовательности](design/diagrams/sequence-auth.PNG), [Состояний](design/diagrams/state-diagram.PNG), [Классов проектирования](design/diagrams/design-class-diagram.PNG)

Исходные коды диаграмм (PlantUML) доступны в папках `*/sources/`.

---

### 👨‍💻 Автор
Студент группы ПИЖ-б-о-24-1  
Козлов Евгений Александрович  
Направление подготовки: 09.03.04 «Программная инженерия»  
Профиль: «Разработка и сопровождение программного обеспечения»  

### 📄 Лицензия

Этот проект создан в учебных целях и не предназначен для коммерческого использования.  
© 2026 MathJam. Все права защищены.

