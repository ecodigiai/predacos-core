# 🧠 Guia de Configuração do Ollama - Modelos de IA Locais

Este guia explica como configurar o Ollama para executar modelos de IA localmente no Predacos, permitindo processamento de linguagem natural completamente privado e sem custos.

## 📋 O que é Ollama?

**Ollama** é uma ferramenta que permite executar modelos de linguagem grandes (LLMs) localmente em sua máquina. Oferece:

- ✅ **Privacidade Total** - Seus dados nunca saem da sua máquina
- ✅ **Sem Custos** - Sem limites de API ou taxas de uso
- ✅ **Offline** - Funciona sem conexão com a internet
- ✅ **Rápido** - Resposta em tempo real com GPU
- ✅ **Customizável** - Crie modelos personalizados

## 🚀 Instalação

### Windows

1. Baixar Ollama: https://ollama.ai/download/windows
2. Executar instalador
3. Ollama iniciará automaticamente
4. Verificar em: http://localhost:11434

### macOS

```bash
# Instalar via Homebrew
brew install ollama

# Ou baixar diretamente
# https://ollama.ai/download/mac
```

### Linux

```bash
# Instalar script oficial
curl https://ollama.ai/install.sh | sh

# Ou via Docker (recomendado)
docker run -d --name ollama -p 11434:11434 ollama/ollama
```

### Docker (Qualquer SO)

```bash
# Com CPU
docker run -d \
  --name ollama \
  -p 11434:11434 \
  ollama/ollama

# Com GPU NVIDIA
docker run -d \
  --name ollama \
  --gpus all \
  -p 11434:11434 \
  ollama/ollama

# Com GPU AMD
docker run -d \
  --name ollama \
  --device /dev/kfd \
  --device /dev/dri \
  -p 11434:11434 \
  ollama/ollama
```

## 📥 Baixar Modelos

### Modelos Recomendados

**Para Produção (Rápido e Eficiente)**

```bash
# Mistral 7B - Melhor custo-benefício
ollama pull mistral

# Neural Chat 7B - Otimizado para chat
ollama pull neural-chat

# Starling LM 7B - Bom para instruções
ollama pull starling-lm
```

**Para Máquinas Potentes (Melhor Qualidade)**

```bash
# Llama 2 13B - Modelo maior e mais preciso
ollama pull llama2:13b

# Llama 2 70B - Modelo gigante (requer 48GB RAM)
ollama pull llama2:70b

# Mixtral 8x7B - Modelo de mistura (requer 48GB RAM)
ollama pull mixtral
```

**Para Máquinas Fracas (Rápido)**

```bash
# Phi 2.7B - Muito rápido
ollama pull phi

# TinyLlama 1.1B - Menor modelo
ollama pull tinyllama

# Orca Mini 3B - Compacto
ollama pull orca-mini
```

### Listar Modelos Disponíveis

```bash
# Ver todos os modelos
ollama list

# Exemplo de saída
# NAME              ID              SIZE    MODIFIED
# mistral:latest    2ae4d5fa4d0b    4.1 GB  2 hours ago
# neural-chat:latest 42182419e3e1   4.1 GB  1 day ago
```

### Remover Modelos

```bash
ollama rm mistral
```

## 🔧 Configuração no Predacos

### 1. Variáveis de Ambiente

```bash
# .env
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=mistral
```

### 2. Arquivo de Configuração

```yaml
# config/independent-setup.yml
ai:
  primary:
    type: "ollama"
    model: "mistral"
    endpoint: "http://localhost:11434"
    temperature: 0.7
    max_tokens: 2048
```

### 3. Testar Conexão

```bash
# Verificar se Ollama está rodando
curl http://localhost:11434/api/tags

# Exemplo de resposta
# {"models":[{"name":"mistral:latest","modified_at":"2024-01-15T10:30:00Z","size":4100000000}]}
```

## 💬 Usar Ollama via API

### Requisição Simples

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "mistral",
  "prompt": "Qual é a capital da França?",
  "stream": false
}'
```

### Chat Interativo

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "mistral",
  "messages": [
    {
      "role": "user",
      "content": "Olá! Como você está?"
    }
  ],
  "stream": false
}'
```

### Com Streaming (Tempo Real)

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "mistral",
  "prompt": "Escreva um poema sobre IA",
  "stream": true
}'
```

## 📊 Performance e Otimização

### Requisitos de Hardware

| Modelo | RAM Mínimo | GPU Recomendada | Velocidade |
|--------|-----------|-----------------|-----------|
| TinyLlama 1.1B | 2GB | Nenhuma | Muito Rápido |
| Phi 2.7B | 4GB | Nenhuma | Rápido |
| Neural Chat 7B | 8GB | 4GB VRAM | Médio |
| Mistral 7B | 8GB | 4GB VRAM | Médio |
| Llama 2 13B | 16GB | 8GB VRAM | Lento |
| Llama 2 70B | 48GB | 24GB VRAM | Muito Lento |

### Otimizar Performance

**Usar GPU**

```bash
# NVIDIA CUDA
docker run -d \
  --name ollama \
  --gpus all \
  -p 11434:11434 \
  ollama/ollama

