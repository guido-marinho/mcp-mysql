# Guia de Publicação

## 1. Publicar no Docker Hub

### Passo 1: Login no Docker Hub
```bash
docker login
# Digite seu username e password
```

### Passo 2: Escolher nome da imagem
Escolha um nome (recomendo usar seu username do Docker Hub):
```bash
# Exemplo: se seu username é "guidomarinho"
DOCKER_USERNAME="guidomarinho"
IMAGE_NAME="mysql-mcp-server"
```

### Passo 3: Tagear a imagem
```bash
# Tag latest
docker tag mcp/mysql $DOCKER_USERNAME/$IMAGE_NAME:latest

# Tag com versão
docker tag mcp/mysql $DOCKER_USERNAME/$IMAGE_NAME:1.0.0
```

### Passo 4: Push para Docker Hub
```bash
docker push $DOCKER_USERNAME/$IMAGE_NAME:latest
docker push $DOCKER_USERNAME/$IMAGE_NAME:1.0.0
```

### Passo 5: Verificar
Acesse: https://hub.docker.com/r/$DOCKER_USERNAME/$IMAGE_NAME

---

## 2. Atualizar README com sua imagem

Depois de publicar, atualize o README.md substituindo:
- `mcp/mysql` por `$DOCKER_USERNAME/$IMAGE_NAME`

Exemplos no README ficarão:
```bash
docker pull guidomarinho/mysql-mcp-server
docker run -i --rm guidomarinho/mysql-mcp-server mysql://...
```

---

## 3. Preparar para GitHub

### Passo 1: Inicializar Git
```bash
git init
git add .
git commit -m "Initial commit: MySQL MCP Server"
```

### Passo 2: Criar repositório no GitHub
1. Acesse https://github.com/new
2. Nome: `mysql-mcp-server` (ou `db-mcp`)
3. Descrição: "Model Context Protocol server for MySQL databases"
4. Public
5. NÃO inicialize com README (já temos um)
6. Criar repositório

### Passo 3: Conectar e Push
```bash
# Substitua com a URL do seu repo
git remote add origin https://github.com/SEU_USERNAME/mysql-mcp-server.git
git branch -M main
git push -u origin main
```

---

## 4. Opcional: Adicionar Badges ao README

No topo do README.md, adicione:

```markdown
# MySQL MCP Server

[![Docker Pulls](https://img.shields.io/docker/pulls/guidomarinho/mysql-mcp-server)](https://hub.docker.com/r/guidomarinho/mysql-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol server...
```

---

## 5. Checklist Final

Antes de publicar, verifique:

- [ ] README.md está atualizado com o nome correto da imagem Docker
- [ ] Testou localmente e funcionou
- [ ] Imagem Docker publicada no Docker Hub
- [ ] .gitignore está configurado (node_modules, dist, etc)
- [ ] Repositório criado no GitHub
- [ ] Code pushado para o GitHub
- [ ] README tem instruções claras de uso

---

## Comandos Resumidos

```bash
# 1. Publicar Docker
docker login
docker tag mcp/mysql guidomarinho/mysql-mcp-server:latest
docker push guidomarinho/mysql-mcp-server:latest

# 2. Git
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/guidomarinho/mysql-mcp-server.git
git push -u origin main
```

Pronto! Seu MCP está publicado e disponível para uso! 🎉
