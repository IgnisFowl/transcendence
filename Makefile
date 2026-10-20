# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: aline-arthur <aline-arthur@student.42.fr>  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/08/04 10:29:00 by aline-arthur      #+#    #+#               #
#    Updated: 2026/08/04 10:29:00 by aline-arthur     ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

NAME = habitquest

DOCKER_COMPOSE = docker compose

.PHONY: all up down build stop start restart status logs clean fclean re help

all: up

up:
	@echo "🚀 Subindo a infraestrutura do HabitQuest em HTTPS..."
	$(DOCKER_COMPOSE) up -d --build
	@echo "✅ HabitQuest rodando com sucesso!"
	@echo "👉 Acesse no seu navegador: https://localhost"

down:
	@echo "🛑 Parando os contêineres..."
	$(DOCKER_COMPOSE) down

build:
	@echo "🔨 Construindo imagens do Docker..."
	$(DOCKER_COMPOSE) build

stop:
	@echo "⏸️ Pausando serviços..."
	$(DOCKER_COMPOSE) stop

start:
	@echo "▶️ Iniciando serviços pausados..."
	$(DOCKER_COMPOSE) start

restart:
	@echo "🔄 Reiniciando serviços..."
	$(DOCKER_COMPOSE) restart

status ps:
	@echo "📋 Status dos contêineres:"
	$(DOCKER_COMPOSE) ps

logs:
	@echo "📜 Exibindo logs dos contêineres..."
	$(DOCKER_COMPOSE) logs -f

clean:
	@echo "🧹 Removendo contêineres e volumes..."
	$(DOCKER_COMPOSE) down -v

fclean: clean
	@echo "🗑️ Limpeza completa: removendo imagens, volumes e contêineres..."
	$(DOCKER_COMPOSE) down -v --rmi all --remove-orphans
	@docker system prune -af --volumes 2>/dev/null || true

re: fclean all

help:
	@echo "Comandos disponíveis no Makefile:"
	@echo "  make / make up  - Constrói e inicia todos os contêineres em segundo plano"
	@echo "  make down       - Para os contêineres sem remover volumes"
	@echo "  make status     - Exibe o status de todos os contêineres"
	@echo "  make logs       - Acompanha os logs em tempo real"
	@echo "  make clean      - Para os contêineres e remove os volumes"
	@echo "  make fclean     - Apaga tudo (imagens, volumes, contêineres)"
	@echo "  make re         - Reconstrução completa do zero"
