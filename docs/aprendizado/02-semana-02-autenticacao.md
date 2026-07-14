# Semana 02 — Autenticação — Análise de Requisitos, MVC, Beans, Validações e Testes — Sem Código

**Projeto:** Varthex Barber  
**Semana:** 02  
**Período:** 13/07/2026 a 17/07/2026  
**Entrega da semana:** autenticação, usuários, senha segura, JWT, refresh token, perfis e proteção inicial de rotas.  
**Stack do projeto:** Java 21, Spring Boot, Spring Security, Spring Data JPA, PostgreSQL, Redis, Next.js e Docker Compose.  
**Tipo de documento:** guia de desenvolvimento sem código, com análise de requisitos técnica e funcional.  
**Papel deste documento:** orientar o que você deve fazer, em qual ordem, por que cada parte existe, onde estudar na documentação oficial e como testar.

---

## 0. Regra principal deste documento

Este documento **não entrega código pronto**.

Ele existe para você estudar, planejar, implementar por conta própria e validar se o que fez está correto.

A ordem correta de uso é:

1. Ler o problema de negócio.
2. Entender os conceitos.
3. Definir entidades, campos, regras e validações.
4. Definir quais camadas MVC cada parte precisa ter.
5. Consultar a documentação oficial indicada.
6. Implementar no seu projeto.
7. Testar manualmente.
8. Criar testes automatizados básicos.
9. Registrar o aprendizado no GitHub.
10. Só depois comparar com uma correção, caso exista.

Se você começar pelo código, vai parecer mais rápido no começo, mas vai travar quando precisar corrigir regra de negócio, segurança, relacionamento entre tabelas ou fluxo de login.

---

## 1. Objetivo real da Semana 02

O objetivo da Semana 02 não é apenas criar uma tela de login.

O objetivo é criar a primeira camada de segurança do Varthex Barber.

Ao final da semana, o sistema precisa conseguir responder perguntas fundamentais:

- Quem está tentando acessar o sistema?
- Essa pessoa existe no banco?
- A senha informada corresponde à senha salva?
- Essa senha está salva de forma segura?
- Esse usuário está ativo?
- Esse usuário pertence a qual perfil?
- Esse usuário pertence a qual barbearia?
- Quais rotas ele pode acessar?
- Como o frontend sabe que o usuário está logado?
- Como o backend sabe que a requisição veio de um usuário autenticado?
- Como encerrar uma sessão?
- Como renovar uma sessão sem pedir senha toda hora?

A autenticação é uma base para todas as próximas semanas. Sem ela, as próximas funcionalidades ficam perigosas, porque qualquer pessoa poderia acessar agenda, clientes, faturamento, estoque e comissão.

---

## 2. Problema de negócio

O Varthex Barber será um sistema SaaS para barbearias. Isso significa que a mesma aplicação poderá atender várias barbearias diferentes.

Dentro do sistema existirão dados sensíveis, como:

- dados de clientes;
- telefones;
- histórico de atendimentos;
- horários agendados;
- faturamento diário, semanal e mensal;
- comissões dos barbeiros;
- estoque de produtos;
- planos e fidelidade;
- mensagens de WhatsApp;
- informações do dono da barbearia;
- dados de assinatura do SaaS.

Se a autenticação for mal feita, podem acontecer problemas graves:

- cliente acessando dados de outro cliente;
- barbeiro vendo financeiro da barbearia sem permissão;
- admin de uma barbearia acessando dados de outra barbearia;
- usuário bloqueado conseguindo entrar;
- senha salva em texto puro;
- token que nunca expira;
- sessão que não pode ser encerrada;
- frontend permitindo acessar dashboard sem login;
- backend confiando apenas no frontend.

A autenticação resolve o primeiro problema: identificar o usuário.

A autorização resolve o segundo problema: definir o que esse usuário pode fazer.

Nesta semana, você começa pelos dois conceitos, mas implementa apenas a proteção inicial. Permissões finas e regras avançadas ficam para evoluções futuras.

---

## 3. Diferença entre autenticação e autorização

### 3.1 Autenticação

Autenticação responde à pergunta:

**Quem é você?**

No projeto, a autenticação começa com e-mail e senha.

Fluxo conceitual:

1. Usuário informa e-mail e senha.
2. Sistema busca o usuário pelo e-mail.
3. Sistema verifica se o usuário existe.
4. Sistema compara a senha informada com a senha criptografada salva.
5. Sistema verifica se o usuário está ativo.
6. Sistema gera uma sessão/token se tudo estiver correto.

### 3.2 Autorização

Autorização responde à pergunta:

**O que você pode acessar?**

Exemplos no Varthex Barber:

- SuperAdmin pode gerenciar várias barbearias.
- Admin pode gerenciar a própria barbearia.
- Barbeiro pode ver agenda e comissão própria.
- Cliente pode ver seus próprios agendamentos.

Autenticação sem autorização é perigoso, porque o sistema saberia quem é o usuário, mas não saberia o que ele pode ou não pode fazer.

---

## 4. Atores impactados

| Ator | Por que precisa de autenticação | O que deve acessar inicialmente | O que não pode acessar | Risco se errar |
|---|---|---|---|---|
| SuperAdmin | Controla o SaaS inteiro | Área global, barbearias, planos e status de assinatura | Dados operacionais sem necessidade ou sem auditoria | Acesso indevido a dados de clientes e barbearias |
| Admin/Dono | Gerencia a barbearia | Dashboard, agenda, clientes, barbeiros e financeiro da própria barbearia | Dados de outras barbearias | Vazamento entre empresas diferentes |
| Barbeiro | Usa agenda e acompanha atendimentos | Agenda própria, próximos clientes, comissão própria | Financeiro geral, dados de outros barbeiros sem permissão | Exposição de comissão e dados internos |
| Cliente | Agenda e acompanha histórico | Seus próprios agendamentos, perfil e pontos | Dados de outros clientes e administração | Privacidade comprometida |
| Sistema interno | Executa validações, tokens e notificações | Dados necessários para autenticar e autorizar | Dados fora do contexto da requisição | Quebra de isolamento e segurança |

---

## 5. Escopo da Semana 02

### 5.1 Entra no escopo

Nesta semana entra:

- análise da autenticação;
- definição de perfis;
- definição de status do usuário;
- definição da entidade User;
- definição da entidade RefreshToken;
- preparação conceitual de Barbershop para isolamento SaaS;
- definição de login com e-mail e senha;
- definição de senha criptografada;
- definição de access token;
- definição de refresh token;
- definição de logout;
- definição de rota para consultar usuário logado;
- definição de rotas públicas e protegidas;
- proteção inicial do backend;
- tela inicial de login no frontend;
- redirecionamento básico de usuário sem sessão;
- testes manuais;
- documentação da semana;
- diário de aprendizado.

### 5.2 Não entra no escopo

Não tente fazer tudo nesta semana.

Ficam fora do escopo:

