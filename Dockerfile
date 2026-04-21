FROM php:8.4-fpm

# System dependencies + PHP extensions
RUN apt-get update && apt-get install -y \
    git curl zip unzip \
    libzip-dev libpng-dev libonig-dev libxml2-dev \
    sqlite3 libsqlite3-dev libicu-dev \
    && docker-php-ext-install \
    pdo pdo_sqlite mbstring zip exif pcntl bcmath intl

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy composer files first (better caching)
COPY composer.json composer.lock ./

# Install dependencies WITHOUT running Laravel scripts (IMPORTANT FIX)
RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction \
    --prefer-dist \
    --no-progress \
    --no-scripts

# Copy full project
COPY . .

# Ensure .env exists (important for package discovery)
RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Run Laravel safe bootstrap AFTER copy
RUN php artisan package:discover || true
RUN php artisan wayfinder:generate || true

# Node (Vite build)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install \
    && npm run build

# Permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8080

CMD php artisan serve --host=0.0.0.0 --port=8080