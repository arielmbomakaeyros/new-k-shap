# ============================================
# .env.example - Copy to .env and fill values
# ============================================

# Application
NODE_ENV=development
PORT=4000
API_PREFIX=api/v1
APP_NAME=K-shap
APP_URL=http://localhost:4000

# Frontend URL (for CORS and emails)
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/kshap
MONGODB_TEST_URI=mongodb://localhost:27017/kshap_test

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=3600

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key
JWT_REFRESH_EXPIRES_IN=7d

# Activation Token
ACTIVATION_TOKEN_EXPIRES_IN=24h
PASSWORD_RESET_TOKEN_EXPIRES_IN=1h

# Email (using Gmail SMTP - change to your provider)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@kshap.com
SMTP_FROM_NAME=K-shap Platform

# Kaeyros Admin Emails (for critical errors)
KAEYROS_ADMIN_EMAILS=admin@kaeyros.com,support@kaeyros.com

# File Upload
MAX_FILE_SIZE=10485760 # 10MB in bytes
ALLOWED_FILE_TYPES=.pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx
UPLOAD_DEST=./uploads

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# Pagination Defaults
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100

# Soft Delete Grace Period (days)
SOFT_DELETE_GRACE_PERIOD=30

# Logging
LOG_LEVEL=debug
LOG_FILE_ERROR=logs/error.log
LOG_FILE_COMBINED=logs/combined.log
LOG_FILE_ACCESS=logs/access.log

# Cron Jobs
ENABLE_CRON_JOBS=true
REMINDER_CRON_SCHEDULE=*/15 * * * * # Every 15 minutes
CLEANUP_CRON_SCHEDULE=0 2 * * * # Every day at 2 AM
SUBSCRIPTION_CHECK_SCHEDULE=0 0 * * * # Every day at midnight

# Socket.IO
SOCKET_CORS_ORIGIN=http://localhost:3000

# ============================================
# package.json
# ============================================
{
  "name": "kshap-backend",
  "version": "1.0.0",
  "description": "K-shap multi-tenant disbursement tracking platform",
  "author": "Kaeyros",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "prebuild": "rimraf dist",
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "seed": "ts-node src/database/seeders/seed.ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/config": "^3.1.1",
    "@nestjs/mongoose": "^10.0.2",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/schedule": "^4.0.0",
    "@nestjs/throttler": "^5.1.1",
    "@nestjs/platform-socket.io": "^10.3.0",
    "@nestjs/websockets": "^10.3.0",
    "mongoose": "^8.0.3",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "bcrypt": "^5.1.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "redis": "^4.6.11",
    "cache-manager": "^5.3.2",
    "cache-manager-redis-yet": "^4.1.2",
    "nodemailer": "^6.9.7",
    "handlebars": "^4.7.8",
    "winston": "^3.11.0",
    "winston-daily-rotate-file": "^4.7.1",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "multer": "^1.4.5-lts.1",
    "uuid": "^9.0.1",
    "luxon": "^3.4.4",
    "exceljs": "^4.4.0",
    "csv-parser": "^3.0.0",
    "json2csv": "^6.0.0-alpha.2",
    "socket.io": "^4.6.0",
    "rxjs": "^7.8.1",
    "reflect-metadata": "^0.1.14",
    "rimraf": "^5.0.5"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.2.1",
    "@nestjs/schematics": "^10.0.3",
    "@nestjs/testing": "^10.3.0",
    "@types/bcrypt": "^5.0.2",
    "@types/compression": "^1.7.5",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.11",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.10.6",
    "@types/nodemailer": "^6.4.14",
    "@types/passport-jwt": "^4.0.0",
    "@types/passport-local": "^1.0.38",
    "@types/supertest": "^6.0.2",
    "@types/uuid": "^9.0.7",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.2",
    "jest": "^29.7.0",
    "prettier": "^3.1.1",
    "source-map-support": "^0.5.21",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.1",
    "ts-loader": "^9.5.1",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.3.3"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}

# ============================================
# tsconfig.json
# ============================================
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "paths": {
      "@/*": ["src/*"],
      "@common/*": ["src/common/*"],
      "@modules/*": ["src/modules/*"],
      "@config/*": ["src/config/*"],
      "@database/*": ["src/database/*"]
    }
  }
}

# ============================================
# nest-cli.json
# ============================================
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": true,
    "tsConfigPath": "tsconfig.build.json"
  }
}

# ============================================
# Installation Commands
# ============================================

# 1. Create new NestJS project
npm i -g @nestjs/cli
nest new kshap-backend

# 2. Install all dependencies
cd kshap-backend
npm install @nestjs/mongoose mongoose
npm install @nestjs/config
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local
npm install @nestjs/schedule
npm install @nestjs/throttler
npm install @nestjs/platform-socket.io @nestjs/websockets socket.io
npm install redis cache-manager cache-manager-redis-yet
npm install bcrypt class-validator class-transformer
npm install nodemailer handlebars
npm install winston winston-daily-rotate-file
npm install helmet compression multer
npm install uuid luxon
npm install exceljs csv-parser json2csv

# Dev dependencies
npm install -D @types/bcrypt @types/compression @types/multer 
npm install -D @types/nodemailer @types/passport-jwt @types/passport-local
npm install -D @types/uuid

# 3. Create directory structure
mkdir -p src/{common/{decorators,guards,filters,interceptors,pipes,dto,interfaces,constants,utils},modules,config,database/schemas,jobs,email/templates,logger/transports,cache}
mkdir -p logs uploads/{invoices,receipts,documents}

# 4. Copy .env.example to .env and configure
cp .env.example .env

# 5. Start MongoDB (if using Docker)
docker run -d -p 27017:27017 --name kshap-mongo mongo:latest

# 6. Start Redis (if using Docker)
docker run -d -p 6379:6379 --name kshap-redis redis:latest

# 7. Run development server
npm run start:dev