- recuperação de senha;
- autenticação em dois fatores;
- login com Google;
- login com WhatsApp;
- login por biometria;
- painel completo de permissões;
- permissões por ação individual;
- auditoria completa;
- bloqueio automático por excesso de tentativas;
- envio de e-mail de confirmação;
- cadastro completo de cliente;
- cadastro completo de barbeiro;
- cobrança e planos SaaS;
- controle avançado de dispositivos;
- OAuth completo com provedor externo.

Esses itens podem ser anotados como evolução futura, mas não devem atrapalhar a entrega da semana.

---

## 6. Conceitos obrigatórios antes de implementar

| Conceito | O que significa | Onde entra no projeto | O que você deve conseguir explicar |
|---|---|---|---|
| Spring Bean | Objeto gerenciado pelo Spring | Service, Controller, Repository, Config, Filter | Por que o Spring cria e injeta objetos automaticamente |
| Bean Validation | Regras de validação em campos e objetos | DTOs, entrada da API e algumas entidades | Como validar e-mail, senha, nome e campos obrigatórios |
| MVC | Organização em camadas | Controller, Service, Repository, Entity/Model | Por que regra de negócio não deve ficar no Controller |
| Entity | Representação de tabela ou conceito persistido | User, RefreshToken, Barbershop | O que deve virar tabela e o que não precisa virar tabela |
| Repository | Acesso ao banco | Buscar usuário por e-mail, salvar refresh token | Por que não consultar banco direto no Controller |
| Service | Regras de negócio | Login, logout, refresh, validação de status | Onde ficam as decisões do sistema |
| Controller | Entrada HTTP | Rotas de login, logout, refresh e me | O que o Controller deve receber e devolver |
| DTO | Objeto de entrada ou saída | LoginRequest, LoginResponse, UserResponse | Por que não expor Entity diretamente |
| JWT | Token usado para autenticar requisições | Header das chamadas protegidas | Por que tem expiração e assinatura |
| Refresh Token | Token para renovar sessão | Renovação sem pedir senha novamente | Por que precisa ser salvo/revogado |
| Password Hash | Senha transformada de forma segura | Campo passwordHash | Por que senha pura nunca deve ser salva |
| Role | Perfil do usuário | SUPER_ADMIN, ADMIN, BARBER, CLIENT | Como perfil ajuda na autorização |
| Status | Situação da conta | ACTIVE, INACTIVE, BLOCKED, PENDING | Por que usuário inativo não pode logar |

---

## 7. Spring Bean, JavaBean e Bean Validation: não confundir

A palavra “bean” pode confundir no começo. No projeto, você vai encontrar três ideias diferentes.

### 7.1 Spring Bean

Spring Bean é um objeto controlado pelo Spring.

Ele pode ser:

- Controller;
- Service;
- Repository;
- classe de configuração;
- filtro de segurança;
- componente de geração de token;
- componente de validação;
- componente de integração.

O Spring cria esses objetos e permite que um use o outro por injeção de dependência.

Por exemplo, conceitualmente:

- Controller precisa usar Service.
- Service precisa usar Repository.
- AuthService precisa usar JwtService.
- SecurityConfig precisa conhecer filtros e regras de segurança.

Você deve estudar Spring Beans para entender como o Spring reconhece e gerencia esses objetos.

### 7.2 JavaBean

JavaBean é um padrão antigo de classe Java com atributos, construtor vazio, getters e setters.

Hoje, em projetos Spring, você não precisa ficar preso ao termo JavaBean o tempo todo, mas é importante entender que muitas bibliotecas esperam classes bem estruturadas, com atributos acessíveis por métodos, construtores e convenções.

### 7.3 Bean Validation

Bean Validation é outro assunto.

Ele trata de validação de dados.

Exemplos de validações:

- campo obrigatório;
- e-mail válido;
- tamanho mínimo;
- tamanho máximo;
- valor não nulo;
- data futura;
- valor positivo;
- formato permitido.

No Varthex Barber, as validações entram principalmente nos DTOs de entrada e também em alguns campos das entidades.

### 7.4 Onde estudar

| Necessidade | Documentação oficial | O que procurar | Como aplicar no projeto |
|---|---|---|---|
| Entender Spring Beans | https://docs.spring.io/spring-framework/reference/core/beans/introduction.html | IoC Container e Beans | Entender Controller, Service, Repository e Config como objetos gerenciados |
| Entender definição de Bean | https://docs.spring.io/spring-framework/reference/core/beans/definition.html | Bean definitions | Entender como o Spring sabe o que criar |
| Entender validação no Spring | https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html | Bean Validation | Validar DTOs de login, refresh e cadastro |
| Entender validação no Spring Boot | https://docs.spring.io/spring-boot/reference/io/validation.html | Validation e starter de validação | Ativar validação de entrada na API |
| Entender Jakarta Bean Validation | https://jakarta.ee/learn/docs/jakartaee-tutorial/current/beanvalidation/bean-validation/bean-validation.html | constraints e validação de objetos | Saber quais validações existem para atributos |
| Entender Hibernate Validator | https://docs.jboss.org/hibernate/stable/validator/reference/en-US/html_single/ | constraints prontas | Escolher validações como obrigatório, e-mail e tamanho |

---

## 8. Arquitetura MVC que você deve seguir

### 8.1 Ideia central

Sempre que você criar uma funcionalidade, pense em camadas.

A arquitetura precisa evitar que tudo fique misturado.

No seu projeto, use a seguinte separação conceitual:

| Camada | Responsabilidade | O que não deve fazer |
|---|---|---|
| Entity/Model | Representar dados persistidos e relacionamentos | Não deve controlar fluxo HTTP |
| Repository | Conversar com banco de dados | Não deve aplicar regra complexa de negócio |
| Service | Aplicar regras de negócio | Não deve depender de detalhes da tela |
| Controller | Receber requisições e devolver respostas | Não deve decidir regra de negócio sozinho |
| DTO | Definir entrada e saída da API | Não deve substituir entidade de banco |
| Mapper | Converter Entity para DTO e DTO para Entity | Não deve acessar banco |
| Config | Configurar segurança, CORS, beans e integrações | Não deve ter regra de login |
| Test | Provar que cada parte funciona | Não deve ser esquecido para testar só manualmente |

### 8.2 Regra de ouro

Quando criar uma entidade, pergunte:

1. Ela precisa ser salva no banco?
2. Ela terá consulta direta?
3. Ela terá regra de negócio própria?
4. Ela terá endpoint próprio?
5. Ela será enviada ou recebida pela API?
6. Ela precisa de teste?

Com base nas respostas, você decide as camadas necessárias.

### 8.3 Decisão por tipo de entidade

| Situação | Entity | Repository | Service | Controller | DTO | Testes |
|---|---|---|---|---|---|---|
| Dado será salvo no banco | Sim | Normalmente sim | Normalmente sim | Depende | Depende | Sim |
| Dado só representa perfil fixo | Pode ser enum | Não | Não | Não | Não | Teste indireto |
| Dado só entra em requisição | Não | Não | Não | Não | Sim | Validação de DTO |
| Dado tem regra de negócio | Talvez | Talvez | Sim | Depende | Talvez | Sim |
| Dado tem tela/endpoints próprios | Sim ou DTO | Talvez | Sim | Sim | Sim | Sim |
| Dado é apenas configuração | Não necessariamente | Não | Talvez | Não | Não | Sim, se for segurança |

