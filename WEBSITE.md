# Side Quest — guia do site

O Side Quest é um rastreador de hábitos em forma de RPG. A pessoa cria uma conta, responde um teste de classe e transforma a rotina real em missões que dão XP, ouro, ofensiva, conquistas e lugar no ranking. Outros heróis entram pela Taverna e pelos desafios.

O site inteiro vive em um endereço só. Não há rotas como `/perfil` ou `/ranking`. O que muda é a tela dentro da página, mais dois endereços de documentação da API.

Para abrir a versão completa: copie `.env.example` para `.env`, rode `make` e acesse `https://localhost`. O navegador avisa sobre o certificado autoassinado. HTTP em `http://localhost` redireciona para HTTPS.

## Mapa das telas

| Quem está na página | O que aparece |
| --- | --- |
| Visitante | Landing, FAQ, botões Entrar e Cadastrar-se, e Termos |
| Conta nova, sem classe | Questionário. As abas do menu não abrem o resto do jogo |
| Herói com classe | Missões, Desafios, Taverna, Ranking e Perfil |
| Mestre ou moderador | As telas do herói, mais a aba Mesa |
| Convidado | Ranking, Taverna (só leitura) e Perfil. Sem questionário, missões ou desafios |

O logo **Side Quest** volta para Missões, mas só depois da classe estar definida. Para um convidado, o logo volta para o Ranking. **Termos** abre por cima de qualquer tela, com ou sem login. **Sair** apaga a sessão neste navegador e volta para a landing.

A sessão fica no navegador. Fechar a aba e abrir de novo entra direto, até o token expirar (7 dias) ou a conta ser excluída.

## Caminho de um herói novo

1. **Cadastrar-se**, na barra ou no botão da landing.
2. Nome de 3 a 20 caracteres (letras, números ou `_`), e-mail e senha de 8 a 72 caracteres.
3. Se o e-mail ou o nome já existem, o cadastro recusa.
4. O questionário abre sozinho.
5. Seis cenas. Cada resposta soma pontos em uma ou duas classes. Dá para voltar.
6. Se as duas primeiras ficam a 2 pontos ou menos, uma última cena desempata só aquele par.
7. A ficha mostra a pontuação. **Assumir** grava a classe. Se ainda estiver perto, dá para ficar com a segunda. **Refazer** zera o teste.
8. O guia das cinco classes fica na aba ao lado do teste e não grava nada.
9. Missões abre. A classe não pode ser refeita depois.

Quem já tem conta entra com e-mail e senha. Sem classe, cai no questionário. Com classe, cai em Missões. Convidado pula o questionário e abre o Ranking.

## Papéis

| Papel | O que pode |
| --- | --- |
| Mestre | Tudo do herói, mais criar conta, mudar papel, bio e senha, e excluir outra conta |
| Moderador | Joga como herói, vê a lista de contas e apaga mensagens da Taverna |
| Herói | Missões, desafios, Taverna, ranking e perfil |
| Convidado | Olha o ranking e lê a Taverna. Não escreve, não adiciona aliado, não faz missão nem desafio |

O mestre não exclui a própria conta pela Mesa, e a guilda não fica sem nenhum mestre. Um herói ainda pode excluir a própria conta no Perfil, digitando EXCLUIR.

A barra mostra um selo só quando o papel não é Herói: **Mestre**, **Moderador** ou **Convidado**. Convidado não vê os botões Missões e Desafios. Mestre e moderador veem **Mesa**.

Um herói ou um moderador criado pela Mesa ainda passa pelo questionário antes de jogar. O convidado não passa. O mestre da primeira subida já entra com a classe definida.

Na Mesa, o mestre preenche nome, e-mail, senha e papel, e a conta aparece na lista. Em cada linha dá para mudar o papel, a bio e, se quiser, a senha. **Excluir** pede confirmação. O moderador vê a mesma lista, sem o formulário e sem Salvar ou Excluir. Na Taverna, mestre e moderador têm **Apagar** em cada mensagem. O convidado lê o histórico e vê o aviso de que não escreve.

A conta inicial do mestre é criada na primeira subida, com os valores do `.env`:

- e-mail `mestre@example.com`
- nome `Mestre`
- senha `MestreSide42`

Ela já tem a classe Mago, então a Mesa abre direto. Para a avaliação, o mestre cria as outras contas nessa aba.

