# Hanaka Cake — Setup Guide

> Panduan lengkap setup development environment untuk project Hanaka Cake.
> Mencakup **frontend (React)** dan **backend (Slim PHP + MySQL)** yang direncanakan.

---

## Daftar Isi

1. [Prerequisites](#1-prerequisites)
2. [Frontend Setup](#2-frontend-setup)
3. [Backend Setup (Slim PHP + MySQL)](#3-backend-setup-slim-php--mysql)
4. [Database Schema](#4-database-schema)
5. [API Endpoints Specification](#5-api-endpoints-specification)
6. [Environment Variables](#6-environment-variables)
7. [Deployment](#7-deployment)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Prerequisites

### Untuk Frontend
| Software | Versi Minimum | Cek Versi |
|---|---|---|
| Node.js | 18.x atau 20.x+ | `node -v` |
| npm | 9.x+ | `npm -v` |
| Git | 2.x+ | `git -v` |

### Untuk Backend (jika setup backend)
| Software | Versi Minimum | Cek Versi |
|---|---|---|
| PHP | 8.2+ | `php -v` |
| Composer | 2.x+ | `composer -V` |
| MySQL | 8.0+ | `mysql --version` |
| XAMPP / Laragon / Docker | (opsional) | Untuk local dev environment |

---

## 2. Frontend Setup

### 2.1 Clone & Install

```bash
# Clone repository
git clone https://github.com/Urcane/hanaka-project-front-end.git
cd hanaka-project-front-end

# Install dependencies
npm install
```

### 2.2 Jalankan Development Server

```bash
npm run dev
```

Buka browser di `http://localhost:5173` (default Vite).

### 2.3 Build untuk Production

```bash
# Build
npm run build

# Preview hasil build
npm run preview
```

### 2.4 Lint

```bash
npm run lint
```

### 2.5 Struktur Folder Frontend

```
hanaka-project-front-end/
├── index.html              # Entry HTML
├── package.json
├── vite.config.js          # Vite + React Compiler config
├── eslint.config.js        # ESLint flat config
├── public/                 # Static assets (favicon, dll)
├── src/
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Route definitions
│   ├── index.css           # Global CSS variables
│   ├── assets/             # Gambar (logo, hero, foto produk)
│   ├── components/         # Reusable components
│   ├── context/            # React Context (state management)
│   ├── data/               # Data statis katalog
│   ├── models/             # Business logic layer
│   ├── pages/              # Page components (per route)
│   ├── services/           # I/O services (storage, QR)
│   ├── styles/             # CSS stylesheets
│   ├── utils/              # Utility functions
│   └── validation/         # Custom validation framework
```

### 2.6 Dependencies Utama

| Package | Versi | Fungsi |
|---|---|---|
| `react` | ^19.2.4 | UI library |
| `react-dom` | ^19.2.4 | React DOM renderer |
| `react-router-dom` | ^7.14.1 | Client-side routing |
| `qrcode` | ^1.5.4 | Generate QR code untuk QRIS |

### 2.7 Dev Dependencies Utama

| Package | Versi | Fungsi |
|---|---|---|
| `vite` | ^8.0.4 | Build tool & dev server |
| `@vitejs/plugin-react` | ^6.0.1 | React support untuk Vite |
| `@rolldown/plugin-babel` | ^0.2.2 | Babel integration |
| `babel-plugin-react-compiler` | ^1.0.0 | React Compiler |
| `eslint` | ^9.39.4 | Linter |
| `eslint-plugin-react-hooks` | ^7.0.1 | Rules untuk React Hooks |
| `eslint-plugin-react-refresh` | ^0.5.2 | Rules untuk React Refresh/HMR |

---

## 3. Backend Setup (Slim PHP + MySQL)

> **Status**: Backend belum diimplementasikan. Bagian ini adalah spesifikasi & panduan setup untuk fase berikutnya.

### 3.1 Inisialisasi Project Backend

```bash
# Buat folder backend (di luar atau sejajar frontend)
mkdir hanaka-backend
cd hanaka-backend

# Inisialisasi Composer
composer init --name="hanaka/backend" --type="project" --require="slim/slim:^4.0" --require="slim/psr7:^1.6"

# Install Slim PHP + dependencies
composer require slim/slim:"^4.0"
composer require slim/psr7:"^1.6"
composer require php-di/php-di:"^7.0"          # Dependency injection
composer require firebase/php-jwt:"^6.10"       # JWT authentication
composer require vlucas/phpdotenv:"^5.6"        # Environment variables
composer require selective/basepath:"^2.2"      # Base path middleware
composer require tuupola/slim-jwt-auth:"^3.7"   # JWT middleware untuk Slim

# Dev dependencies
composer require --dev phpunit/phpunit:"^10.0"
```

### 3.2 Struktur Folder Backend (Rekomendasi)

```
hanaka-backend/
├── composer.json
├── .env                    # Environment variables (JANGAN commit!)
├── .env.example            # Template env
├── .htaccess               # Apache rewrite rules
├── public/
│   └── index.php           # Entry point (front controller)
├── src/
│   ├── Actions/            # Route handlers (controllers)
│   │   ├── Auth/
│   │   │   ├── LoginAction.php
│   │   │   ├── RegisterAction.php
│   │   │   └── LogoutAction.php
│   │   ├── Product/
│   │   │   ├── ListProductsAction.php
│   │   │   └── GetProductAction.php
│   │   ├── Cart/
│   │   │   ├── GetCartAction.php
│   │   │   ├── AddCartItemAction.php
│   │   │   ├── UpdateCartItemAction.php
│   │   │   └── RemoveCartItemAction.php
│   │   ├── Order/
│   │   │   ├── CreateOrderAction.php
│   │   │   ├── ListOrdersAction.php
│   │   │   ├── GetOrderAction.php
│   │   │   └── MarkOrderPaidAction.php
│   │   └── Payment/
│   │       └── CreateQrisAction.php
│   ├── Domain/             # Domain models & business logic
│   │   ├── User.php
│   │   ├── Product.php
│   │   ├── CartItem.php
│   │   ├── Order.php
│   │   └── OrderItem.php
│   ├── Infrastructure/     # Database, external services
│   │   ├── Database.php
│   │   ├── Repositories/
│   │   │   ├── UserRepository.php
│   │   │   ├── ProductRepository.php
│   │   │   ├── CartRepository.php
│   │   │   └── OrderRepository.php
│   │   └── Services/
│   │       ├── JwtService.php
│   │       └── QrisPaymentService.php
│   ├── Middleware/
│   │   ├── CorsMiddleware.php
│   │   ├── JwtMiddleware.php
│   │   └── JsonBodyParser.php
│   └── Validation/
│       ├── Validator.php
│       ├── AuthValidator.php
│       ├── CartValidator.php
│       ├── CheckoutValidator.php
│       └── Rules/
│           ├── Required.php
│           ├── Email.php
│           ├── PhoneId.php
│           ├── MinLength.php
│           ├── MaxLength.php
│           └── StrongPassword.php
├── config/
│   ├── routes.php          # Route definitions
│   ├── container.php       # DI container bindings
│   ├── middleware.php       # Global middleware stack
│   └── settings.php        # App settings
├── database/
│   ├── migrations/         # SQL migration files
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_products.sql
│   │   ├── 003_create_product_sizes.sql
│   │   ├── 004_create_carts.sql
│   │   ├── 005_create_cart_items.sql
│   │   ├── 006_create_orders.sql
│   │   ├── 007_create_order_items.sql
│   │   └── 008_seed_products.sql
│   └── seeds/
│       └── products_seeder.sql
├── storage/
│   └── logs/               # Application logs
└── tests/
    ├── Unit/
    └── Integration/
```

### 3.3 Entry Point (`public/index.php`)

```php
<?php

declare(strict_types=1);

use DI\ContainerBuilder;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Build DI Container
$containerBuilder = new ContainerBuilder();
$containerBuilder->addDefinitions(__DIR__ . '/../config/container.php');
$container = $containerBuilder->build();

// Create Slim App
AppFactory::setContainer($container);
$app = AppFactory::create();

// Register middleware
(require __DIR__ . '/../config/middleware.php')($app);

// Register routes
(require __DIR__ . '/../config/routes.php')($app);

$app->run();
```

### 3.4 CORS Middleware (untuk development)

```php
<?php
// src/Middleware/CorsMiddleware.php

namespace Hanaka\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Response;

class CorsMiddleware implements MiddlewareInterface
{
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ): ResponseInterface {
        // Handle preflight
        if ($request->getMethod() === 'OPTIONS') {
            $response = new Response();
        } else {
            $response = $handler->handle($request);
        }

        return $response
            ->withHeader('Access-Control-Allow-Origin', $_ENV['CORS_ORIGIN'] ?? 'http://localhost:5173')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
            ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            ->withHeader('Access-Control-Allow-Credentials', 'true');
    }
}
```

### 3.5 Setup MySQL

```bash
# Login ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE hanaka_cake CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Buat user khusus (opsional, recommended)
CREATE USER 'hanaka_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON hanaka_cake.* TO 'hanaka_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3.6 Koneksi Database

```php
<?php
// src/Infrastructure/Database.php

namespace Hanaka\Infrastructure;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $connection = null;

    public static function getConnection(): PDO
    {
        if (self::$connection === null) {
            try {
                self::$connection = new PDO(
                    sprintf(
                        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
                        $_ENV['DB_HOST'],
                        $_ENV['DB_PORT'],
                        $_ENV['DB_NAME']
                    ),
                    $_ENV['DB_USER'],
                    $_ENV['DB_PASS'],
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ]
                );
            } catch (PDOException $e) {
                throw new \RuntimeException('Database connection failed: ' . $e->getMessage());
            }
        }

        return self::$connection;
    }
}
```

---

## 4. Database Schema

### 4.1 ERD (Entity Relationship)

```
┌──────────┐     ┌────────────────┐     ┌──────────────┐
│  users   │     │   products     │     │ product_sizes│
├──────────┤     ├────────────────┤     ├──────────────┤
│ id (PK)  │     │ id (PK)        │     │ id (PK)      │
│ full_name│     │ name           │     │ product_id   │──→ products.id
│ email    │     │ short_desc     │     │ label        │
│ phone    │     │ long_desc      │     │ full_label   │
│ password │     │ featured       │     │ price        │
│ created_at│    │ cover_gradient │     └──────────────┘
└──────────┘     │ max_msg_length │
     │           │ cover_image    │
     │           │ created_at     │
     │           └────────────────┘
     │
     ├───────────────┐
     │               │
┌────▼─────┐   ┌─────▼──────┐
│  carts   │   │  orders    │
├──────────┤   ├────────────┤
│ id (PK)  │   │ id (PK)    │
│ user_id  │   │ order_num  │
│ created_at│  │ user_id    │──→ users.id (nullable utk guest)
└──────────┘   │ cust_name  │
     │         │ cust_phone │
┌────▼───────┐ │ fulfill    │
│ cart_items │ │ address    │
├────────────┤ │ pay_method │
│ id (PK)    │ │ pay_status │
│ cart_id    │ │ status     │
│ product_id │ │ notes      │
│ size_id    │ │ total_price│
│ color_text │ │ created_at │
│ theme      │ └────────────┘
│ message    │       │
│ quantity   │ ┌─────▼───────┐
│ unit_price │ │ order_items │
│ total_price│ ├─────────────┤
└────────────┘ │ id (PK)     │
               │ order_id    │──→ orders.id
               │ product_id  │──→ products.id
               │ size_id     │──→ product_sizes.id
               │ product_name│
               │ color_text  │
               │ theme       │
               │ message     │
               │ quantity    │
               │ unit_price  │
               │ total_price │
               └─────────────┘
```

### 4.2 Migration SQL

```sql
-- 001_create_users.sql
CREATE TABLE users (
    id VARCHAR(20) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 002_create_products.sql
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_description TEXT,
    long_description TEXT,
    featured BOOLEAN DEFAULT FALSE,
    cover_gradient VARCHAR(255),
    cover_image VARCHAR(255) DEFAULT NULL,
    max_message_length INT DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 003_create_product_sizes.sql
CREATE TABLE product_sizes (
    id VARCHAR(20) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    label VARCHAR(10) NOT NULL,
    full_label VARCHAR(50) NOT NULL,
    price INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_sizes_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 004_create_carts.sql
CREATE TABLE carts (
    id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20) DEFAULT NULL,
    session_token VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_carts_user (user_id),
    INDEX idx_carts_session (session_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 005_create_cart_items.sql
CREATE TABLE cart_items (
    id VARCHAR(20) PRIMARY KEY,
    cart_id VARCHAR(20) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    size_id VARCHAR(20) NOT NULL,
    color_text VARCHAR(40) NOT NULL DEFAULT '',
    theme VARCHAR(40) NOT NULL DEFAULT '',
    message VARCHAR(60) NOT NULL DEFAULT '',
    quantity TINYINT UNSIGNED NOT NULL DEFAULT 1,
    unit_price INT NOT NULL,
    total_price INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (size_id) REFERENCES product_sizes(id),
    INDEX idx_cart_items_cart (cart_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 006_create_orders.sql
CREATE TABLE orders (
    id VARCHAR(20) PRIMARY KEY,
    order_number VARCHAR(30) NOT NULL UNIQUE,
    user_id VARCHAR(20) DEFAULT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    fulfillment_method ENUM('pickup', 'delivery') NOT NULL,
    pickup_date DATE DEFAULT NULL,
    pickup_time TIME DEFAULT NULL,
    delivery_address TEXT,
    address_note VARCHAR(120) DEFAULT '',
    payment_method ENUM('cash', 'qris') NOT NULL,
    payment_status ENUM('pending', 'paid', 'cod') NOT NULL DEFAULT 'pending',
    status ENUM('menunggu konfirmasi', 'diproses', 'siap diambil', 'diantar', 'selesai', 'dibatalkan') NOT NULL DEFAULT 'menunggu konfirmasi',
    notes TEXT,
    total_price INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_number (order_number),
    INDEX idx_orders_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 007_create_order_items.sql
CREATE TABLE order_items (
    id VARCHAR(20) PRIMARY KEY,
    order_id VARCHAR(20) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    size_id VARCHAR(20) NOT NULL,
    size_label VARCHAR(10) NOT NULL,
    color_text VARCHAR(40) NOT NULL DEFAULT '',
    theme VARCHAR(40) NOT NULL DEFAULT '',
    message VARCHAR(60) NOT NULL DEFAULT '',
    quantity TINYINT UNSIGNED NOT NULL DEFAULT 1,
    unit_price INT NOT NULL,
    total_price INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_order_items_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.3 Seed Data Produk

```sql
-- 008_seed_products.sql

INSERT INTO products (id, name, short_description, long_description, featured, cover_gradient, max_message_length) VALUES
('black-forest', 'Black Forest Cake',
 'Manis, lembut, dengan perpaduan cokelat, krim, dan alsen segar dari ceri.',
 'Tekstur lembut dan rasa cokelat yang kaya berpadu dengan krim segar. Lapisan ceri di atasnya memberikan rasa manis dan segar yang seimbang, menjadikannya kue klasik yang sempurna untuk berbagai momen.',
 TRUE, 'linear-gradient(135deg, #8a5a44 0%, #bc8b73 100%)', 60),

('red-velvet', 'Red Velvet Cake',
 'Manis, lembut, sedikit cokelat dengan sentuhan keju krim yang gurih.',
 'Tekstur lembut dan rasa manis ringan berpadu sentuhan cokelat. Lapisan krim keju di atasnya memberikan rasa gurih dan creamy yang seimbang, menjadikannya kue yang elegan dan istimewa untuk berbagai momen.',
 TRUE, 'linear-gradient(135deg, #d38182 0%, #f0b1a6 100%)', 60),

('vanilla-cake', 'Vanila Cake',
 'Sponge vanilla ringan dengan buttercream silky.',
 'Sponge vanilla yang ringan dan lembut dengan lapisan buttercream silky. Rasa klasik yang selalu disukai, cocok untuk segala acara.',
 FALSE, 'linear-gradient(135deg, #f7e9d5 0%, #f3d7bb 100%)', 60),

('lemon-cake', 'Lemon Cake',
 'Rasa lemon segar dengan frosting cream cheese ringan.',
 'Cake lemon yang segar dengan frosting cream cheese ringan. Perpaduan rasa asam manis yang menyegarkan, cocok untuk pecinta citrus.',
 FALSE, 'linear-gradient(135deg, #f5e6a3 0%, #e8d77b 100%)', 60),

('rainbow-cake', 'Rainbow Cake',
 'Cake warna-warni yang ceria dengan rasa vanilla lembut.',
 'Cake berlapis warna-warni yang ceria dengan rasa vanilla lembut di setiap lapisannya. Pilihan sempurna untuk acara ulang tahun anak-anak.',
 FALSE, 'linear-gradient(135deg, #f5a3a3 0%, #a3d5f5 50%, #a3f5c4 100%)', 60);

-- Semua produk pakai ukuran standar yang sama
INSERT INTO product_sizes (id, product_id, label, full_label, price) VALUES
('size-16-bf', 'black-forest', '16', 'Ukuran 16 cm', 120000),
('size-18-bf', 'black-forest', '18', 'Ukuran 18 cm', 170000),
('size-20-bf', 'black-forest', '20', 'Ukuran 20 cm', 220000),
('size-22-bf', 'black-forest', '22', 'Ukuran 22 cm', 270000),

('size-16-rv', 'red-velvet', '16', 'Ukuran 16 cm', 120000),
('size-18-rv', 'red-velvet', '18', 'Ukuran 18 cm', 170000),
('size-20-rv', 'red-velvet', '20', 'Ukuran 20 cm', 220000),
('size-22-rv', 'red-velvet', '22', 'Ukuran 22 cm', 270000),

('size-16-vc', 'vanilla-cake', '16', 'Ukuran 16 cm', 120000),
('size-18-vc', 'vanilla-cake', '18', 'Ukuran 18 cm', 170000),
('size-20-vc', 'vanilla-cake', '20', 'Ukuran 20 cm', 220000),
('size-22-vc', 'vanilla-cake', '22', 'Ukuran 22 cm', 270000),

('size-16-lc', 'lemon-cake', '16', 'Ukuran 16 cm', 120000),
('size-18-lc', 'lemon-cake', '18', 'Ukuran 18 cm', 170000),
('size-20-lc', 'lemon-cake', '20', 'Ukuran 20 cm', 220000),
('size-22-lc', 'lemon-cake', '22', 'Ukuran 22 cm', 270000),

('size-16-rc', 'rainbow-cake', '16', 'Ukuran 16 cm', 120000),
('size-18-rc', 'rainbow-cake', '18', 'Ukuran 18 cm', 170000),
('size-20-rc', 'rainbow-cake', '20', 'Ukuran 20 cm', 220000),
('size-22-rc', 'rainbow-cake', '22', 'Ukuran 22 cm', 270000);
```

---

## 5. API Endpoints Specification

### 5.1 Authentication

```
POST   /api/auth/register
       Body: { fullName, email, phone, password, confirmPassword }
       Response: { ok: true, user: {...}, token: "jwt..." }

POST   /api/auth/login
       Body: { email, password }
       Response: { ok: true, user: {...}, token: "jwt..." }

POST   /api/auth/logout
       Headers: Authorization: Bearer <token>
       Response: { ok: true }

GET    /api/auth/me
       Headers: Authorization: Bearer <token>
       Response: { ok: true, user: {...} }
```

### 5.2 Products

```
GET    /api/products
       Query: ?featured=true (opsional)
       Response: { ok: true, products: [...] }

GET    /api/products/:productId
       Response: { ok: true, product: { ...product, sizes: [...] } }
```

### 5.3 Cart

```
GET    /api/cart
       Headers: Authorization: Bearer <token> (opsional, bisa session-based utk guest)
       Response: { ok: true, items: [...], subtotal: 0 }

POST   /api/cart/items
       Body: { productId, sizeId, colorText, theme, message, quantity }
       Response: { ok: true, item: {...} }

PUT    /api/cart/items/:itemId
       Body: { sizeId, colorText, theme, message, quantity }
       Response: { ok: true, item: {...} }

PATCH  /api/cart/items/:itemId/quantity
       Body: { quantity }
       Response: { ok: true, item: {...} }

DELETE /api/cart/items/:itemId
       Response: { ok: true }

DELETE /api/cart
       Response: { ok: true }
```

### 5.4 Orders

```
POST   /api/orders
       Body: { customerName, phone, pickupMethod, pickupDate?, pickupTime?,
               address?, addressNote?, paymentMethod }
       Response: { ok: true, order: {...} }

GET    /api/orders
       Headers: Authorization: Bearer <token>
       Response: { ok: true, orders: [...] }

GET    /api/orders/:orderId
       Response: { ok: true, order: {...} }

PATCH  /api/orders/:orderId/pay
       Response: { ok: true, order: {...} }
```

### 5.5 Payment

```
POST   /api/payments/qris
       Body: { orderId }
       Response: { ok: true, qrImageUrl: "...", expiresAt: "..." }
```

### 5.6 Store Info

```
GET    /api/store/profile
       Response: { ok: true, store: { name, address, hours, whatsapp, instagram } }
```

### 5.7 Error Response Format

```json
{
  "ok": false,
  "error": "Pesan error dalam Bahasa Indonesia.",
  "errors": {
    "fieldName": "Pesan validasi per field."
  }
}
```

### 5.8 Route Config (`config/routes.php`)

```php
<?php

use Slim\App;
use Slim\Routing\RouteCollectorProxy;

return function (App $app) {
    // CORS preflight
    $app->options('/{routes:.+}', function ($request, $response) {
        return $response;
    });

    $app->group('/api', function (RouteCollectorProxy $group) {
        // Auth
        $group->post('/auth/register', \Hanaka\Actions\Auth\RegisterAction::class);
        $group->post('/auth/login', \Hanaka\Actions\Auth\LoginAction::class);
        $group->post('/auth/logout', \Hanaka\Actions\Auth\LogoutAction::class);
        $group->get('/auth/me', \Hanaka\Actions\Auth\MeAction::class);

        // Products
        $group->get('/products', \Hanaka\Actions\Product\ListProductsAction::class);
        $group->get('/products/{productId}', \Hanaka\Actions\Product\GetProductAction::class);

        // Cart
        $group->get('/cart', \Hanaka\Actions\Cart\GetCartAction::class);
        $group->post('/cart/items', \Hanaka\Actions\Cart\AddCartItemAction::class);
        $group->put('/cart/items/{itemId}', \Hanaka\Actions\Cart\UpdateCartItemAction::class);
        $group->patch('/cart/items/{itemId}/quantity', \Hanaka\Actions\Cart\UpdateCartQuantityAction::class);
        $group->delete('/cart/items/{itemId}', \Hanaka\Actions\Cart\RemoveCartItemAction::class);
        $group->delete('/cart', \Hanaka\Actions\Cart\ClearCartAction::class);

        // Orders
        $group->post('/orders', \Hanaka\Actions\Order\CreateOrderAction::class);
        $group->get('/orders', \Hanaka\Actions\Order\ListOrdersAction::class);
        $group->get('/orders/{orderId}', \Hanaka\Actions\Order\GetOrderAction::class);
        $group->patch('/orders/{orderId}/pay', \Hanaka\Actions\Order\MarkOrderPaidAction::class);

        // Payment
        $group->post('/payments/qris', \Hanaka\Actions\Payment\CreateQrisAction::class);

        // Store
        $group->get('/store/profile', \Hanaka\Actions\Store\GetProfileAction::class);
    });
};
```

---

## 6. Environment Variables

### 6.1 Frontend (`vite.config.js` / `.env`)

```env
# .env (frontend, opsional — untuk konfigurasi API base URL)
VITE_API_BASE_URL=http://localhost:8080/api
```

Akses di kode frontend:
```js
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
```

### 6.2 Backend (`.env`)

```env
# Application
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8080

# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=hanaka_cake
DB_USER=hanaka_user
DB_PASS=your_secure_password

# JWT
JWT_SECRET=your-very-long-random-secret-key-minimum-32-chars
JWT_EXPIRY=86400

# CORS
CORS_ORIGIN=http://localhost:5173

# QRIS / Payment Gateway (Midtrans example)
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# Store Info
STORE_NAME=Hanaka Cake
STORE_WHATSAPP=6281299998888
STORE_INSTAGRAM=hanakacake.id
```

### 6.3 `.env.example`

```env
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8080

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=hanaka_cake
DB_USER=root
DB_PASS=

JWT_SECRET=CHANGE_THIS_TO_RANDOM_STRING
JWT_EXPIRY=86400

CORS_ORIGIN=http://localhost:5173

MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
```

---

## 7. Deployment

### 7.1 Frontend (Netlify / Vercel / Static Hosting)

```bash
# Build
npm run build

# Output ada di folder dist/
# Upload folder dist/ ke hosting
```

**Netlify config** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Vercel config** (`vercel.json`):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 7.2 Backend (Shared Hosting / VPS)

```bash
# Upload ke server via FTP/SSH
# Pastikan document root mengarah ke folder public/

# Install dependencies di server
composer install --no-dev --optimize-autoloader

# Setup .env
cp .env.example .env
# Edit .env dengan credentials production

# Jalankan migrations
php database/migrate.php

# Set permissions
chmod -R 775 storage/
```

**Apache `.htaccess`** (di `public/`):
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.php [QSA,L]
```

---

## 8. Troubleshooting

### Frontend

| Masalah | Solusi |
|---|---|
| `npm run dev` error | Pastikan Node.js ≥ 18. Hapus `node_modules` lalu `npm install` ulang |
| HMR tidak jalan | Cek `vite.config.js`, pastikan plugin react terdaftar |
| ESLint error "only-export-components" | Pisah context ke 3 file: object, hook, provider |
| Blank page setelah refresh | Pastikan routing pakai `BrowserRouter` dan server serve `index.html` untuk semua path |
| LocalStorage penuh | Clear via DevTools → Application → Local Storage |

### Backend

| Masalah | Solusi |
|---|---|
| CORS error | Pastikan `CorsMiddleware` aktif dan `CORS_ORIGIN` sesuai URL frontend |
| 404 semua route | Pastikan `.htaccess` aktif dan `mod_rewrite` enabled |
| Database connection refused | Cek `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS` di `.env` |
| JWT invalid | Pastikan `JWT_SECRET` sama di semua instance, dan token belum expired |
| Password hash mismatch | Gunakan `password_hash()` untuk hash dan `password_verify()` untuk verifikasi |

### Database

| Masalah | Solusi |
|---|---|
| Migration gagal | Cek urutan file migration, pastikan foreign key reference sudah ada |
| Emoji rusak | Pastikan charset `utf8mb4` dan collation `utf8mb4_unicode_ci` |
| Duplicate entry | Cek UNIQUE constraint, terutama pada `email` di `users` |

---

## Catatan Tambahan

### Frontend → Backend Migration Checklist

Ketika backend sudah siap, lakukan langkah-langkah berikut di frontend:

1. **Buat `src/services/apiService.js`** — wrapper `fetch()` dengan base URL, JWT header, error handling
2. **Ganti `storageService.js`** — dari localStorage ke API calls
3. **Update `AppContext.jsx`** — state initialization dari API, bukan localStorage
4. **Hapus `src/data/products.js`** — produk diambil dari `GET /api/products`
5. **Update auth flow** — simpan JWT di httpOnly cookie atau memory (bukan localStorage)
6. **Update QRIS** — dari generate lokal ke `POST /api/payments/qris`
7. **Tambah loading states** — karena data sekarang async dari server
8. **Tambah error boundary** — untuk handle network errors
9. **Update guest cart** — gunakan session token dari backend

### Security Checklist (Backend)

- [ ] Password hashing dengan `password_hash(PASSWORD_BCRYPT)`
- [ ] SQL injection prevention via prepared statements (PDO)
- [ ] XSS prevention — sanitize output
- [ ] CSRF protection untuk form submissions
- [ ] Rate limiting pada endpoint auth
- [ ] Input validation di server-side (jangan trust client)
- [ ] JWT secret minimal 32 karakter random
- [ ] HTTPS di production
- [ ] `.env` masuk `.gitignore`
- [ ] Error messages tidak expose internal details di production