---

## 9. Regra de criação para toda entidade do projeto

Sempre que você for criar uma entidade no Varthex Barber, siga esta ordem antes de escrever qualquer código.

### 9.1 Passo 1 — Nome e responsabilidade

Defina:

- nome da entidade;
- por que ela existe;
- qual problema resolve;
- se ela pertence ao domínio da barbearia ou ao domínio técnico;
- se ela é usada por cliente, barbeiro, admin ou sistema.

### 9.2 Passo 2 — Campos

Para cada campo, defina:

- nome conceitual;
- tipo esperado;
- obrigatório ou opcional;
- único ou não;
- pode ser editado depois?
- aparece em resposta da API?
- aparece na tela?
- deve ser protegido?
- precisa de validação?
- precisa de índice no banco?

### 9.3 Passo 3 — Regras de negócio

Defina:

- quem pode criar;
- quem pode editar;
- quem pode visualizar;
- quem pode inativar;
- quando a entidade pode ser usada;
- quando deve ser bloqueada;
- se pode ser apagada fisicamente;
- se deve ter histórico;
- se pertence a uma barbearia.

### 9.4 Passo 4 — Validações

Defina:

- campos obrigatórios;
- tamanho mínimo;
- tamanho máximo;
- formato;
- unicidade;
- valores permitidos;
- datas válidas;
- erros esperados.

### 9.5 Passo 5 — Camadas MVC

Decida se precisa de:

- Entity;
- Repository;
- Service;
- Controller;
- DTO de entrada;
- DTO de saída;
- Mapper;
- testes de repository;
- testes de service;
- testes de controller;
- testes de segurança.

### 9.6 Passo 6 — Testes antes de considerar pronto

Para cada entidade ou funcionalidade, defina:

- caminho feliz;
- erro de validação;
- erro de permissão;
- erro de dado inexistente;
- erro de duplicidade;
- erro de relacionamento;
- comportamento esperado no frontend.

---

## 10. Onde encontrar validações para atributos

Quando você for definir atributos de DTOs e entidades, procure validações nas documentações de Bean Validation, Jakarta Validation e Hibernate Validator.

### 10.1 Validações conceituais mais usadas

| Necessidade | Validação conceitual | Onde aplicar | Exemplo no projeto |
|---|---|---|---|
| Campo não pode ser vazio | Obrigatório/não branco | DTO de entrada | nome, e-mail, senha |
| Campo não pode ser nulo | Não nulo | DTO e Entity | role, status, expiresAt |
| Campo precisa ser e-mail | E-mail válido | DTO de login e User | email |
| Campo precisa ter tamanho mínimo | Tamanho mínimo | senha, nome | senha com pelo menos tamanho mínimo definido |
| Campo precisa ter tamanho máximo | Tamanho máximo | nome, deviceInfo, reason | evitar textos enormes |
| Data precisa ser futura | Data futura | refresh token | expiresAt |
| Data precisa ser passada ou presente | Data passada/presente | logs | createdAt |
| Campo precisa ser positivo | Número positivo | futuro: preço, limite | planos e dispositivos |
| Campo precisa obedecer padrão | Formato específico | telefone, slug | futuro: telefone e URL |

### 10.2 Como decidir validação de atributo

Para cada atributo, responda:

1. O usuário informa esse dado?
2. O sistema gera esse dado?
3. Esse dado pode vir vazio?
4. Esse dado pode ter formato inválido?
5. Esse dado precisa ser único?
6. Esse dado pode ser alterado depois?
7. Esse dado deve aparecer para o frontend?
8. Esse dado pode ser usado para buscar no banco?
9. Esse dado pode quebrar regra de segurança?

### 10.3 Onde estudar

| Tema | Link oficial | O que procurar |
|---|---|---|
| Validação no Spring Boot | https://docs.spring.io/spring-boot/reference/io/validation.html | Como o Spring Boot integra Bean Validation |
| Bean Validation no Spring Framework | https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html | Validação de beans no Spring |
| Jakarta Bean Validation | https://jakarta.ee/learn/docs/jakartaee-tutorial/current/beanvalidation/bean-validation/bean-validation.html | Constraints em objetos e atributos |
| Hibernate Validator | https://docs.jboss.org/hibernate/stable/validator/reference/en-US/html_single/ | Lista de constraints prontas e validações extras |

---

## 11. Entidade User

### 11.1 O que é

User representa qualquer pessoa que consegue acessar o sistema.

No Varthex Barber, User pode representar:

- SuperAdmin;
- Admin/Dono;
- Barbeiro;
- Cliente.

### 11.2 Por que é necessária

Sem User, o sistema não consegue autenticar ninguém.

Essa entidade permite que o sistema saiba:

- quem está tentando logar;
- qual é o e-mail;
- qual senha criptografada deve ser usada na comparação;
- qual perfil o usuário possui;
- se o usuário pode acessar;
- a qual barbearia pertence;
- quando foi criado;
- quando acessou pela última vez.

### 11.3 Campos conceituais

| Campo | Obrigatório | Único | Visível em resposta? | Editável? | Observação |
|---|---|---|---|---|---|
| id | Sim | Sim | Sim | Não | Identificador único |
| name | Sim | Não | Sim | Sim | Nome exibido no sistema |
| email | Sim | Sim | Sim | Com cuidado | Usado no login; deve ser normalizado |
| passwordHash | Sim | Não | Nunca | Apenas via troca de senha | Nunca salvar senha pura |
| role | Sim | Não | Sim | Apenas por admin autorizado | Define autorização inicial |
| status | Sim | Não | Sim | Sim | Controla acesso |
| barbershopId | Depende do perfil | Não | Sim, quando necessário | Com cuidado | SuperAdmin pode não ter barbearia |
| createdAt | Sim | Não | Talvez | Não | Auditoria básica |
| updatedAt | Sim | Não | Talvez | Sistema atualiza | Auditoria básica |
| lastLoginAt | Não | Não | Talvez | Sistema atualiza | Ajuda em segurança e gestão |

### 11.4 Validações de User

| Campo | Validação necessária | Motivo | Onde estudar |
|---|---|---|---|
| name | obrigatório, tamanho mínimo e máximo | Evitar usuário sem identificação | Bean Validation / Hibernate Validator |
| email | obrigatório, formato de e-mail, único | Login depende desse campo | Bean Validation e Spring Data JPA |
| passwordHash | obrigatório, não expor | Segurança | Spring Security Password Storage |
| role | obrigatório, valor permitido | Autorização | Java enum e Spring Security authorities |
| status | obrigatório, valor permitido | Controle de acesso | Java enum e regra de negócio |
| barbershopId | obrigatório para perfis não globais | Isolamento SaaS | Spring Data JPA relacionamentos |

### 11.5 Regras de negócio de User

