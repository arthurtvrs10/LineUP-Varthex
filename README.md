# 💈 LINEUP - Gestão SaaS de Barbearias

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Next.js-14+-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

Sistema SaaS multi-tenant completo para **agendamento, gestão operacional e financeira de barbearias e profissionais autônomos**, integrando backend corporativo em **Spring Boot** com frontend dinâmico em **Next.js**.

## DRIVE:  https://drive.google.com/drive/u/0/folders/1A0dUnrlsAg9sr15sGXIrUMwdVVaZ_QyZ
---

## 🌟 Funcionalidades

- 📅 **Agendamento Inteligente**: Gestão de horários de barbeiros com prevenção de conflitos.
- 👥 **Gestão de Clientes e Histórico**: Perfil completo do cliente com preferências e histórico de cortes.
- 💳 **Módulo Financeiro**: Registro de transações, comissões de profissionais e relatórios de faturamento.
- 🔐 **Autenticação & Segurança**: Controle de acesso seguro por roles com JWT e Spring Security.
- 🐳 **Ambiente Unificado**: Suporte a execução de todos os módulos via Docker Compose.

---

## 🏗️ Estrutura do Ecossistema

```
varthex-barber/
├── backend/              # API RESTful Spring Boot 3 (Java 21)
│   ├── src/main/java/    # Controladores, Serviços, Segurança e Entidades
│   ├── Dockerfile
│   └── pom.xml
├── frontend/             # Interface Web / Painel Next.js & React
├── docs/                 # Documentação técnica e especificações
├── docker-compose.yml    # Orquestração dos containers
└── CONTRIBUTING.md
```

---

## 🚀 Como Executar

### Via Docker Compose
```bash
docker-compose up --build
```

- **Painel Web**: `http://localhost:3000`
- **Backend API**: `http://localhost:8080`

---

## 📄 Licença

Software proprietário. Todos os direitos reservados — distribuição não autorizada.

---

<p align="center">Desenvolvido por <a href="https://github.com/arthurtvrs10">Arthur Tavares</a></p>
