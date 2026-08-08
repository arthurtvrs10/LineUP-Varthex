# syntax=docker/dockerfile:1

# =========================================================
# ETAPA 1: BUILD
# Compila o projeto usando Maven e Java 21
# =========================================================

# 1. Escolhe a versão do Maven e do Java
FROM maven:3.9-eclipse-temurin-21-alpine AS build

# 2. Define a pasta de trabalho dentro do container
WORKDIR /backend

# 3. Copia primeiro o arquivo de dependências
COPY pom.xml ./

# 4. Baixa as dependências antecipadamente
# Isso melhora o cache das próximas builds
RUN mvn dependency:go-offline -B

# Verifica as versões utilizadas durante o build
RUN java --version && mvn --version

# 5. Copia o código-fonte do backend
COPY src ./src

# 6. Compila, testa e gera o arquivo .jar
RUN mvn clean package -DskipTests -B

# =========================================================
# ETAPA 2: EXECUÇÃO
# Cria uma imagem menor contendo apenas o Java e o .jar
# =========================================================

# Utiliza apenas o Java Runtime, sem o Maven
FROM eclipse-temurin:21-jre-alpine AS runtime

# Define a pasta da aplicação
WORKDIR /app

# Cria um usuário sem privilégios de administrador
RUN addgroup -S spring && adduser -S spring -G spring

# Copia o arquivo .jar gerado na etapa de build
COPY --from=build --chown=spring:spring /backend/target/*.jar app.jar

# Executa a aplicação com o usuário criado
USER spring

# 7. Informa que o backend utiliza a porta 8080
EXPOSE 8080

# 8. Inicia o backend Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]