| Código | Regra | Exemplo correto | Exemplo errado |
|---|---|---|---|
| RN-USER-01 | E-mail deve ser único | Um e-mail pertence a um usuário | Dois usuários com mesmo e-mail |
| RN-USER-02 | Senha não pode ser salva pura | Salvar apenas hash | Salvar “123456” no banco |
| RN-USER-03 | Usuário inativo não pode logar | status ACTIVE permite login | status INACTIVE permite login |
| RN-USER-04 | Usuário bloqueado não pode logar | BLOCKED nega acesso | BLOCKED acessa dashboard |
| RN-USER-05 | SuperAdmin pode não ter barbearia | barbershopId vazio para SUPER_ADMIN | exigir barbearia para SuperAdmin |
| RN-USER-06 | Admin, Barbeiro e Cliente precisam de barbearia | ADMIN com barbershopId | BARBER sem barbershopId |
| RN-USER-07 | Resposta da API nunca inclui passwordHash | user seguro sem senha | resposta com passwordHash |
| RN-USER-08 | Alteração de role deve ser restrita | apenas perfil autorizado altera | cliente altera a própria role |

### 11.6 Camadas necessárias para User

| Camada | Precisa? | Por quê |
|---|---|---|
| Entity | Sim | User será salvo no banco |
| Repository | Sim | Será necessário buscar por e-mail e id |
| Service | Sim | Regras de criação, status e busca segura |
| Controller | Talvez | Na Semana 02 pode não ter CRUD completo; endpoints podem ficar em Auth |
| DTO de entrada | Sim | Login e criação inicial precisam entrada controlada |
| DTO de saída | Sim | Não pode expor passwordHash |
| Mapper | Recomendado | Separar Entity da resposta da API |
| Teste Repository | Sim | Garantir busca por e-mail |
| Teste Service | Sim | Validar usuário ativo/inativo e regras |
| Teste Controller | Depende | Se houver endpoint de usuário |

### 11.7 Testes manuais de User

| Caso | O que testar | Resultado esperado |
|---|---|---|
| Usuário válido | Login com usuário ACTIVE | Login permitido |
| Usuário inativo | Login com INACTIVE | Login negado |
| Usuário bloqueado | Login com BLOCKED | Login negado |
| E-mail duplicado | Criar outro com mesmo e-mail | Sistema impede |
| Resposta de usuário | Consultar usuário logado | Não retorna passwordHash |

---

## 12. Role

### 12.1 O que é

Role representa o perfil do usuário no sistema.

### 12.2 Perfis iniciais

| Role | Descrição | Exemplo de acesso futuro |
|---|---|---|
| SUPER_ADMIN | Dono da plataforma SaaS | Gerenciar barbearias, planos e assinaturas |
| ADMIN | Dono ou gerente da barbearia | Gerenciar equipe, clientes, agenda, financeiro |
| BARBER | Barbeiro | Ver agenda própria e comissão própria |
| CLIENT | Cliente | Agendar horário e acompanhar histórico próprio |

### 12.3 Regras de negócio de Role

| Código | Regra | Motivo |
|---|---|---|
| RN-ROLE-01 | Todo User precisa ter uma Role | Sem perfil, não há autorização |
| RN-ROLE-02 | Role não deve ser texto livre | Evita valores inválidos |
| RN-ROLE-03 | Cliente não pode alterar a própria Role | Evita escalada de privilégio |
| RN-ROLE-04 | Role deve entrar no token ou ser recuperável de forma segura | Backend precisa autorizar requisições |

### 12.4 Camadas necessárias para Role

| Camada | Precisa? | Por quê |
|---|---|---|
| Entity | Não necessariamente | No início pode ser enum |
| Repository | Não | Perfis são valores fixos |
| Service | Não inicialmente | A regra pode ficar no User/AuthService |
| Controller | Não | Não precisa CRUD de perfil agora |
| Testes | Indiretos | Testar login e autorização por perfil |

---

## 13. UserStatus

### 13.1 O que é

UserStatus representa a situação da conta.

### 13.2 Status iniciais

| Status | Significado | Pode logar? |
|---|---|---|
| ACTIVE | Conta ativa | Sim |
| INACTIVE | Conta desativada | Não |
| BLOCKED | Conta bloqueada | Não |
| PENDING | Conta criada, mas pendente | Não inicialmente |

### 13.3 Regras

| Código | Regra | Motivo |
|---|---|---|
| RN-STATUS-01 | Somente ACTIVE pode logar | Segurança e controle administrativo |
| RN-STATUS-02 | BLOCKED deve impedir acesso mesmo com senha correta | Bloqueio precisa ser respeitado |
| RN-STATUS-03 | PENDING não deve acessar área interna | Evita contas incompletas |
| RN-STATUS-04 | Status deve ser retornado com cuidado no /auth/me | Frontend pode exibir mensagens coerentes |

---

## 14. Entidade RefreshToken

### 14.1 O que é

RefreshToken representa uma sessão renovável.

O access token deve durar pouco. O refresh token permite gerar um novo access token sem pedir senha novamente.

### 14.2 Por que é necessário

Sem refresh token, você teria duas opções ruins:

- deixar o access token durar muito tempo, aumentando risco de segurança;
- obrigar o usuário a fazer login toda hora.

Refresh token equilibra usabilidade e segurança.

### 14.3 Campos conceituais

| Campo | Obrigatório | Visível em resposta? | Editável? | Observação |
|---|---|---|---|---|
| id | Sim | Não necessariamente | Não | Identificador interno |
| token | Sim | Apenas na resposta de login/refresh | Não | Deve ser tratado como segredo |
| userId | Sim | Não necessariamente | Não | Dono do token |
| expiresAt | Sim | Talvez | Não | Define validade |
| revokedAt | Não | Não | Sistema altera | Preenchido no logout/revogação |
| createdAt | Sim | Não | Não | Auditoria |
| deviceInfo | Não | Talvez para gestão futura | Não | Ajuda no controle de dispositivos |
| ipAddress | Não | Não | Não | Ajuda em segurança |

### 14.4 Regras de negócio

| Código | Regra | Motivo |
|---|---|---|
| RN-RT-01 | Refresh token deve expirar | Sessão não pode ser eterna |
| RN-RT-02 | Logout deve revogar refresh token | Encerrar sessão de verdade |
| RN-RT-03 | Token revogado não pode renovar sessão | Segurança |
| RN-RT-04 | Token vencido não pode renovar sessão | Segurança |
| RN-RT-05 | Cada login pode gerar novo refresh token | Permite múltiplas sessões |
| RN-RT-06 | Refresh token deve pertencer a um usuário existente | Integridade |
| RN-RT-07 | Não registrar token em log | Token é segredo |

### 14.5 Camadas necessárias

| Camada | Precisa? | Por quê |
|---|---|---|
| Entity | Sim | Deve ser persistido |
| Repository | Sim | Buscar token e salvar revogação |
| Service | Sim | Criar, validar, expirar e revogar |
| Controller | Não próprio inicialmente | Usado por AuthController |
| DTO | Sim | RefreshRequest e resposta de nova sessão |
| Teste Repository | Sim | Buscar token |
| Teste Service | Sim | Validar vencido, revogado e válido |
| Teste Controller | Sim via AuthController | Testar endpoint de refresh/logout |

