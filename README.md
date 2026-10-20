*This project has been created as part of the 42 curriculum by aline-arthur.*

# ⚔️ HabitQuest: Crônicas da Automotivação (ft_transcendence)

[![42 Project](https://img.shields.io/badge/42-ft__transcendence-blue)](https://42.fr)
[![Docker](https://img.shields.io/badge/Docker-Comando--Único-blue?logo=docker)](https://www.docker.com/)
[![HTTPS](https://img.shields.io/badge/Segurança-HTTPS-brightgreen?logo=nginx)](https://nginx.org/)
[![Pontuação de Módulos](https://img.shields.io/badge/Módulos-22_Pontos-gold)](https://42.fr)

---

## 📖 Descrição

O **HabitQuest** é uma aplicação web gamificada no estilo RPG de produtividade e rastreamento de hábitos em tempo real, desenvolvida para o projeto final **ft_transcendence** do Common Core da 42.

Em vez de listas de tarefas tradicionais e entediantes, o **HabitQuest** transforma seus hábitos da vida real em uma aventura épica de RPG:
- **Questionário de Seleção de Classe**: Responda a um teste interativo de 5 perguntas para descobrir a sua classe de herói:
  - 🧙‍♂️ **Mago**: Foco em Estudos, Leitura e Aprendizado (**Inteligência**)
  - ⚔️ **Guerreiro**: Foco em Exercícios, Academia e Treino Físico (**Força**)
  - 🗡️ **Ladino**: Foco em Disciplina, Produtividade e Agilidade (**Destreza**)
  - 🌿 **Clérigo**: Foco em Meditação, Sono e Saúde Mental (**Sabedoria**)
  - 🎭 **Bardo**: Foco em Socialização, Idiomas e Criatividade (**Carisma**)
- **Missões Diárias e Progressão de RPG**: Conclua hábitos diários para ganhar XP, Ouro, Mana e subir o nível dos atributos do seu herói.
- **Raides de Chefe Co-op em Tempo Real (WebSockets)**: Junte-se a grupos de raide multijogador onde os membros atacam, lançam feitiços e curam em tempo real contra Chefes de Mundo na tela!
- **Mestre da Masmorra com IA**: Gera rotinas de hábitos personalizadas e histórias de fundo RPG adaptadas à sua classe.

---

## 🚀 Instruções de Execução

### Pré-requisitos
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

### Implantação com Makefile (Padrão 42)
Siga o padrão clássico da 42 utilizando o `Makefile` na raiz do repositório:

```bash
# Para compilar e subir a aplicação em segundo plano:
make

# Ou explicitamente:
make up
```

### Regras Principais do Makefile:
- `make` ou `make up`: Compila as imagens Docker e inicia todos os contêineres em HTTPS em segundo plano (`-d`).
- `make down`: Para os contêineres mantendo os dados persistidos.
- `make status`: Exibe o estado e portas de todos os contêineres rodando.
- `make logs`: Exibe os logs unificados em tempo real.
- `make clean`: Para os contêineres e remove os volumes.
- `make fclean`: Limpeza profunda. Apaga todos os contêineres, volumes e imagens Docker.
- `make re`: Executa `fclean` e reconstrói todo o ambiente do zero.

A aplicação iniciará todos os serviços em contêineres:
- **Proxy Nginx HTTPS**: `https://localhost` (Porta 443)
- **Frontend (React)**: `http://localhost:3000`
- **Backend (Express + WebSockets)**: `http://localhost:5000`
- **Banco de Dados PostgreSQL**: Porta `5432`

> **Nota**: Acesse `https://localhost` no Google Chrome. Aceite o certificado SSL autoassinado no seu navegador.

---

## 🛠️ Tecnologias e Escolhas Arquiteturais

- **Frontend**: React (TypeScript), Sistema de Design RPG Personalizado em Dark Mode (CSS Vanilla + Glassmorphism), Ícones Lucide, API Canvas 2D para a Arena do Chefe, cliente Socket.io.
- **Backend**: Node.js + Express (TypeScript), servidor Socket.io para sincronização via WebSocket em tempo real, ORM Prisma, Autenticação JWT, criptografia de senha bcrypt, 2FA speakeasy.
- **Banco de Dados**: PostgreSQL 15 com ORM Prisma.
- **Proxy e Segurança**: Nginx com criptografia SSL/TLS (HTTPS), proteção CORS, sanitização de dados.
- **DevOps**: Orquestração via Docker & Docker Compose.

---

## 🗄️ Resumo do Esquema do Banco de Dados

O banco de dados utiliza PostgreSQL via Prisma ORM:
- **User**: Credenciais do Herói, Classe, Nível, XP, HP, Mana, Ouro, Atributos de RPG (FOR/INT/DES/SAB/CAR), segredo 2FA.
- **Habit**: Título, descrição, categoria, dificuldade, contador de sequência (streak), indicador de conclusão diária.
- **HabitLog**: Histórico de conclusões de hábitos com recompensas de XP e Ouro.
- **Party & ChatMessage**: Gerenciamento de grupo multijogador, persistência de mensagens em tempo real.
- **Achievement & UserAchievement**: Conquistas e medalhas desbloqueadas.

---

## 🏆 Matriz de Módulos e Cálculo de Pontos (Total: 22 Pontos)

O projeto implementa **22 Pontos** (superando a exigência obrigatória de 14 pontos com 8 pontos bônus):

### 🟢 Módulos Principais Obrigatórios (17 Pontos)
1. **Frameworks Web (Frontend + Backend)** (Major - 2 pts): React (Frontend) + Express (Backend).
2. **WebSockets em Tempo Real** (Major - 2 pts): Batalhas contra chefes ao vivo, feed de atividades, chat de grupo.
3. **Interação entre Usuários** (Major - 2 pts): Chat da Taverna, perfis públicos de heróis, status online.
4. **Gerenciamento de Usuários Padrão** (Major - 2 pts): Criação de conta, avatares, atualização de perfil.
5. **Jogo Baseado na Web** (Major - 2 pts): Batalha RPG em Canvas 2D contra Chefes de Mundo.
6. **Jogadores Remotos Multijogador** (Major - 2 pts): Raides cooperativas multijogador sincronizadas.
7. **Sistema de Gamificação** (Minor - 1 pt): XP, Níveis, Atributos RPG, Sequências, Ouro, Placar de Líderes.
8. **Sistema de Design Personalizado** (Minor - 1 pt): Mais de 10 componentes reutilizáveis de UI em estilo RPG.
9. **Integração de ORM** (Minor - 1 pt): Prisma ORM com esquema estruturado.
10. **Sistema de Notificações Completo** (Minor - 1 pt): Notificações toast em tempo real para subida de nível e logs de combate.
11. **Integração OAuth 2.0** (Minor - 1 pt): Opção de login social via OAuth.

### ⭐ Módulos Bônus (+5 Pontos)
12. **Mestre da Masmorra com IA e Recomendação** (Major - 2 pts): Gerador de missões e lore com IA.
13. **Progressive Web App (PWA)** (Minor - 1 pt): Suporte a instalação mobile e Service Worker offline.
14. **Autenticação em Dois Fatores (2FA)** (Minor - 1 pt): QR Code TOTP e Speakeasy 2FA.
15. **Conformidade com GDPR** (Minor - 1 pt): Ferramentas de "Exportar Dados do Herói" (JSON) e exclusão de conta.

---

## 👥 Informações da Equipe e Contribuições

- **aline-arthur**: Product Owner, Project Manager, Arquiteta Técnica e Desenvolvedora Full-Stack.
  - Implementou a infraestrutura Docker e Nginx HTTPS.
  - Criou o Sistema de Design RPG e o Questionário de Classe interativo.
  - Desenvolveu o frontend em React, backend em Express, esquema Prisma ORM e motor de combate a chefes via Socket.io.

---

## 📚 Recursos e Uso de IA

- **Documentação**: [React Docs](https://react.dev/), [Express.js Docs](https://expressjs.com/), [Prisma Docs](https://www.prisma.io/docs), [Socket.io Docs](https://socket.io/docs/v4/), [Docker Docs](https://docs.docker.com/).
- **Uso de Ferramentas de IA**: Google Gemini / Antigravity AI foi utilizado para auxílio em engenharia de prompt, planejamento arquitetural, tokens do sistema de design e validação de tipos TypeScript.