## Classes

| Classe | Foco | Atributo que sobe para 18 | Categoria com XP extra |
| --- | --- | --- | --- |
| Mago Arcano | Entender a fundo | Inteligência | Estudo |
| Guerreiro de Elite | Aparecer mesmo cansado | Força | Fitness |
| Ladino Estrategista | Encurtar o caminho | Destreza | Produtividade |
| Clérigo Guardião | Proteger o ritmo | Sabedoria | Bem-estar |
| Bardo Inspirador | Fazer junto | Carisma | Criatividade |

Os outros atributos ficam em 10. Todo mundo começa no nível 1, com 0 XP e 50 de ouro. Esses 50 pagam o primeiro desafio antes de qualquer missão. O ouro que vem depois sai das missões concluídas.

## Missões

Tela **Missões**.

- **Exemplos de missão**: três hábitos por classe. A da sua classe aparece primeiro. **Adicionar** cria a missão de verdade. Se o título já está na lista, o botão fica em **Já na lista**.
- **Nova Missão**: título (1 a 120 caracteres), categoria e dificuldade, para quem quer escrever o próprio hábito.

| Classe | Curtinha | Um bloco | Pede mais |
| --- | --- | --- | --- |
| Mago | Ler 10 páginas | Estudar 45 minutos sem o celular | Resolver 3 exercícios e anotar onde travou |
| Guerreiro | Caminhar 15 minutos | Treinar 30 minutos | Fazer o treino e alongar no fim |
| Ladino | Planejar o dia em 10 minutos | Uma sessão de 25 minutos numa tarefa só | Esvaziar a caixa de entrada |
| Clérigo | Beber um copo de água ao acordar | Meditar ou respirar por 10 minutos | Ficar sem tela na última hora antes de dormir |
| Bardo | Escrever cinco linhas no diário | Praticar um idioma ou instrumento por 20 minutos | Mostrar para alguém algo que você fez |
- O círculo marca a missão como feita hoje. Ela risca e não pode ser concluída de novo no mesmo dia.
- A lixeira apaga a missão.
- A ofensiva sobe só se a missão anterior foi ontem. Se o intervalo for maior, a ofensiva volta para 1.

| Dificuldade | XP | Ouro | Bônus se a categoria for a da classe |
| --- | --- | --- | --- |
| Fácil | 25 | 10 | +5 |
| Média | 50 | 20 | +10 |
| Difícil | 100 | 45 | +20 |

O bônus de classe entra no XP. Uma missão média de Estudo, feita por um Mago, vale 60 XP. A mesma missão feita por um Guerreiro vale 50. O ouro da tabela não muda com a classe.

A ofensiva soma por cima do XP, e só na missão que manteve a sequência:

| Dia seguido | XP extra |
| --- | --- |
| 1 | 0 |
| 2 | +5 |
| 3 a 6 | +10 |
| 7 em diante | +15 |

Falhou um dia, a ofensiva volta para 1 e o extra some. Depois de concluir hoje, o cartão mostra quanto a mesma missão vale amanhã. Desafios entre heróis não recebem bônus de classe nem de ofensiva.

Subir de nível custa `nível × 100` XP. O que passa do limite fica no próximo nível. Uma missão média da sua classe paga 60 no primeiro dia e 65 no segundo, então o nível 2 chega no segundo dia, com 25 XP já no caminho do nível 3. Uma difícil da classe paga 120 e sobe de nível na hora, com 20 XP sobrando. A curtinha, como “Ler 10 páginas”, paga 30 e deixa o herói no nível 1. O nível 3, no ritmo de uma missão média da classe por dia, chega no quinto dia.

## Ouro

O ouro mede o que você já fez e ainda não apostou em outra pessoa. Não compra XP e não apaga um dia perdido.

| De onde vem | Quanto |
| --- | --- |
| Conta nova | 50 |
| Missão fácil | 10 |
| Missão média | 20 |
| Missão difícil | 45 |
| Desafio concluído por você | o ouro que o outro herói reservou |

Gastar ouro só acontece ao enviar um desafio. O valor sai da bolsa na hora e fica reservado. A barra mostra o que sobrou. O ranking mostra o ouro que ainda está na bolsa, não o que está reservado.

## Desafios

Tela **Desafios Co-op**. O outro herói precisa estar online para aparecer na lista.

