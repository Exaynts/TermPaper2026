#!/bin/sh
set -e

echo "Ожидание базы данных..."
python -c "import time, psycopg2; time.sleep(2)" 2>/dev/null || true

echo "Применение миграций..."
python manage.py migrate --noinput

echo "Сбор статики..."
python manage.py collectstatic --noinput

echo "Запуск: $@"
exec "$@"