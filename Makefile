# Clinic Link Makefile
# Author: Your Name
# Date: April 26, 2025

# Default target
.PHONY: help
help:
	@echo "===== Clinic Link Makefile ====="
	@echo ""
	@echo "Development commands:"
	@echo "  make dev-up       - Start development environment containers"
	@echo "  make dev-down     - Stop development environment containers"
	@echo "  make dev-logs     - View logs from development containers"
	@echo "  make dev-restart  - Restart development services"
	@echo "  make dev-status   - Check status of development services"
	@echo ""
	@echo "Production commands:"
	@echo "  make prod-build   - Build production Docker images (requires VERSION=x.y.z)"
	@echo "  make prod-deploy  - Deploy to production (requires VERSION=x.y.z)"
	@echo "  make prod-up      - Start production environment (requires VERSION=x.y.z)"
	@echo "  make prod-down    - Stop production environment"
	@echo "  make prod-logs    - View logs from production containers"
	@echo "  make prod-status  - Check status of production services"
	@echo ""
	@echo "Shell access:"
	@echo "  make api-shell    - Access shell in API container"
	@echo "  make web-shell    - Access shell in web container"
	@echo "  make db-shell     - Access PostgreSQL shell"
	@echo ""
	@echo "Database commands:"
	@echo "  make db-backup    - Create a database backup"
	@echo ""
	@echo "Utility commands:"
	@echo "  make env-setup    - Create .env file with development defaults"
	@echo "  make build-api    - Build API Docker image for development"
	@echo "  make build-web    - Build web Docker image for development"
	@echo "  make clean        - Clean temporary files"

# Development environment commands
.PHONY: dev-up
dev-up:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development environment started"

.PHONY: dev-down
dev-down:
	@echo "Stopping development environment..."
	docker-compose -f docker-compose.dev.yml down
	@echo "Development environment stopped"

.PHONY: dev-logs
dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Production environment commands
.PHONY: prod-up
prod-up:
	@echo "Starting production environment..."
	@if [ -z "$VERSION" ]; then \
		echo "Error: VERSION environment variable not set. Use: VERSION=1.0.0 make prod-up"; \
		exit 1; \
	fi
	VERSION=$VERSION docker-compose up -d
	@echo "Production environment started with version: $VERSION"

.PHONY: prod-down
prod-down:
	@echo "Stopping production environment..."
	docker-compose down
	@echo "Production environment stopped"

.PHONY: prod-logs
prod-logs:
	docker-compose logs -f

.PHONY: prod-status
prod-status:
	@echo "Checking production services status..."
	docker-compose ps

# Shell access commands
.PHONY: api-shell
api-shell:
	docker-compose -f docker-compose.dev.yml exec api sh

.PHONY: web-shell
web-shell:
	docker-compose -f docker-compose.dev.yml exec web sh

# Development utility commands
.PHONY: dev-restart
dev-restart:
	@echo "Restarting development services..."
	docker-compose -f docker-compose.dev.yml restart
	@echo "Development services restarted"

.PHONY: dev-status
dev-status:
	@echo "Checking development services status..."
	docker-compose -f docker-compose.dev.yml ps

.PHONY: db-shell
db-shell:
	docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d clinic_management

# Database commands
.PHONY: db-backup
db-backup:
	@echo "Creating database backup..."
	@mkdir -p ./backups
	docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U postgres -d clinic_management > ./backups/backup-$(date +%Y%m%d-%H%M%S).sql
	@echo "Backup created in ./backups directory"

# Build commands
.PHONY: build-api
build-api:
	@echo "Building API image..."
	docker build -t clinic-link-api:dev .

.PHONY: build-web
build-web:
	@echo "Building web image..."
	docker build -t clinic-link-web:dev ./web

# Generate .env file
.PHONY: env-setup
env-setup:
	@echo "Creating .env file template if it doesn't exist..."
	@if [ ! -f .env ]; then \
		echo "NODE_ENV=development" > .env; \
		echo "DATABASE_URL=postgresql://postgres:postgres@postgres:5432/clinic_management" >> .env; \
		echo "REDIS_URL=redis://redis:6379" >> .env; \
		echo "JWT_SECRET=dev_secret" >> .env; \
		echo "MQTT_BROKER_URL=mqtt://mqtt-broker:1883" >> .env; \
		echo "FIREBASE_PROJECT_ID={}" >> .env; \
		echo "FIREBASE_PRIVATE_KEY={}" >> .env; \
		echo "FIREBASE_CLIENT_EMAIL={}" >> .env; \
		echo "VITE_API_URL=http://localhost:3000" >> .env; \
		echo "VITE_MQTT_BROKER_URL=ws://localhost:8084/mqtt" >> .env; \
		echo "VITE_FIREBASE_CONFIG={}" >> .env; \
		echo ".env file created with default development values"; \
	else \
		echo ".env file already exists"; \
	fi

# Production deployment commands
.PHONY: prod-build
prod-build:
	@echo "Building production images..."
	@if [ -z "$VERSION" ]; then \
		echo "Error: VERSION environment variable not set. Use: VERSION=1.0.0 make prod-build"; \
		exit 1; \
	fi
	docker build -t clinic-link-api:$VERSION .
	docker build -t clinic-link-web:$VERSION ./web
	@echo "Production images built with version: $VERSION"

.PHONY: prod-deploy
prod-deploy:
	@echo "Deploying to production..."
	@if [ -z "$VERSION" ]; then \
		echo "Error: VERSION environment variable not set. Use: VERSION=1.0.0 make prod-deploy"; \
		exit 1; \
	fi
	VERSION=$VERSION docker-compose up -d
	@echo "Production deployment completed with version: $VERSION"

.PHONY: clean
clean:
	@echo "Cleaning temporary files..."
	rm -rf ./backups/*
	@echo "Temporary files cleaned"