---

## 15. Entidade Barbershop na autenticação

### 15.1 O que é

Barbershop representa uma barbearia cadastrada no SaaS.

### 15.2 Por que aparece na Semana 02

A Semana 03 vai aprofundar SaaS base e isolamento por barbearia. Mesmo assim, na autenticação você já deve preparar o vínculo entre usuário e barbearia.

Sem esse vínculo, o sistema não saberia separar dados entre barbearias diferentes.

### 15.3 Campos mínimos para esta semana

| Campo | Obrigatório | Observação |
|---|---|---|
| id | Sim | Identificador da barbearia |
| name | Sim | Nome da barbearia |
| status | Sim | Ativa, inativa, bloqueada ou pendente |
| createdAt | Sim | Auditoria |
| updatedAt | Sim | Auditoria |

### 15.4 Regras de negócio

| Código | Regra | Motivo |
|---|---|---|
| RN-BS-01 | Admin, Barbeiro e Cliente devem ter barbershopId | Isolamento SaaS |
| RN-BS-02 | SuperAdmin pode não ter barbershopId | Usuário global da plataforma |
| RN-BS-03 | Usuário não deve acessar dados de outra barbearia | Segurança multiempresa |
| RN-BS-04 | Barbearia bloqueada pode impedir login dos usuários ligados a ela | Controle SaaS futuro |

### 15.5 Camadas necessárias nesta semana

| Camada | Precisa agora? | Observação |
|---|---|---|
| Entity | Recomendado | Preparar relacionamento com User |
| Repository | Opcional | Pode ser usado na criação inicial/seed |
| Service | Opcional | Semana 03 aprofunda |
| Controller | Não agora | CRUD de barbearia fica para Semana 03 |
| DTO | Não agora | Só se houver endpoint |
| Testes | Básicos/futuros | Foco será maior na Semana 03 |

---

## 16. AuthLog

### 16.1 O que é

AuthLog registra eventos de autenticação.

### 16.2 Deve implementar agora?

Não é obrigatório para finalizar a Semana 02.

Mas é recomendado documentar porque melhora a análise de segurança.

### 16.3 Eventos úteis

| Evento | Quando ocorre |
|---|---|
| LOGIN_SUCCESS | Login correto |
| INVALID_CREDENTIALS | E-mail ou senha inválidos |
| USER_INACTIVE | Usuário existe, mas está inativo |
| USER_BLOCKED | Usuário bloqueado tentou entrar |
| REFRESH_SUCCESS | Refresh token usado com sucesso |
| REFRESH_EXPIRED | Refresh token vencido |
| REFRESH_REVOKED | Refresh token revogado usado |
| LOGOUT_SUCCESS | Sessão encerrada |

### 16.4 Campos conceituais

| Campo | Motivo |
|---|---|
| id | Identificador |
| email | Saber qual e-mail tentou login |
| userId | Ligar ao usuário, se existir |
| success | Diferenciar sucesso e erro |
| reason | Motivo do evento |
| ipAddress | Segurança |
| userAgent | Dispositivo/navegador |
| createdAt | Data do evento |

### 16.5 Camadas necessárias

| Camada | Precisa agora? | Observação |
|---|---|---|
| Entity | Opcional | Bom para evolução |
| Repository | Opcional | Salvar logs |
| Service | Recomendado se implementar | Centralizar registro |
| Controller | Não | Logs são internos |
| DTO | Não inicialmente | Não expor agora |
| Testes | Sim se implementar | Verificar registro em login |

---

## 17. PasswordResetToken

### 17.1 O que é

PasswordResetToken representa um token de recuperação de senha.

### 17.2 Deve implementar agora?

Não.

Recuperação de senha está fora do escopo da Semana 02.

### 17.3 Por que documentar mesmo assim?

Porque autenticação não termina no login. Em sistemas reais, recuperar senha será necessário. Mas colocar isso agora aumenta muito o escopo.

### 17.4 Campos futuros

| Campo | Motivo |
|---|---|
| id | Identificador |
| token | Token de recuperação |
| userId | Usuário dono |
| expiresAt | Expiração |
| usedAt | Evitar reuso |
| createdAt | Auditoria |

---

## 18. DTOs necessários

DTO é o contrato de entrada e saída da API.

DTO não deve ser confundido com Entity.

Entity representa o banco. DTO representa o que entra e sai da aplicação.

### 18.1 LoginRequest

| Campo | Obrigatório | Validação | Observação |
|---|---|---|---|
| email | Sim | obrigatório e formato de e-mail | Identifica usuário |
| password | Sim | obrigatório e tamanho mínimo | Nunca salvar como está |

### 18.2 LoginResponse

| Campo | Obrigatório | Observação |
|---|---|---|
| accessToken | Sim | Token curto para acessar rotas |
| refreshToken | Sim | Token para renovar sessão |
| tokenType | Sim | Normalmente Bearer |
| expiresIn | Sim | Tempo de validade do access token |
| user | Sim | Dados seguros do usuário |

### 18.3 AuthenticatedUserResponse

| Campo | Motivo |
|---|---|
| id | Identificar usuário |
| name | Exibir no frontend |
| email | Exibir perfil |
| role | Autorizar telas |
| status | Confirmar situação |
| barbershopId | Isolamento SaaS |

Nunca incluir passwordHash.

### 18.4 RefreshTokenRequest

| Campo | Obrigatório | Observação |
|---|---|---|
| refreshToken | Sim | Deve existir e estar válido |

### 18.5 LogoutRequest

| Campo | Obrigatório | Observação |
|---|---|---|
| refreshToken | Recomendado | Ajuda a revogar a sessão correta |

### 18.6 RegisterUserRequest inicial

Este DTO pode existir se você decidir criar endpoint inicial de usuário.

| Campo | Obrigatório | Observação |
|---|---|---|
| name | Sim | Nome do usuário |
| email | Sim | Único |
| password | Sim | Vai virar hash |
| role | Sim | Perfil inicial |
| barbershopId | Depende | Obrigatório para perfis não globais |

Se você ainda não quiser endpoint de cadastro, pode criar usuário por seed ou cadastro manual.

---

## 19. Endpoints conceituais

### 19.1 Rotas mínimas de autenticação

| Método | Rota | Pública? | Objetivo | Entrada | Saída esperada |
|---|---|---|---|---|---|
| POST | /auth/login | Sim | Entrar no sistema | e-mail e senha | tokens e usuário seguro |
| POST | /auth/refresh | Sim ou controlada | Renovar access token | refresh token | novo access token |
| POST | /auth/logout | Não | Encerrar sessão | token atual ou refresh token | confirmação |
| GET | /auth/me | Não | Consultar usuário logado | token no cabeçalho | usuário seguro |

### 19.2 Rotas para teste de proteção

