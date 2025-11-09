# 🚀 Predacos - Guia de Configuração Independente

Este guia explica como executar o Ecossistema Predacos de forma **completamente independente**, sem qualquer dependência do Manus AI ou de serviços proprietários.

## 📋 Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Pré-requisitos](#pré-requisitos)
3. [Instalação Rápida com Docker](#instalação-rápida-com-docker)
4. [Instalação Manual](#instalação-manual)
5. [Configuração de IA](#configuração-de-ia)
6. [Auto-Descoberta de APIs](#auto-descoberta-de-apis)
7. [Auto-Evolução](#auto-evolução)
8. [Monitoramento](#monitoramento)
9. [Deploy em Produção](#deploy-em-produção)

## 🏗️ Visão Geral da Arquitetura

O Predacos é construído com uma arquitetura modular e independente:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│              PWA - Funciona Offline                      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   API Gateway (Node.js)                 │
│            tRPC + Express + WebSocket                   │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──┐  ┌──────▼────┐  ┌───▼──────────┐
│   IA     │  │ Discovery │  │ Evolution    │
│ Service  │  │ Service   │  │ Service      │
└──────────┘  └───────────┘  └──────────────┘
        │            │            │
        └────────────┼────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Data & Storage Layer                       │
│  PostgreSQL │ Redis │ MinIO │ Elasticsearch             │
└─────────────────────────────────────────────────────────┘
```

## 📦 Pré-requisitos

### Opção 1: Docker (Recomendado)

- Docker 20.10+
- Docker Compose 2.0+
- 8GB RAM mínimo
- 20GB espaço em disco

### Opção 2: Instalação Manual

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Ollama (para IA local)

## 🐳 Instalação Rápida com Docker

### 1. Clonar repositório

```bash
git clone https://github.com/ecodigiai/predacos-core.git
cd predacos-core
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.independent.example .env
# Editar .env com suas configurações
nano .env
```

### 3. Iniciar stack completo

```bash
# Iniciar todos os serviços
docker-compose -f docker-compose.independent.yml up -d

# Verificar status
docker-compose -f docker-compose.independent.yml ps

# Ver logs
docker-compose -f docker-compose.independent.yml logs -f
```

### 4. Acessar aplicação

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001
- **Grafana:** http://localhost:3000 (admin/admin123)
- **Kibana:** http://localhost:5601
- **MinIO:** http://localhost:9001 (minioadmin/minioadmin123)

## 🔧 Instalação Manual

### 1. Instalar dependências

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Iniciar PostgreSQL

```bash
# Docker
docker run -d \
  --name predacos-postgres \
  -e POSTGRES_PASSWORD=predacos123 \
  -e POSTGRES_DB=predacos \
  -p 5432:5432 \
  postgres:16-alpine

# Ou usar instalação local
psql -U postgres -c "CREATE DATABASE predacos;"
```

### 3. Iniciar Redis

```bash
docker run -d \
  --name predacos-redis \
  -p 6379:6379 \
  redis:7-alpine
```

### 4. Iniciar Ollama (para IA local)

```bash
# Instalar Ollama: https://ollama.ai
ollama serve

# Em outro terminal, baixar modelo
ollama pull mistral
```

### 5. Iniciar backend

```bash
cd backend
npm run dev
```

### 6. Iniciar frontend

```bash
cd frontend
npm run dev
```

## 🧠 Configuração de IA

O Predacos suporta múltiplos provedores de IA com fallback automático:

### Modelo Local (Ollama)

**Vantagens:**
- Totalmente privado
- Sem custos
- Sem limite de requisições
- Funciona offline

**Desvantagens:**
- Requer GPU para melhor performance
- Modelos menores que APIs comerciais

**Instalação:**

```bash
# Instalar Ollama
curl https://ollama.ai/install.sh | sh

# Baixar modelo
ollama pull mistral

# Ou outros modelos
ollama pull llama2
ollama pull neural-chat
```

### APIs Gratuitas (Fallback)

**Groq** - Modelo Mixtral 8x7B
- 30 requisições por minuto
- Obtém em: https://console.groq.com/keys
- Configurar: `GROQ_API_KEY=...`

**Together.ai** - Llama 2 70B
- Sem limite de requisições
- Obtém em: https://www.together.ai/
- Configurar: `TOGETHER_API_KEY=...`

**HuggingFace** - Llama 2 7B
- API gratuita
- Obtém em: https://huggingface.co/settings/tokens
- Configurar: `HF_API_KEY=...`

### Prioridade de Fallback

1. **Ollama** (local) - Prioridade 1
2. **Groq** - Prioridade 2
3. **Together.ai** - Prioridade 3
4. **HuggingFace** - Prioridade 4

Se um provedor falhar, o sistema tenta automaticamente o próximo.

## 🔍 Auto-Descoberta de APIs

O Predacos descobre automaticamente APIs públicas e as integra ao ecossistema:

### Fontes de Descoberta

**GitHub**
- Busca repositórios com APIs
- Requer: `GITHUB_TOKEN`

**RapidAPI**
- Marketplace de APIs
- Requer: `RAPIDAPI_KEY`

**Postman**
- Coleções públicas
- Requer: `POSTMAN_API_KEY`

**OpenAPI Registry**
- Registro de APIs OpenAPI
- Sem autenticação necessária

**Web Crawler**
- Descobre APIs via web
- Sem configuração necessária

### Ativar Descoberta

```bash
# No arquivo de configuração
discovery:
  enabled: true
  apis:
    enabled: true
    sources:
      - type: "github"
        api_key: "${GITHUB_TOKEN}"
      - type: "rapidapi"
        api_key: "${RAPIDAPI_API_KEY}"
```

### Visualizar APIs Descobertas

```bash
# Via API
curl http://localhost:3001/api/discovery/status

# Via Dashboard
# Acesse http://localhost:3000/discovery
```

## 🚀 Auto-Evolução

O Predacos evolui automaticamente analisando métricas e otimizando performance:

### Como Funciona

1. **Coleta de Métricas** - Coleta dados a cada 60 segundos
2. **Análise** - Analisa performance a cada hora
3. **Otimização** - Propõe melhorias automaticamente
4. **Testes A/B** - Testa mudanças com 10% do tráfego
5. **Rollback** - Reverte automaticamente se houver degradação

### Configurar Auto-Evolução

```yaml
evolution:
  enabled: true
  metrics:
    collection_interval: 60
    aggregation_interval: 3600
    retention: "90 days"
  
  optimizations:
    enabled: true
    frequency: "daily"
    max_changes_per_day: 5
  
  ab_testing:
    enabled: true
    traffic_split: 10
    confidence_level: 0.95
  
  rollback:
    enabled: true
    trigger_threshold: 0.95
    auto_revert_delay: 300
```

### Monitorar Evolução

```bash
# Ver histórico de otimizações
curl http://localhost:3001/api/evolution/history

# Ver métricas em tempo real
curl http://localhost:3001/api/metrics/current

# Dashboard
# Acesse http://localhost:3000/evolution
```

## 📊 Monitoramento

O Predacos inclui stack completo de monitoramento:

### Prometheus

Coleta métricas do sistema:

```bash
# Acesso
http://localhost:9090

# Métricas disponíveis
- http_requests_total
- http_request_duration_seconds
- db_query_duration_seconds
- ai_request_duration_seconds
- discovery_apis_count
```

### Grafana

Dashboards visuais:

```bash
# Acesso
http://localhost:3000
# Usuário: admin
# Senha: admin123

# Dashboards pré-configurados
- System Overview
- API Performance
- AI Service Health
- Discovery Status
- Evolution Metrics
```

### Elasticsearch + Kibana

Logs centralizados:

```bash
# Kibana
http://localhost:5601

# Logs disponíveis
- Application logs
- API requests
- AI service logs
- Discovery logs
- Evolution logs
```

## 🌐 Deploy em Produção

### Deploy com Docker Compose

```bash
# Preparar ambiente
export NODE_ENV=production
export JWT_SECRET=$(openssl rand -hex 32)
export POSTGRES_PASSWORD=$(openssl rand -hex 16)

# Iniciar
docker-compose -f docker-compose.independent.yml up -d

# Verificar
docker-compose -f docker-compose.independent.yml ps
```

### Deploy com Kubernetes

```bash
# Preparar secrets
kubectl create secret generic predacos-secrets \
  --from-literal=jwt-secret=$(openssl rand -hex 32) \
  --from-literal=db-password=$(openssl rand -hex 16)

# Deploy
kubectl apply -f k8s/predacos-deployment.yml

# Verificar
kubectl get pods -n predacos
```

### Deploy em Replit (Gratuito)

```bash
# 1. Fork do repositório no GitHub
# 2. Criar novo Replit a partir do repositório
# 3. Configurar variáveis de ambiente
# 4. Executar: npm run start
```

### Deploy em Railway (Gratuito)

```bash
# 1. Conectar repositório GitHub
# 2. Configurar variáveis de ambiente
# 3. Deploy automático
```

### Deploy em Render (Gratuito)

```bash
# 1. Conectar repositório GitHub
# 2. Criar serviço Web
# 3. Configurar build command: npm run build
# 4. Configurar start command: npm run start
```

## 🔐 Segurança

### Checklist de Segurança

- [ ] Alterar senhas padrão em `.env`
- [ ] Gerar novo `JWT_SECRET`
- [ ] Ativar HTTPS em produção
- [ ] Configurar CORS corretamente
- [ ] Ativar autenticação OAuth
- [ ] Configurar rate limiting
- [ ] Ativar audit logging
- [ ] Fazer backup regular do banco de dados
- [ ] Monitorar logs de segurança

### Backup Automático

```bash
# Configurar backup diário
0 2 * * * /scripts/backup-database.sh

# Restaurar de backup
docker exec predacos-postgres pg_restore -U predacos -d predacos /backup/predacos.sql
```

## 📞 Suporte e Comunidade

- **GitHub Issues:** https://github.com/ecodigiai/predacos-core/issues
- **Discussões:** https://github.com/ecodigiai/predacos-core/discussions
- **Email:** predacos@example.com

## 📄 Licença

MIT License - Veja LICENSE.md

## 🙏 Contribuindo

Contribuições são bem-vindas! Veja CONTRIBUTING.md para detalhes.

---

**Desenvolvido com ❤️ para ser completamente independente e auto-suficiente**