# AMD ROCm
docker run -d \
  --name ollama \
  --device /dev/kfd \
  --device /dev/dri \
  -p 11434:11434 \
  ollama/ollama
```

**Aumentar Contexto**

```bash
# Aumentar tamanho do contexto (mais memória)
curl http://localhost:11434/api/generate -d '{
  "model": "mistral",
  "prompt": "...",
  "context": 2048
}'
```

**Reduzir Temperatura** (Respostas mais determinísticas)

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "mistral",
  "prompt": "...",
  "options": {
    "temperature": 0.1
  }
}'
```

## 🔄 Comparação de Modelos

### Mistral 7B (Recomendado)

**Vantagens:**
- Excelente custo-benefício
- Rápido e eficiente
- Bom para chat e instruções
- 4GB VRAM

**Desvantagens:**
- Menos preciso que Llama 2 13B
- Contexto limitado

**Casos de Uso:**
- Chat interativo
- Geração de código
- Resumos

### Llama 2 7B

**Vantagens:**
- Modelo open-source confiável
- Bom para instruções
- Comunidade grande

**Desvantagens:**
- Mais lento que Mistral
- Menos criativo

**Casos de Uso:**
- Tarefas estruturadas
- Análise de texto

### Llama 2 13B

**Vantagens:**
- Muito mais preciso
- Melhor para raciocínio
- Melhor para código

**Desvantagens:**
- Requer 16GB RAM
- Mais lento

**Casos de Uso:**
- Análise complexa
- Geração de código avançado

### Mixtral 8x7B

**Vantagens:**
- Modelo de mistura (8 especialistas)
- Muito inteligente
- Bom para múltiplas tarefas

**Desvantagens:**
- Requer 48GB RAM
- Muito lento

**Casos de Uso:**
- Tarefas muito complexas
- Pesquisa

## 🎯 Dicas Práticas

### 1. Usar Modelo Certo para Tarefa

```javascript
// Para chat rápido
const model = "mistral";

// Para análise profunda
const model = "llama2:13b";

// Para máquinas fracas
const model = "phi";
```

### 2. Cache de Respostas

```javascript
// Armazenar respostas em cache
const cache = new Map();

async function getResponse(prompt) {
  const key = hash(prompt);
  
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const response = await ollama.generate(prompt);
  cache.set(key, response);
  return response;
}
```

### 3. Batch Processing

```javascript
// Processar múltiplas requisições em paralelo
const prompts = ["...", "...", "..."];
const responses = await Promise.all(
  prompts.map(p => ollama.generate(p))
);
```

### 4. Monitorar Recursos

```bash
# Ver uso de memória e GPU
watch -n 1 nvidia-smi

# Ver logs do Ollama
docker logs -f ollama
```

## 🚨 Troubleshooting

### Ollama não conecta

```bash
# Verificar se está rodando
curl http://localhost:11434/api/tags

# Se não funcionar, reiniciar
docker restart ollama

# Ou verificar logs
docker logs ollama
```

### Modelo muito lento

```bash
# Usar modelo menor
ollama pull mistral

# Ou reduzir contexto
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "...",
  "context": 512
}'
```

### Memória insuficiente

```bash
# Usar modelo menor
ollama pull phi

# Ou aumentar swap
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### GPU não está sendo usada

```bash
# Verificar drivers
nvidia-smi

# Reinstalar Ollama com suporte a GPU
docker run -d \
  --name ollama \
  --gpus all \
  -p 11434:11434 \
  ollama/ollama
```

## 📚 Recursos Adicionais

- **Site Oficial:** https://ollama.ai
- **Modelos Disponíveis:** https://ollama.ai/library
- **GitHub:** https://github.com/jmorganca/ollama
- **Documentação API:** https://github.com/jmorganca/ollama/blob/main/docs/api.md

## 🎓 Próximos Passos

1. **Instalar Ollama** - Seguir instruções acima
2. **Baixar Modelo** - Começar com `mistral`
3. **Testar API** - Fazer requisições curl
4. **Integrar ao Predacos** - Configurar variáveis de ambiente
5. **Otimizar** - Ajustar temperatura e contexto
6. **Monitorar** - Acompanhar performance

---

**Desenvolvido para máxima privacidade e independência!**
