.PHONY: dev dev-bg prod down stop logs logs-fe logs-be \
        shell-fe shell-be rebuild rebuild-fe rebuild-be \
        reset ps health

# ── Development ──────────────────────────────────────────────────────────────

dev:                        ## Start all services with hot reload (foreground)
	docker compose up --build

dev-bg:                     ## Start all services in the background
	docker compose up --build -d

prod:                       ## Start production build
	docker compose -f docker-compose.prod.yml up --build -d

# ── Control ───────────────────────────────────────────────────────────────────

down:                       ## Stop and remove containers (keeps volumes)
	docker compose down

stop:                       ## Stop containers without removing them
	docker compose stop

# ── Logs ─────────────────────────────────────────────────────────────────────

logs:                       ## Tail logs for all services
	docker compose logs -f

logs-fe:                    ## Tail frontend logs
	docker compose logs -f frontend

logs-be:                    ## Tail backend logs
	docker compose logs -f backend

# ── Shell access ──────────────────────────────────────────────────────────────

shell-fe:                   ## Open shell in the frontend container
	docker compose exec frontend sh

shell-be:                   ## Open shell in the backend container
	docker compose exec backend bash

# ── Build management ──────────────────────────────────────────────────────────

rebuild:                    ## Rebuild all images from scratch (no cache)
	docker compose build --no-cache

rebuild-fe:                 ## Rebuild only the frontend image
	docker compose build --no-cache frontend

rebuild-be:                 ## Rebuild only the backend image
	docker compose build --no-cache backend

# ── Reset ─────────────────────────────────────────────────────────────────────

reset:                      ## Nuclear reset — remove containers, volumes, rebuild
	docker compose down -v --remove-orphans
	docker compose build --no-cache
	docker compose up

# ── Status ────────────────────────────────────────────────────────────────────

ps:                         ## Show running containers
	docker compose ps

health:                     ## Check service health endpoints
	@echo "Backend:  $$(curl -s http://localhost:8000/api/health | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get(\"status\",\"?\")))' 2>/dev/null || echo 'offline')"
	@echo "Frontend: $$(curl -sI http://localhost:3000 | head -1 | tr -d '\r')"

# ── Optional databases ────────────────────────────────────────────────────────

db-up:                      ## Start Postgres (optional)
	docker compose --profile db up -d postgres

graph-up:                   ## Start Neo4j (optional)
	docker compose --profile graph up -d neo4j

help:                       ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