| Método | Rota | Objetivo |
|---|---|---|
| GET | /health | Confirmar aplicação viva |
| GET | /protected | Confirmar rota protegida simples |
| GET | /admin/test | Confirmar acesso por perfil, se quiser |

### 19.3 Regras das rotas

| Rota | Regra |
|---|---|
| /auth/login | Não exige token |
| /auth/refresh | Exige refresh token válido |
| /auth/logout | Exige usuário autenticado ou refresh token válido |
| /auth/me | Exige access token válido |
| /health | Pode ser pública |
| qualquer rota administrativa | Deve exigir autenticação |

---

## 20. Fluxo completo de login

### 20.1 Caminho feliz

1. Usuário abre a tela de login.
2. Frontend exibe campos de e-mail e senha.
3. Usuário envia as credenciais.
4. Frontend envia a requisição para o backend.
5. Backend valida se os campos obrigatórios foram enviados.
6. Backend normaliza o e-mail, se necessário.
7. Backend busca usuário pelo e-mail.
8. Backend verifica se usuário existe.
9. Backend verifica status do usuário.
10. Backend compara senha informada com hash salvo.
11. Backend identifica role.
12. Backend identifica barbearia vinculada.
13. Backend gera access token.
14. Backend gera refresh token.
15. Backend salva refresh token com expiração.
16. Backend atualiza último login.
17. Backend retorna tokens e dados seguros.
18. Frontend salva a sessão da forma definida.
19. Frontend redireciona para a área interna.
20. Usuário acessa uma rota protegida com token.

### 20.2 Senha errada

1. Usuário informa e-mail existente e senha errada.
2. Backend encontra usuário.
3. Comparação de senha falha.
4. Backend não informa se o erro foi senha ou e-mail.
5. Frontend mostra mensagem genérica.

Mensagem recomendada:

- Credenciais inválidas.

### 20.3 E-mail inexistente

1. Usuário informa e-mail não cadastrado.
2. Backend não encontra usuário.
3. Backend retorna erro genérico.
4. Frontend mostra a mesma mensagem de senha errada.

Motivo: não facilitar enumeração de usuários.

### 20.4 Usuário inativo

1. Usuário informa credenciais corretas.
2. Backend encontra usuário.
3. Backend identifica status INACTIVE.
4. Backend bloqueia login.
5. Frontend informa que a conta não está disponível ou deve falar com o administrador.

### 20.5 Usuário bloqueado

1. Usuário informa credenciais corretas.
2. Backend identifica status BLOCKED.
3. Backend nega login.
4. Sistema pode registrar tentativa em AuthLog.

---

## 21. Fluxo completo de refresh token

1. Access token expira.
2. Frontend percebe erro de autenticação ou antes da expiração tenta renovar.
3. Frontend envia refresh token para rota de renovação.
4. Backend busca refresh token no banco.
5. Backend verifica se existe.
6. Backend verifica se não está revogado.
7. Backend verifica se não está vencido.
8. Backend busca o usuário dono.
9. Backend verifica se usuário ainda está ativo.
10. Backend gera novo access token.
11. Backend decide se mantém ou rotaciona refresh token.
12. Backend retorna nova sessão.
13. Frontend atualiza sessão.

### Decisão importante

Você deve decidir se o refresh token será rotacionado.

Rotacionar significa gerar um novo refresh token a cada uso e invalidar o anterior. É mais seguro, mas aumenta a complexidade.

Para estudante e MVP, pode começar simples, mas documente a decisão.

---

## 22. Fluxo completo de logout

1. Usuário clica em sair.
2. Frontend chama rota de logout.
3. Backend identifica a sessão.
4. Backend revoga o refresh token.
5. Backend retorna sucesso.
6. Frontend remove tokens/sessão local.
7. Frontend redireciona para login.
8. Tentativa de usar refresh token revogado deve falhar.

Logout não deve ser apenas “apagar token no frontend”. O backend também precisa invalidar o refresh token quando ele existir no banco.

---

## 23. Segurança mínima obrigatória

| Item | Obrigatório? | Motivo |
|---|---|---|
| Senha com hash | Sim | Senha pura é risco grave |
| Mensagem genérica para login inválido | Sim | Evita descobrir e-mails cadastrados |
| Token com expiração | Sim | Reduz impacto de token vazado |
| Refresh token revogável | Sim | Permite logout real |
| Rotas protegidas no backend | Sim | Frontend sozinho não protege nada |
| Não retornar passwordHash | Sim | Evita vazamento de segredo |
| Não logar senha/token | Sim | Logs podem vazar |
| Validar status do usuário | Sim | Usuário bloqueado não pode entrar |
| Isolar barbearia | Preparar | SaaS exige separação de dados |
| HTTPS em produção | Futuro/produção | Tokens não devem trafegar em HTTP aberto |

---

## 24. Onde estudar segurança

| Necessidade | Documentação | O que procurar | Aplicação no Varthex Barber |
|---|---|---|---|
| Visão geral do Spring Security | https://docs.spring.io/spring-security/reference/index.html | Authentication e Authorization | Entender base de segurança |
| Começar com Spring Security | https://docs.spring.io/spring-security/reference/servlet/getting-started.html | Configuração inicial | Proteger rotas |
| Login com usuário e senha | https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/index.html | Username/password authentication | Login do sistema |
| Armazenamento de senha | https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html | PasswordEncoder | Salvar passwordHash |
| JWT e bearer token | https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html | JWT validation | Proteger API com token |
| Boas práticas de autenticação | https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html | Senhas, erros, sessão | Evitar decisões inseguras |
| Boas práticas de sessão | https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html | Expiração e gerenciamento de sessão | Refresh token e logout |

---

## 25. Estrutura conceitual de pacotes

A estrutura precisa ajudar você a não misturar responsabilidades.

Sugestão conceitual para a Semana 02:

| Pacote | Responsabilidade | O que deve conter | O que não deve conter |
|---|---|---|---|
| auth | Fluxos de autenticação | login, refresh, logout, me, token service | CRUD completo de usuários |
| users | Usuários do sistema | User, Role, UserStatus, busca por e-mail | Regra de JWT |
| tokens | Sessões renováveis | RefreshToken e regras de renovação | Tela de login |
| barbershops | Barbearia base | entidade mínima para vínculo SaaS | CRUD completo ainda |
| config.security | Configuração de segurança | filtros, regras de rotas, password encoder | Regra de negócio de login |
| common | Erros e respostas comuns | tratamento de exceções e respostas padronizadas | regras específicas de autenticação |

---

## 26. Ordem direta de execução sem código

Siga esta ordem. Não pule etapas.

### Etapa 1 — Entender

1. Leia este documento inteiro.
2. Explique autenticação com suas palavras.
3. Explique autorização com suas palavras.
4. Explique access token e refresh token.
5. Explique por que senha precisa de hash.

### Etapa 2 — Documentar decisões

6. Crie ou atualize seu diário da Semana 02.
7. Escreva quais perfis existirão.
8. Escreva quais status existirão.
9. Escreva se e-mail será único globalmente ou por barbearia.
10. Escreva se SuperAdmin terá barbershopId.
11. Escreva o tempo inicial do access token.
12. Escreva o tempo inicial do refresh token.
13. Escreva onde o frontend guardará a sessão.

