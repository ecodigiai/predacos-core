# 📚 Documentação Completa - Predacos Ecossistema Digital Vivo

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Componentes Principais](#componentes-principais)
4. [Instalação e Setup](#instalação-e-setup)
5. [Configuração](#configuração)
6. [Uso e Operação](#uso-e-operação)
7. [Auto-Evolução](#auto-evolução)
8. [Monitoramento](#monitoramento)
9. [Troubleshooting](#troubleshooting)
10. [Contribuindo](#contribuindo)

---

## 🎯 Visão Geral

**Predacos** é um **Ecossistema Digital Vivo** completamente independente e auto-suficiente que funciona como um assistente de IA inteligente tipo Jarvis. O sistema:

- ✅ **Não depende de serviços externos** - Totalmente independente do Manus AI ou qualquer outro provedor
- ✅ **Funciona offline** - Continua operacional sem conexão com a internet
- ✅ **Evolui automaticamente** - Aprende e otimiza continuamente sem intervenção humana
- ✅ **Descobre recursos autonomamente** - Encontra e integra novas APIs e ferramentas
- ✅ **Armazena dados distribuídos** - Replicação P2P para máxima resiliência
- ✅ **Privacidade total** - Seus dados nunca saem da sua infraestrutura

### Casos de Uso

- 🤖 Assistente de IA pessoal
- 🏢 Automação empresarial
- 📱 Aplicativos mobile inteligentes
- 🔬 Pesquisa e desenvolvimento
- 📊 Análise de dados
- 🌐 Plataformas web escaláveis

---

## 🏗️ Arquitetura do Sistema

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                   CAMADA DE APRESENTAÇÃO                    │
│  Frontend PWA (React 19) | Offline-First | Sync Automático  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   CAMADA DE API                             │
│  Express.js | tRPC | WebSocket | REST | GraphQL            │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌──────▼────────┐  ┌───▼──────────────┐
│   IA Service │  │  Discovery    │  │  Evolution       │
│              │  │  Service      │  │  Service         │
│ • Ollama     │  │               │  │                  │
│ • Groq       │  │ • GitHub      │  │ • Análise        │
│ • Together   │  │ • RapidAPI    │  │ • Otimização     │
│ • HuggingFace│  │ • Postman     │  │ • Testes A/B     │
│ • LLaMA      │  │ • OpenAPI     │  │ • Rollback       │
└──────────────┘  └───────────────┘  └──────────────────┘
        │                │                │
┌───────▼────────────────▼────────────────▼────────────────┐
│              CAMADA DE DADOS                             │
│  PostgreSQL │ Redis │ MinIO │ Elasticsearch              │
└───────┬────────────────────────────────────────────────┬─┘
        │                                                │
┌───────▼────────────────────────────────────────────────▼─┐
│         CAMADA DE ARMAZENAMENTO DISTRIBUÍDO              │
│  Replicação P2P │ Backup │ Sincronização │ Resiliência  │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

```
Usuário
  │
  ▼
Frontend PWA (React)
  │
  ├─ Offline: IndexedDB + Service Worker
  │
  ▼
API Gateway (Express/tRPC)
  │
  ├─ Autenticação (JWT)
  ├─ Rate Limiting
  ├─ Validação
  │
  ▼
Serviços Especializados
  │
  ├─ IA Service → Ollama/APIs
  ├─ Discovery Service → APIs Públicas
  ├─ Evolution Service → Otimizações
  ├─ Storage Service → Dados Distribuídos
  │
  ▼
Banco de Dados
  │
  ├─ PostgreSQL (dados estruturados)
  ├─ Redis (cache/sessões)
  ├─ MinIO (arquivos)
  ├─ Elasticsearch (logs)
  │
  ▼
Armazenamento Distribuído P2P
  │
  └─ Replicação automática
```

---

## 🔧 Componentes Principais

### 1. Serviço de IA (independent-ai-service.ts)

**Responsabilidade:** Processar linguagem natural e gerar respostas inteligentes

**Provedores Suportados:**
- Ollama (local) - Prioridade 1
- Groq (API gratuita) - Prioridade 2
- Together.ai (API gratuita) - Prioridade 3
- HuggingFace (API gratuita) - Prioridade 4

**Recursos:**
- Fallback automático entre provedores
- Cache inteligente de respostas
- Verificação de saúde periódica
- Suporte a streaming
- Contexto persistente

**Exemplo de Uso:**
```typescript
const response = await aiService.process({
  messages: [
    { role: 'user', content: 'Crie um app de lista de tarefas' }
  ],
  maxTokens: 2048,
  temperature: 0.7
});
```

### 2. Serviço de Descoberta (api-discovery-service.ts)

**Responsabilidade:** Descobrir e integrar APIs públicas automaticamente

**Fontes de Descoberta:**
- GitHub (repositórios com APIs)
- RapidAPI (marketplace)
- Postman (coleções)
- OpenAPI Registry
- Web Crawler

**Recursos:**
- Descoberta automática periódica
- Validação de APIs
- Categorização automática
- Atualização de status
- Integração ao ecossistema

**Exemplo de Uso:**
```typescript
discoveryService.startAutoDiscovery(24); // A cada 24 horas

const activeAPIs = discoveryService.getActiveAPIs();
const stats = discoveryService.getStats();
```

### 3. Serviço de Armazenamento (distributed-storage-service.ts)

**Responsabilidade:** Armazenar dados de forma distribuída e resiliente

**Recursos:**
- Replicação P2P automática
- Backup e restauração
- Verificação de saúde dos nós
- Cache local
- Sincronização automática

**Exemplo de Uso:**
```typescript
const file = await storageService.storeFile(
  'documento.pdf',
  fileBuffer,
  'application/pdf',
  { userId: '123', tags: ['importante'] }
);

const content = await storageService.getFile(file.id);
```

### 4. Serviço de Auto-Evolução (auto-evolution-service.ts)

**Responsabilidade:** Analisar métricas e otimizar o sistema automaticamente

**Recursos:**
- Coleta contínua de métricas
- Análise de tendências
- Propostas de otimização
- Testes A/B automatizados
- Rollback automático

**Exemplo de Uso:**
```typescript
evolutionService.recordMetric('api_response_time', 350);

const proposals = evolutionService.getProposals('proposed');
const stats = evolutionService.getStats();
```

---

## 📦 Instalação e Setup

### Opção 1: Docker Compose (Recomendado)

```bash
# 1. Clonar repositório
git clone https://github.com/ecodigiai/predacos-core.git
cd predacos-core

# 2. Configurar ambiente
cp .env.independent.example .env
nano .env  # Editar variáveis

# 3. Iniciar stack
docker-compose -f docker-compose.independent.yml up -d

# 4. Verificar status
docker-compose -f docker-compose.independent.yml ps

# 5. Acessar
# Frontend: http://localhost:3000
# API: http://localhost:3001
# Grafana: http://localhost:3000
# Kibana: http://localhost:5601
```

### Opção 2: Instalação Manual

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar PostgreSQL
docker run -d --name postgres -e POSTGRES_PASSWORD=predacos123 -p 5432:5432 postgres:16

# 3. Iniciar Redis
docker run -d --name redis -p 6379:6379 redis:7

# 4. Iniciar Ollama
ollama serve

# 5. Em outro terminal, baixar modelo
ollama pull mistral

# 6. Iniciar aplicação
npm run dev
```

### Opção 3: Replit (Gratuito)

1. Fork do repositório no GitHub
2. Criar novo Replit a partir do repositório
3. Configurar variáveis de ambiente
4. Executar `npm run start`

### Opção 4: Railway (Gratuito)

1. Conectar repositório GitHub
2. Criar novo projeto
3. Configurar variáveis de ambiente
4. Deploy automático

---

## ⚙️ Configuração

### Variáveis de Ambiente

```bash
# Banco de dados
DATABASE_URL=postgresql://user:pass@localhost:5432/predacos

# Redis
REDIS_URL=redis://localhost:6379

# Ollama
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=mistral

# APIs de IA (fallback)
GROQ_API_KEY=...
TOGETHER_API_KEY=...
HF_API_KEY=...

# Autenticação
JWT_SECRET=seu-secret-aqui
JWT_EXPIRATION=86400

# OAuth
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Auto-descoberta
RAPIDAPI_KEY=...
POSTMAN_API_KEY=...
GITHUB_TOKEN=...

# Aplicação
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Arquivo de Configuração YAML

```yaml
# config/independent-setup.yml
ai:
  primary:
    type: "ollama"
    model: "mistral"
    endpoint: "http://localhost:11434"
    temperature: 0.7
    maxTokens: 2048
  
  fallback:
    - type: "groq"
      apiKey: "${GROQ_API_KEY}"
    - type: "together"
      apiKey: "${TOGETHER_API_KEY}"

discovery:
  enabled: true
  interval: 86400  # 24 horas
  sources:
    - type: "github"
      enabled: true
    - type: "rapidapi"
      enabled: true
    - type: "postman"
      enabled: true

evolution:
  enabled: true
  metricsInterval: 60
  analysisInterval: 3600
  maxProposalsPerDay: 5
  abTesting:
    enabled: true
    trafficSplit: 10
    confidenceLevel: 0.95
```

---

## 🚀 Uso e Operação

### Interface Web

1. **Abrir aplicação:** http://localhost:3000
2. **Login:** Usar OAuth (GitHub/Google) ou email/senha
3. **Chat:** Digitar comandos em português
4. **Dashboard:** Ver métricas e status
5. **Notificações:** Acompanhar eventos

### API REST

```bash
# Enviar comando
curl -X POST http://localhost:3001/api/commands \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "command": "Crie um app de lista de tarefas",
    "context": {}
  }'

# Listar notificações
curl http://localhost:3001/api/notificacoes \
  -H "Authorization: Bearer TOKEN"

# Ver status do sistema
curl http://localhost:3001/api/health
```

### CLI

```bash
# Ver status dos serviços
docker-compose -f docker-compose.independent.yml ps

# Ver logs
docker-compose -f docker-compose.independent.yml logs -f api

# Executar comando
npm run cli -- "Crie um relatório de vendas"

# Backup
npm run backup

# Restaurar
npm run restore -- /path/to/backup
```

---

## 🧠 Auto-Evolução

### Como Funciona

1. **Coleta (60s):** Sistema coleta métricas continuamente
2. **Agregação (1h):** Agrega e analisa dados
3. **Propostas:** Gera propostas de otimização
4. **Testes A/B:** Testa mudanças com 10% do tráfego
5. **Decisão:** Aprova ou rejeita baseado em resultados
6. **Implementação:** Aplica mudanças aprovadas
7. **Monitoramento:** Monitora impacto
8. **Rollback:** Reverte automaticamente se houver degradação

### Métricas Monitoradas

- Response time da API
- Taxa de erro
- Cache hit rate
- Uso de memória
- Uso de CPU
- Throughput
- Latência do banco de dados
- Taxa de sucesso de IA

### Propostas Automáticas

- Aumentar cache
- Adicionar índices no banco de dados
- Otimizar queries
- Ajustar parâmetros de IA
- Escalar serviços
- Limpar dados antigos

---

## 📊 Monitoramento

### Prometheus

Acesso: http://localhost:9090

Métricas disponíveis:
- `http_requests_total` - Total de requisições
- `http_request_duration_seconds` - Duração das requisições
- `db_query_duration_seconds` - Duração das queries
- `ai_request_duration_seconds` - Duração das requisições de IA
- `discovery_apis_count` - Quantidade de APIs descobertas

### Grafana

Acesso: http://localhost:3000 (admin/admin123)

Dashboards pré-configurados:
- System Overview
- API Performance
- AI Service Health
- Discovery Status
- Evolution Metrics

### Elasticsearch + Kibana

Acesso: http://localhost:5601

Índices de logs:
- `app-logs` - Logs da aplicação
- `api-logs` - Logs de API
- `ai-logs` - Logs de IA
- `discovery-logs` - Logs de descoberta
- `evolution-logs` - Logs de evolução

---

## 🔧 Troubleshooting

### Problema: Ollama não conecta

**Solução:**
```bash
# Verificar se está rodando
curl http://localhost:11434/api/tags

# Reiniciar
docker restart ollama

# Ou iniciar manualmente
ollama serve
```

### Problema: Banco de dados offline

**Solução:**
```bash
# Verificar status
docker-compose ps

# Reiniciar
docker-compose restart postgres

# Verificar conexão
psql -h localhost -U predacos -d predacos
```

### Problema: Alto uso de memória

**Solução:**
```bash
# Aumentar limite do Node.js
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

# Ou no Docker
docker-compose up -d --build
```

### Problema: APIs descobertas não funcionam

**Solução:**
```bash
# Verificar status das APIs
curl http://localhost:3001/api/discovery/status

# Limpar cache
curl -X POST http://localhost:3001/api/discovery/clear-cache

# Forçar redescoberta
curl -X POST http://localhost:3001/api/discovery/rediscover
```

---

## 🤝 Contribuindo

### Reportar Bugs

1. Abrir issue no GitHub
2. Descrever o problema
3. Incluir logs relevantes
4. Fornecer passos para reproduzir

### Sugerir Melhorias

1. Abrir discussion no GitHub
2. Descrever a ideia
3. Explicar benefícios
4. Fornecer exemplos

### Contribuir Código

1. Fork do repositório
2. Criar branch: `git checkout -b feature/minha-feature`
3. Commit: `git commit -am 'Add feature'`
4. Push: `git push origin feature/minha-feature`
5. Abrir Pull Request

---

## 📞 Suporte

- **GitHub Issues:** https://github.com/ecodigiai/predacos-core/issues
- **Discussions:** https://github.com/ecodigiai/predacos-core/discussions
- **Email:** predacos@example.com

---

## 📄 Licença

MIT License - Veja LICENSE.md

---

## 🙏 Agradecimentos

Desenvolvido com ❤️ para ser completamente independente e auto-suficiente.

Obrigado a todos os contribuidores e à comunidade open-source!

---

**Versão:** 1.0.0  
**Última atualização:** 2024  
**Status:** Production Ready
