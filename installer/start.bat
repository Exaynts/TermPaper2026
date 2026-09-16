@echo off
chcp 65001 >nul
cd /d "%~dp0"

title MathJam Server

echo ============================================
echo   MathJam - запуск приложения
echo ============================================
echo.

REM ==========================================
REM 1. Создание .env
REM ==========================================
if exist backend\.env goto env_ready

echo Файл backend\.env не найден.
echo Создаю новый с автоматически сгенерированным SECRET_KEY...
echo.

python\python.exe -c "import secrets; c = open('backend/.env.example', encoding='utf-8').read(); c = c.replace('change-me-to-a-long-random-string', secrets.token_urlsafe(50)); open('backend/.env', 'w', encoding='utf-8').write(c)"

if errorlevel 1 goto env_error

echo Файл backend\.env успешно создан.
echo.

:env_ready

REM ==========================================
REM 2. Инструкция по EMAIL
REM ==========================================
findstr /R /C:"EMAIL_HOST_USER=." backend\.env >nul 2>&1
if not errorlevel 1 goto email_ready

if exist EMAIL_SETUP.txt goto email_exists

(
    echo ============================================
    echo   MATHJAM - НАСТРОЙКА EMAIL-УВЕДОМЛЕНИЙ
    echo ============================================
    echo.
    echo Сейчас MathJam НЕ отправляет письма на почту.
    echo Уведомления о покупке курса, завершении урока и т.д.
    echo выводятся только в окно консоли сервера.
    echo.
    echo Если вы хотите получать их на реальный Gmail -
    echo выполните 4 шага ниже.
    echo.
    echo ============================================
    echo ШАГ 1. Откройте файл .env в блокноте
    echo ============================================
    echo.
    echo   Файл: backend\.env
    echo   Папка установки MathJam
    echo.
    echo ============================================
    echo ШАГ 2. Найдите две строки
    echo ============================================
    echo.
    echo   EMAIL_HOST_USER=
    echo   EMAIL_HOST_PASSWORD=
    echo.
    echo ============================================
    echo ШАГ 3. Заполните их своими данными Gmail
    echo ============================================
    echo.
    echo   EMAIL_HOST_USER
    echo     Ваш полный адрес Gmail.
    echo     Пример: ivan.petrov@gmail.com
    echo.
    echo   EMAIL_HOST_PASSWORD
    echo     НЕ обычный пароль от почты!
    echo     Это 16-значный пароль приложения Gmail.
    echo.
    echo   Как его получить:
    echo     a) Включите двухэтапную аутентификацию:
    echo         https://myaccount.google.com/security
    echo.
    echo     b) Создайте пароль приложения:
    echo         https://myaccount.google.com/apppasswords
    echo.
    echo     c) Google покажет код вида abcd efgh ijkl mnop
    echo         Скопируйте его и вставьте БЕЗ пробелов.
    echo.
    echo ============================================
    echo ШАГ 4. Сохраните .env и перезапустите start.bat
    echo ============================================
    echo.
    echo Если настройка не нужна - просто игнорируйте
    echo этот файл. Приложение работает без email.
    echo ============================================
) > EMAIL_SETUP.txt

echo Создан файл EMAIL_SETUP.txt - инструкция по настройке email.
echo.

:email_exists
echo [i] Email-уведомления не настроены.
echo     Подробности см. в файле EMAIL_SETUP.txt
echo.

:email_ready

REM ==========================================
REM 3. Копирование демо-базы
REM ==========================================
if exist backend\db.sqlite3 goto demo_ready
if not exist demo\db.sqlite3 goto demo_ready

echo Первый запуск: установка демонстрационных данных...
copy demo\db.sqlite3 backend\db.sqlite3 >nul

if exist demo\media (
    xcopy demo\media backend\media /E /I /Y >nul
)

if exist demo\lessons (
    xcopy demo\lessons backend\media\lessons /E /I /Y >nul
)

echo Демо-курсы и уроки успешно установлены.
echo.

:demo_ready

REM ==========================================
REM 4. Миграции
REM ==========================================
echo Применение миграций...
python\python.exe backend\manage.py migrate --noinput
if errorlevel 1 goto migrate_error

REM ==========================================
REM 5. Суперпользователь
REM ==========================================
echo.
echo Проверка администратора...
python\python.exe backend\manage.py create_default_admin
if errorlevel 1 goto admin_error

echo [OK] Проверка администратора завершена.
echo.

REM ==========================================
REM 6. Файл ADMIN_CREDENTIALS.txt
REM ==========================================
if exist ADMIN_CREDENTIALS.txt goto admin_creds_ready

(
    echo ============================================
    echo   MATHJAM - ДАННЫЕ АДМИНИСТРАТОРА
    echo ============================================
    echo.
    echo Админка: http://127.0.0.1:8000/admin
    echo.
    echo Логин - email:  admin@mathjam.local
    echo Никнейм:        admin
    echo Пароль:         mathjam1^^!
    echo.
    echo ============================================
    echo ВАЖНО:
    echo   1. Смените пароль после первого входа.
    echo   2. Если сменили пароль - отредактируйте этот
    echo      файл или удалите его.
    echo   3. Если забыли пароль - удалите backend\db.sqlite3
    echo      и запустите start.bat заново. ВСЕ данные будут
    echo      потеряны, но админ создастся заново.
    echo ============================================
) > ADMIN_CREDENTIALS.txt

echo Создан файл ADMIN_CREDENTIALS.txt с данными администратора.
echo.

:admin_creds_ready

REM ==========================================
REM 7. Сбор статики
REM ==========================================
echo Сбор статических файлов...
python\python.exe backend\manage.py collectstatic --noinput >nul
if errorlevel 1 goto static_error

REM ==========================================
REM 8. Запуск
REM ==========================================
echo.
echo ============================================
echo   MathJam запущен!
echo ============================================
echo.
echo   Приложение:  http://127.0.0.1:8000
echo   Админка:     http://127.0.0.1:8000/admin
echo.
echo   Данные администратора:  ADMIN_CREDENTIALS.txt
echo   Настройка email:        EMAIL_SETUP.txt
echo.
echo   Для остановки сервера нажмите Ctrl+C
echo.
echo ============================================
echo.

start "" http://127.0.0.1:8000
python\python.exe -m waitress --listen=0.0.0.0:8000 backend.config.wsgi:application

echo.
echo Сервер остановлен.
pause
exit /b 0


REM ==========================================
REM ОБРАБОТЧИКИ ОШИБОК
REM ==========================================

:env_error
echo.
echo ОШИБКА: не удалось создать .env
echo Проверьте права доступа к папке: %CD%\backend\
pause
exit /b 1

:migrate_error
echo.
echo ОШИБКА при применении миграций!
pause
exit /b 1

:admin_error
echo.
echo ОШИБКА при создании администратора!
pause
exit /b 1

:static_error
echo.
echo ОШИБКА при сборе статики!
pause
exit /b 1