### Etapa 3 — Modelar entidades

14. Defina User.
15. Defina Role.
16. Defina UserStatus.
17. Defina RefreshToken.
18. Defina Barbershop mínima.
19. Documente AuthLog como futuro ou opcional.
20. Documente PasswordResetToken como futuro.

### Etapa 4 — Definir camadas

21. Para User, defina Entity, Repository, Service, DTOs e testes.
22. Para RefreshToken, defina Entity, Repository, Service, DTOs e testes.
23. Para Barbershop, defina pelo menos Entity inicial ou preparação para Semana 03.
24. Para Auth, defina Controller, Service, JwtService e DTOs.
25. Para Security, defina configuração, filtro e serviço de usuário.

### Etapa 5 — Definir fluxos

26. Desenhe fluxo de login.
27. Desenhe fluxo de senha errada.
28. Desenhe fluxo de usuário inativo.
29. Desenhe fluxo de refresh.
30. Desenhe fluxo de logout.
31. Desenhe fluxo de rota protegida.

### Etapa 6 — Definir testes

32. Defina testes manuais.
33. Defina testes de validação.
34. Defina testes de service.
35. Defina testes de repository.
36. Defina testes de controller.
37. Defina testes de segurança.

### Etapa 7 — Implementar

38. Implemente por conta própria.
39. Teste a cada pequena parte.
40. Não deixe para testar tudo no final.

### Etapa 8 — Fechar semana

41. Atualize documentação.
42. Atualize README se necessário.
43. Atualize diário da semana.
44. Faça commit.
45. Abra o GitHub e confira se os arquivos estão legíveis.

---

## 27. Testes manuais obrigatórios

| Código | Caso | Entrada | Resultado esperado |
|---|---|---|---|
| CT-AUTH-01 | Login válido | E-mail e senha corretos de usuário ACTIVE | Retorna sessão válida |
| CT-AUTH-02 | Senha errada | E-mail correto e senha incorreta | Nega login com mensagem genérica |
| CT-AUTH-03 | E-mail inexistente | E-mail não cadastrado | Nega login com mensagem genérica |
| CT-AUTH-04 | Usuário inativo | Credenciais corretas de INACTIVE | Nega login |
| CT-AUTH-05 | Usuário bloqueado | Credenciais corretas de BLOCKED | Nega login |
| CT-AUTH-06 | Rota protegida sem token | Requisição sem token | Acesso negado |
| CT-AUTH-07 | Rota protegida com token válido | Requisição autenticada | Acesso liberado |
| CT-AUTH-08 | Token expirado | Token vencido | Acesso negado ou renovação exigida |
| CT-AUTH-09 | Refresh token válido | Refresh token ativo | Novo access token gerado |
| CT-AUTH-10 | Refresh token vencido | Token expirado | Renovação negada |
| CT-AUTH-11 | Refresh token revogado | Token usado após logout | Renovação negada |
| CT-AUTH-12 | Logout | Usuário logado | Sessão encerrada e token revogado |
| CT-AUTH-13 | /auth/me válido | Token válido | Retorna usuário seguro |
| CT-AUTH-14 | /auth/me sem token | Sem autenticação | Acesso negado |
| CT-AUTH-15 | Resposta segura | Qualquer resposta de usuário | Não retorna passwordHash |
| CT-AUTH-16 | Frontend sem sessão | Abrir dashboard sem login | Redireciona para login |
| CT-AUTH-17 | Frontend com sessão | Login válido | Acessa área interna |

---

## 28. Testes automatizados recomendados

Você ainda está aprendendo, então comece pequeno.

### 28.1 Testes de Repository

Objetivo: provar que as consultas ao banco funcionam.

Testar:

- buscar usuário por e-mail;
- não encontrar e-mail inexistente;
- impedir duplicidade de e-mail;
- salvar refresh token;
- buscar refresh token pelo valor;
- identificar token revogado.

### 28.2 Testes de Service

Objetivo: provar regras de negócio.

Testar:

- login válido;
- senha errada;
- usuário inexistente;
- usuário inativo;
- usuário bloqueado;
- geração de token;
- refresh válido;
- refresh vencido;
- logout revogando token.

### 28.3 Testes de Controller

Objetivo: provar comportamento HTTP.

Testar:

- POST /auth/login com sucesso;
- POST /auth/login com erro;
- GET /auth/me sem token;
- GET /auth/me com token;
- POST /auth/refresh com token válido;
- POST /auth/logout.

### 28.4 Testes de Security

Objetivo: provar proteção de rotas.

Testar:

- rota pública acessível;
- rota protegida bloqueada sem token;
- rota protegida liberada com token;
- role incorreta negada, quando aplicar;
- token inválido negado.

### 28.5 Onde estudar testes

| Necessidade | Documentação | O que procurar |
|---|---|---|
| Testes no Spring Boot | https://docs.spring.io/spring-boot/reference/testing/index.html | Spring Boot Test |
| Testes de segurança | https://docs.spring.io/spring-security/reference/servlet/test/index.html | Testar autenticação e autorização |
| Testes MVC | https://docs.spring.io/spring-framework/reference/testing/spring-mvc-test-framework.html | MockMvc |
| Testes JPA | https://docs.spring.io/spring-boot/reference/testing/test-auto-configuration.html | DataJpaTest |
| JUnit 5 | https://junit.org/junit5/docs/current/user-guide/ | Organização dos testes |

---

## 29. Documentações oficiais principais

| Tema | Documentação | O que estudar primeiro |
|---|---|---|
| Spring Framework | https://docs.spring.io/spring-framework/reference/index.html | Core, IoC, Validation e Web MVC |
| Spring Beans | https://docs.spring.io/spring-framework/reference/core/beans/introduction.html | IoC Container e Beans |
| Bean definitions | https://docs.spring.io/spring-framework/reference/core/beans/definition.html | Como o Spring define beans |
| Spring Boot | https://docs.spring.io/spring-boot/documentation.html | Web, Data, Security, Testing, Validation |
| Spring Boot Validation | https://docs.spring.io/spring-boot/reference/io/validation.html | Validação automática com Bean Validation |
| Spring Security | https://docs.spring.io/spring-security/reference/index.html | Authentication e Authorization |
| Password Storage | https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html | PasswordEncoder |
| Username/Password Authentication | https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/index.html | Login com usuário e senha |
| JWT Resource Server | https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html | Bearer token e JWT |
| Spring Data JPA | https://docs.spring.io/spring-data/jpa/reference/index.html | Repositories e JPA |
| JpaRepository | https://docs.spring.io/spring-data/jpa/docs/current/api/org/springframework/data/jpa/repository/JpaRepository.html | Métodos herdados |
| Spring MVC | https://docs.spring.io/spring-framework/reference/web/webmvc.html | Controllers e requisições |
| Jakarta Validation | https://jakarta.ee/learn/docs/jakartaee-tutorial/current/beanvalidation/bean-validation/bean-validation.html | Constraints |
| Hibernate Validator | https://docs.jboss.org/hibernate/stable/validator/reference/en-US/html_single/ | Constraints prontas |
| Next.js Authentication | https://nextjs.org/docs/app/guides/authentication | Sessão e proteção de rotas |
| OWASP Authentication | https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html | Boas práticas |
| OWASP Session Management | https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html | Sessões e expiração |

