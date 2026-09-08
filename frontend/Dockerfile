#syntax=docker/dockerfile:1

# 1. Escolhe o Node.js e sua versão
FROM node:20-alpine

# 2. Define a pasta de trabalho dentro do container
WORKDIR /frontend

# 3. Copia primeiro os arquivos de dependências
COPY package.json package-lock.json ./

# 4. Instala exatamente as versões do package-lock.json
RUN npm ci

#Para verificar as versões usadas durante o build
RUN node --version && npm --version

# 5. Copia o restante do frontend
COPY . .

# 5.1 next.config.ts resolve os rewrites (proxy /tenants, /users etc. para
# o backend) em tempo de BUILD quando roda em modo produção (next start) —
# por isso precisa entrar como build arg, não só como env de runtime.
ARG BACKEND_INTERNAL_URL=http://backend:8080
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL

# 6. Gera o build de produção
RUN npm run build

# 7. Informa que a aplicação utiliza a porta 3000
EXPOSE 3000

# 8. Inicia o frontend em modo de produção
CMD ["npm", "start"]



# ============================================================
# INSTRUÇÕES PARA EXECUTAR PELO TERMINAL
# ============================================================

# 1. Entre na pasta onde está este Dockerfile:
# cd ~/projetos-tavares/varthex-barber/frontend

# 2. Crie a imagem Docker:
# docker build -t varthex-frontend .

# 3. Verifique se a imagem foi criada:
# docker image ls

# 4. Crie e execute o container em segundo plano:
# docker run -d --name varthex-frontend -p 3000:3000 varthex-frontend

# 5. Acesse o frontend:
# http://localhost:3000

# 6. Verifique os containers em execução:
# docker ps

# 7. Veja os logs do frontend:
# docker logs -f varthex-frontend

# 8. Pare o container:
# docker stop varthex-frontend

# 9. Inicie novamente um container parado:
# docker start varthex-frontend

# 10. Remova o container:
# docker rm -f varthex-frontend

# 11. Remova a imagem:
# docker image rm varthex-frontend

# 12. Para reconstruir após alterar o código:
# docker rm -f varthex-frontend
# docker build -t varthex-frontend .
# docker run -d --name varthex-frontend -p 3000:3000 varthex-frontend