A coluna da esquerda mostra quem está conectado, com classe, nível, Inteligência, Força e Destreza. **Desafiar** já escolhe essa pessoa. **Lançar Novo Desafio** abre o mesmo formulário.

O formulário traz cinco ações prontas. Escolher uma preenche título, categoria, XP e ouro. Dá para editar antes de enviar. O ouro pedido fica entre 1 e 45, e o XP entre 1 e 100. O botão mostra o preço, por exemplo **Enviar por 20 de ouro**. Se a bolsa não cobre, o botão fica em **Ouro insuficiente** e o servidor recusa.

| Exemplo | Categoria | XP para quem conclui | Ouro que sai da bolsa |
| --- | --- | --- | --- |
| Ler o mesmo texto e trocar uma ideia | Estudo | 50 | 20 |
| Caminhar 20 minutos hoje | Fitness | 50 | 20 |
| 25 minutos na tarefa mais importante, sem trocar de aba | Produtividade | 25 | 10 |
| Alongar 10 minutos e contar como foi | Bem-estar | 25 | 10 |
| Mandar uma mensagem de verdade, sem ser só um emoji | Criatividade | 50 | 20 |

Não dá para desafiar a si mesmo.

**Ouro em jogo** lista o que você enviou e ainda está pendente. **Cancelar e receber** devolve o ouro para a sua bolsa. Quem ia receber deixa de ver o desafio.

**Concluir Desafio Agora** só aparece para quem recebeu. Essa pessoa ganha o XP do desafio e o ouro que estava reservado. Quem enviou não ganha nada de volta: o ouro já era o prêmio.

Se quem recebeu exclui a conta com um desafio ainda pendente, o ouro reservado volta para quem enviou. Se quem enviou exclui a conta, o desafio some junto com a bolsa.

O feed embaixo mostra, nesta sessão, conclusões de missão e de desafio. Ele não fica guardado ao recarregar a página.

## Taverna

Tela **Taverna**, com duas abas.

**Chat da guilda.** Uma sala só, para todo mundo. A mensagem tem de 1 a 500 caracteres. O histórico guarda as últimas 80. Mensagem nova aparece na hora para quem está online.

**Aliados.**

- Adicionar pelo nome de usuário. A amizade é dos dois lados na hora. Não há pedido para aceitar.
- Não dá para adicionar a si mesmo nem repetir um aliado.
- Na lista de online dá para adicionar, remover e abrir um cartão rápido.
- **Ver Perfil** e **Abrir ficha** levam à ficha daquele herói.

## Ranking

Tela **Ranking**. Até 20 heróis, ordenados por nível e, no empate, por XP. Cada linha mostra posição, nome, classe, nível, XP e ouro.

## Perfil

**Perfil**, na barra, abre a própria ficha.

- Avatar enviado (PNG, JPEG ou WebP, até 2 MB) ou a inicial do nome num círculo coral. **Voltar ao avatar padrão** remove a foto. O servidor também recusa um arquivo que não seja imagem de verdade.
- Bio de até 240 caracteres. Em outra ficha, a bio só aparece para leitura.
- Números: nível, XP, ouro, Força, Inteligência e Destreza.
- Conquistas já desbloqueadas.
- Aliados, com o selo Online ou Offline. O nome abre a ficha dessa pessoa.
- **Exportar meus dados** baixa `side-quest-<nome>.json` com perfil, missões, aliados e conquistas, e registra um e-mail de confirmação.
- **Sair**.
- **Confirmar exclusão** só liga depois de digitar `EXCLUIR`. Apaga a conta, as missões, amizades, mensagens, desafios, notificações e conquistas, e volta para a landing.

A ficha de outro herói não tem edição, exportação nem exclusão.

Os e-mails de confirmação aparecem na própria ficha. Se `SMTP_HOST` estiver no `.env`, eles também saem por SMTP.

## Barra, avisos e termos

Com sessão, a barra mostra avatar, nível, barra de XP, ouro, classe e, quando couber, o selo do papel.

O sino lista as últimas notificações. Abrir o sino com itens não lidos marca todos como lidos. Elas nascem ao criar, concluir ou apagar missão, ao mudar perfil ou avatar, ao adicionar ou remover aliado, ao falar na Taverna, e ao enviar, concluir ou cancelar um desafio. O texto diz quanto ouro saiu, voltou ou foi recebido. Uma conquista também aparece num aviso curto no canto.