---

## 30. Como estudar a documentação sem se perder

Você não precisa ler todas as páginas inteiras.

Para cada documentação, faça este roteiro:

1. Abra o link indicado.
2. Leia o título.
3. Leia a introdução.
4. Procure o termo indicado na tabela.
5. Anote a definição com suas palavras.
6. Escreva onde esse conceito entra no Varthex Barber.
7. Anote uma dúvida.
8. Volte para o projeto e tente aplicar.

Modelo de anotação:

| Campo | Resposta |
|---|---|
| Documentação lida |  |
| Conceito estudado |  |
| O que entendi |  |
| Onde entra no projeto |  |
| Dúvida que ficou |  |
| Próxima ação |  |

---

## 31. Checklist de análise antes de implementar

Marque somente quando realmente souber explicar.

| Item | Status |
|---|---|
| Entendi autenticação | Pendente |
| Entendi autorização | Pendente |
| Entendi Spring Bean | Pendente |
| Entendi Bean Validation | Pendente |
| Entendi MVC | Pendente |
| Entendi DTO | Pendente |
| Entendi por que não expor Entity diretamente | Pendente |
| Entendi User | Pendente |
| Entendi Role | Pendente |
| Entendi UserStatus | Pendente |
| Entendi RefreshToken | Pendente |
| Entendi vínculo com Barbershop | Pendente |
| Defini campos de User | Pendente |
| Defini campos de RefreshToken | Pendente |
| Defini rotas públicas | Pendente |
| Defini rotas protegidas | Pendente |
| Defini mensagens de erro | Pendente |
| Defini testes manuais | Pendente |
| Consultei documentação oficial | Pendente |
| Atualizei diário da semana | Pendente |

---

## 32. Critérios de aceite da Semana 02

A Semana 02 só deve ser considerada concluída quando você conseguir provar que:

| Código | Critério | Como provar |
|---|---|---|
| CA-01 | Usuário consegue logar com e-mail e senha válidos | Teste manual no frontend ou API |
| CA-02 | Senha é salva com hash | Verificar que senha pura não aparece no banco |
| CA-03 | Login inválido retorna erro genérico | Testar senha errada e e-mail inexistente |
| CA-04 | Usuário inativo não consegue logar | Testar status INACTIVE |
| CA-05 | Usuário bloqueado não consegue logar | Testar status BLOCKED |
| CA-06 | Login retorna access token | Conferir resposta segura |
| CA-07 | Login retorna refresh token | Conferir resposta segura |
| CA-08 | Rota protegida bloqueia sem token | Testar chamada sem autenticação |
| CA-09 | Rota protegida libera com token válido | Testar chamada autenticada |
| CA-10 | /auth/me retorna usuário seguro | Não pode retornar passwordHash |
| CA-11 | Refresh token renova sessão | Testar rota de refresh |
| CA-12 | Logout revoga refresh token | Testar refresh após logout |
| CA-13 | Frontend redireciona sem sessão | Abrir rota interna sem login |
| CA-14 | Documentação foi atualizada | Ver no GitHub |
| CA-15 | Diário da semana foi preenchido | Ver arquivo de diário |

---

## 33. Erros comuns de iniciante

| Erro | Por que acontece | Como evitar |
|---|---|---|
| Começar pela tela de login | Dá sensação rápida de progresso | Primeiro defina fluxo, entidade e regras |
| Salvar senha pura | Falta de estudo de segurança | Estude Password Storage no Spring Security |
| Retornar passwordHash na API | Usar Entity como resposta | Use resposta segura/DTO |
| Controller com regra de negócio | Pressa e falta de camada Service | Controller deve só receber e devolver |
| Repository com regra complexa | Misturar consulta com decisão | Regra fica no Service |
| Não criar RefreshToken | Achar que JWT sozinho resolve tudo | Planeje renovação e logout |
| Token sem expiração | Facilita desenvolvimento, mas é inseguro | Todo token deve expirar |
| Mensagem específica demais | Dizer “e-mail não existe” | Use mensagem genérica |
| Esquecer usuário inativo | Testar só usuário válido | Crie casos de status |
| Esquecer barbershopId | Pensar como sistema de uma barbearia | SaaS exige isolamento |
| Testar só caminho feliz | Parece que funcionou | Teste erro, ausência de token e bloqueio |
| Não atualizar documentação | Código muda e docs ficam falsas | Atualize docs junto com entrega |

---

## 34. Diário de aprendizado da Semana 02

Crie ou atualize o arquivo:

`docs/diario/semana-02.md`

Responda:

1. O que autenticação resolve no Varthex Barber?
2. Qual é a diferença entre autenticação e autorização?
3. Quais perfis existem no sistema?
4. Quais status de usuário existem?
5. Quais campos User precisa ter?
6. Por que passwordHash existe?
7. Por que passwordHash nunca deve aparecer em resposta?
8. O que é access token?
9. O que é refresh token?
10. O que acontece no logout?
11. Como User se relaciona com Barbershop?
12. Quais rotas são públicas?
13. Quais rotas são protegidas?
14. Quais documentações oficiais você consultou?
15. Qual foi a parte mais difícil?
16. Qual erro você cometeu e como corrigiu?
17. O que falta melhorar depois?
18. Qual commit fecha esta semana?

---

## 35. Entrega esperada no GitHub

Ao final da semana, o repositório deve mostrar claramente:

- documentação da Semana 02 atualizada;
- diário de aprendizado da Semana 02;
- backend com base de autenticação;
- frontend com tela de login simples;
- rotas públicas e protegidas definidas;
- entidade User planejada/implementada;
- entidade RefreshToken planejada/implementada;
- perfis definidos;
- status definidos;
- README atualizado se necessário;
- commit organizado.

Nome de commit sugerido para documentação:

`docs: detalha requisitos da autenticacao`

Nome de commit sugerido para implementação:

`feat: implementa base de autenticacao`

---

## 36. Resultado esperado da Semana 02

Ao concluir a Semana 02, você deve conseguir explicar sem abrir o código:

- por que autenticação é necessária;
- qual problema de negócio ela resolve;
- qual é a diferença entre autenticação e autorização;
- quais entidades existem;
- quais campos cada entidade precisa;
- quais campos são sensíveis;
- quais validações devem ser aplicadas;
- quais camadas MVC cada parte precisa;
- quais rotas são públicas;
- quais rotas são protegidas;
- como login funciona;
- como refresh funciona;
- como logout funciona;
- como testar manualmente;
- onde estudar na documentação oficial;
- como saber que a entrega está pronta.

Quando você conseguir fazer isso, estará pronto para implementar e corrigir com muito mais clareza.
