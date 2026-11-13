*This project has been created as part of the 42 curriculum by aarie-c2, elianmik, dydaniel, nade-lim, vimafra.*

# ⚔️ Side Quest: Crônicas da Automotivação (ft_transcendence)

[![42 Project](https://img.shields.io/badge/42-ft__transcendence-blue)](https://42.fr)
[![Docker](https://img.shields.io/badge/Docker-Comando--Único-blue?logo=docker)](https://www.docker.com/)
[![HTTPS](https://img.shields.io/badge/Segurança-HTTPS-brightgreen?logo=nginx)](https://nginx.org/)
[![Pontuação de Módulos](https://img.shields.io/badge/Módulos-16_Pontos-gold)](https://42.fr)

---

## 📖 Descrição

O **Side Quest** é uma aplicação web gamificada no estilo RPG de produtividade e rastreamento de hábitos em tempo real, desenvolvida para o projeto final **ft_transcendence** do Common Core da 42.

Em vez de listas de tarefas tradicionais e entediantes, o **Side Quest** transforma seus hábitos da vida real em uma aventura épica de RPG:
- **Questionário de Seleção de Classe**: Seis cenas do dia a dia somam tendências. Se duas classes ficam perto, uma última cena decide, e o resultado mostra a pontuação antes de gravar a classe:
  - 🧙‍♂️ **Mago**: Foco em Estudos, Leitura e Aprendizado (**Inteligência**)
  - ⚔️ **Guerreiro**: Foco em Exercícios, Academia e Treino Físico (**Força**)
  - 🗡️ **Ladino**: Foco em Disciplina, Produtividade e Agilidade (**Destreza**)
  - 🌿 **Clérigo**: Foco em Meditação, Sono e Saúde Mental (**Sabedoria**)
  - 🎭 **Bardo**: Foco em Socialização, Idiomas e Criatividade (**Carisma**)
- **Missões Diárias e Progressão de RPG**: Conclua hábitos diários para ganhar XP e ouro, subir de nível, desbloquear conquistas e aparecer no ranking.
- **Taverna e aliados**: Converse em tempo real, veja quem está online, abra o perfil de outro herói e adicione ou remova amigos.
- **Desafios entre heróis**: Envie uma missão para outro jogador. Quem recebe ganha XP e ouro ao concluir.
- **Mesa da guilda**: o mestre cria contas, muda o papel e exclui heróis. O moderador vê a lista e apaga mensagens da Taverna. O convidado só observa o ranking e a Taverna.
- **Exemplos de missão**: a tela oferece três hábitos por classe, do menor para o mais longo. A pessoa escolhe qual adicionar. Isso não é um módulo de IA.

---

## 🚀 Instruções de Execução

### Pré-requisitos
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

### Configuração
Copie `.env.example` para `.env` e troque `POSTGRES_PASSWORD` e `SECRET_KEY`. O arquivo `.env` não entra no Git. O `DATABASE_URL` precisa apontar para o host `postgres`, que é o nome do serviço no Compose.

Para também enviar os e-mails de confirmação por SMTP, preencha `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` e `SMTP_FROM`. Sem isso, o Side Quest grava o e-mail e mostra o texto na ficha do herói.

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
- **Backend (FastAPI + WebSockets)**: `http://localhost:5000`
- **Banco de Dados PostgreSQL**: Porta `5432`

> **Nota**: Acesse `https://localhost` no Google Chrome. Aceite o certificado SSL autoassinado no seu navegador.

---

## 🛠️ Tecnologias e Escolhas Arquiteturais

- **Frontend**: React 18 em JavaScript, Vite, CSS próprio e ícones Lucide. O cliente usa `fetch` e o WebSocket nativo.
- **Backend**: Python 3.11, FastAPI e WebSockets nativos. Senhas com bcrypt, sessão com JWT.
- **Banco de Dados**: PostgreSQL 15 com SQLAlchemy. As relações ficam no código em `backend/models.py`.
- **Proxy e Segurança**: Nginx termina HTTPS e encaminha `/api` e `/ws` para o backend.
- **DevOps**: Docker Compose sobe tudo com `make`. Segredos ficam no `.env`.

---

## 🗄️ Resumo do Esquema do Banco de Dados

O banco de dados utiliza PostgreSQL via SQLAlchemy:
- **User**: e-mail, senha com hash, papel (`admin`, `moderator`, `user` ou `guest`), classe, nível, XP, ouro e atributos.
- **Habit**: título, categoria, dificuldade, ofensiva e data da última conclusão. Pertence a um usuário.
- **Friendship**: liga dois usuários. Adicionar um aliado cria o vínculo nos dois sentidos.
- **ChatMessage**: mensagens da taverna, ligadas ao autor.
- **Notification**: criação, atualização e exclusão feitas pelo usuário.
- **Achievement** e **UserAchievement**: conquistas desbloqueadas.
- **Challenge**: desafio enviado de um herói para outro.
- **EmailLog**: e-mails de confirmação de exportação e exclusão.

---

## 🏆 Matriz de Módulos e Cálculo de Pontos (Total: 16 Pontos)

1. **Frameworks no frontend e no backend** (Major - 2 pts): React e FastAPI.
2. **WebSockets** (Major - 2 pts): presença online, taverna e desafios em tempo real. A conexão e a desconexão atualizam a lista de heróis.
3. **Interação entre usuários** (Major - 2 pts): chat persistido, perfil público e lista de amigos com adicionar e remover.
4. **Gestão de usuários** (Major - 2 pts): editar a bio, enviar um avatar (PNG, JPEG ou WebP, até 2 MB) ou manter o retrato padrão com a inicial, ver amigos online e abrir a ficha do herói.
5. **ORM** (Minor - 1 pt): SQLAlchemy.
6. **Gamificação** (Minor - 1 pt): XP e nível, conquistas e ranking. Os três ficam no banco e aparecem na interface.
7. **Notificações** (Minor - 1 pt): criar, atualizar e excluir missão, perfil, avatar, amigo, mensagem ou desafio gera uma notificação.
8. **GDPR** (Minor - 1 pt): exportar JSON, excluir a conta digitando EXCLUIR, e registrar um e-mail de confirmação nas duas operações.
9. **Sistema de design** (Minor - 1 pt): paleta em `frontend/src/index.css`, tipografia Cinzel e Inter, ícones Lucide, e 10 componentes em `frontend/src/design/system.jsx`: Button, Card, Field, Badge, Avatar, ProgressBar, Modal, Pill, Stat e EmptyState.
10. **PWA** (Minor - 1 pt): `manifest.json`, ícones 192 e 512, e `sw.js`. O app pode ser instalado e a interface abre offline depois da primeira visita.
11. **Permissões avançadas** (Major - 2 pts): quatro papéis (mestre, moderador, herói e convidado). O mestre cria, edita e exclui contas. O moderador lista contas e apaga mensagens. O convidado só lê o ranking e a Taverna. A tela muda com o papel.

Total: 16 pontos. A exigência do sujeito é 14. Os 2 extras são uma reserva se algum módulo for recusado.

A conta do mestre sai do `.env` na primeira subida: `mestre@example.com` / `MestreSide42`, nome **Mestre**. Troque `ADMIN_PASSWORD` antes de publicar.

---

## 👥 Equipe

Todo mundo desenvolve. Num grupo de cinco, o sujeito pede um Product Owner, um Project Manager, um Technical Lead e dois Developers, cada um com uma fatia que consegue explicar na avaliação.

| Login | Papel | Responsabilidade |
| --- | --- | --- |
| **aarie-c2** | Product Owner | Decide a visão, prioriza o backlog e aceita o que fica pronto. Fala com quem avalia. Cuida do questionário, dos exemplos de missão, do guia do site e das regras dos quatro papéis. |
| **elianmik** | Project Manager | Marca as conversas, acompanha prazo e bloqueio, e mantém o quadro de tarefas. Cuida das notificações, da exportação, da exclusão com `EXCLUIR` e dos e-mails de confirmação. |
| **dydaniel** | Technical Lead | Define a arquitetura, revisa o código dos outros e segura a qualidade. Cuida do Docker, do Nginx com HTTPS, do `.env`, do JWT, do bcrypt e do SQLAlchemy. |
| **nade-lim** | Developer | Cuida do que acontece com duas pessoas ao mesmo tempo: WebSocket, Taverna, aliados, presença e apagar mensagem. |
| **vimafra** | Developer | Cuida do laço do jogo: missões, XP, ofensiva, ouro, desafios, ranking, ficha do herói e avatar. |

O sistema de design e o PWA ficam entre **nade-lim** e **vimafra**. **dydaniel** revisa os dois.

A contribuição de cada login entra nesta seção depois do commit dessa pessoa. O histórico atual ainda não está repartido.

### Quem defende cada módulo

| Módulo | Pontos | Quem defende |
| --- | --- | --- |
| Frameworks no frontend e no backend | 2 | dydaniel |
| WebSockets | 2 | nade-lim |
| Interação entre usuários | 2 | nade-lim |
| Gestão de usuários | 2 | vimafra |
| Permissões avançadas | 2 | aarie-c2 |
| ORM | 1 | dydaniel |
| Gamificação | 1 | vimafra |
| Notificações | 1 | elianmik |
| GDPR | 1 | elianmik |
| Sistema de design | 1 | nade-lim e vimafra |
| PWA | 1 | nade-lim e vimafra |

A parte obrigatória também se reparte: **dydaniel** no `make`, no HTTPS e no banco; **elianmik** nos Termos e na política de dados que a exportação cumpre; **nade-lim** em dois usuários ao mesmo tempo; **aarie-c2** e **vimafra** nas telas e na validação do que a pessoa digita.

## 📋 Organização

A divisão acima foi combinada para a avaliação. Cada pessoa abre a própria fatia em pull request. **dydaniel** revisa. **aarie-c2** aceita. O quadro é o GitHub Issues. O canal do dia a dia o grupo ainda escolhe.

---

## 📚 Recursos e Uso de IA

- **Documentação**: [React Docs](https://react.dev/), [FastAPI Docs](https://fastapi.tiangolo.com/), [SQLAlchemy Docs](https://docs.sqlalchemy.org/), [Docker Docs](https://docs.docker.com/).
- **Uso de Ferramentas de IA**: um assistente de código ajudou a ligar o frontend ao backend, a persistir hábitos, amigos, chat, XP, notificações e a exportação de dados. O código foi revisado no repositório.