**Termos** explica o que é guardado, a exportação em JSON e a exclusão com `EXCLUIR`.

## Conquistas

| Nome | Quando aparece |
| --- | --- |
| Primeira missão | Criar uma missão |
| Contrato cumprido | Concluir uma missão |
| Aprendiz | Chegar ao nível 2 |
| Ofensiva | Manter 3 dias seguidos numa missão |
| Aliado | Adicionar um amigo |
| Voz da taverna | Enviar uma mensagem na Taverna |

## O que chega ao vivo

Depois do login o navegador abre uma conexão em `/ws` e envia o token. Quem está na mesma hora recebe:

- a lista de heróis online
- mensagens novas da Taverna, e o aviso quando uma mensagem é apagada
- desafios novos, concluídos e cancelados
- o ouro devolvido, quando o cancelamento é seu
- linhas do feed
- a própria notificação

Sem resposta de autenticação em 10 segundos, a conexão fecha.

## Fora da internet

O app pode ser instalado. Na primeira visita o navegador guarda a página, o manifesto e os ícones. Sem rede, essa casca abre de novo. Missões, chat e login precisam da API, então não funcionam offline.

## Endereços

| Endereço | O que é |
| --- | --- |
| `/` | O site |
| `/manifest.json` | Manifesto de instalação |
| `/sw.js` | Service worker |
| `/icons/icon-192.png` e `/icons/icon-512.png` | Ícones |
| `/api/...` | API. Tudo abaixo exige o token, menos saúde, cadastro e login |
| `/ws` | Presença, Taverna e desafios em tempo real |
| `/docs` | Documentação interativa da API |
| `/openapi.json` | Contrato da API |

### API

| Método e caminho | O que faz |
| --- | --- |
| `GET /api/health` | Responde que a API está no ar |
| `POST /api/auth/register` | Cria a conta e devolve o token |
| `POST /api/auth/login` | Entra com e-mail e senha |
| `GET /api/me` | Perfil de quem está logado, com e-mail e conquistas |
| `PUT /api/me` | Salva a bio |
| `POST /api/me/avatar` | Envia o avatar |
| `DELETE /api/me/avatar` | Remove o avatar |
| `GET /api/avatars/{arquivo}` | Serve a imagem |
| `POST /api/user/survey` | Grava a classe |
| `GET /api/habits` | Lista as missões |
| `POST /api/habits` | Cria uma missão |
| `POST /api/habits/suggest` | Cria a missão sugerida da classe |
| `DELETE /api/habits/{id}` | Apaga uma missão |
| `POST /api/habits/{id}/complete` | Conclui a missão de hoje |
| `GET /api/leaderboard` | Ranking |
| `GET /api/friends` | Aliados, com online ou offline |
| `POST /api/friends` | Adiciona um aliado pelo nome |
| `DELETE /api/friends/{nome}` | Remove o aliado dos dois lados |
| `GET /api/users/{nome}` | Ficha pública |
| `GET /api/chat` | Últimas mensagens |
| `POST /api/chat` | Envia uma mensagem |
| `DELETE /api/chat/{id}` | Mestre ou moderador apaga uma mensagem |
| `GET /api/admin/users` | Mestre ou moderador lista as contas |
| `POST /api/admin/users` | Mestre cria uma conta, com papel |
| `PUT /api/admin/users/{id}` | Mestre muda papel, bio e, se quiser, a senha |
| `DELETE /api/admin/users/{id}` | Mestre exclui outra conta |
| `GET /api/challenges` | Desafios enviados ou recebidos |
| `POST /api/challenges` | Envia um desafio e reserva o ouro de quem envia |
| `POST /api/challenges/{id}/complete` | Quem recebeu conclui e fica com o ouro reservado |
| `POST /api/challenges/{id}/cancel` | Quem enviou cancela e recebe o ouro de volta |
| `GET /api/notifications` | Notificações |
| `POST /api/notifications/read` | Marca as notificações como lidas |
| `GET /api/me/emails` | E-mails de confirmação |
| `GET /api/me/export` | JSON dos dados e e-mail de confirmação |
| `DELETE /api/me` | Exclui a conta se o corpo trouxer `EXCLUIR` |

O token vai no cabeçalho `Authorization: Bearer ...`.
