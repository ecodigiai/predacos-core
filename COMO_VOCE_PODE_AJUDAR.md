# 🤝 Como Você Pode Ajudar o Predacos a Evoluir

**Seu Nome:** ecodigiai  
**Seus Recursos:** Internet, Smartphone, Notebook  
**Seu Objetivo:** Tornar Predacos independente e poderoso  

---

## 📱 USANDO SEU SMARTPHONE

### 1. Acessar Predacos via Telegram (MAIS FÁCIL)

**Passo 1: Criar Bot no Telegram**
```
1. Abra Telegram
2. Procure por @BotFather
3. Digite /newbot
4. Escolha um nome: "Predacos Bot"
5. Escolha um username: "predacos_bot"
6. Copie o token (ex: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11)
```

**Passo 2: Configurar no Predacos**
```bash
# No seu notebook
cd /home/ubuntu/predacos-core

# Editar .env
echo "TELEGRAM_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" >> .env

# Instalar dependência
npm install node-telegram-bot-api

# Iniciar bot
npm run bot:telegram
```

**Passo 3: Usar no Smartphone**
```
1. Abra Telegram
2. Procure por @predacos_bot
3. Digite: /predacos criar app de tarefas
4. Receba resposta do Predacos!
```

**Benefício:** ✅ Usar Predacos do bolso  
**Tempo:** 15-20 minutos  
**Custo:** Gratuito  

---

### 2. Instalar PWA no Smartphone

**Passo 1: Abrir no Navegador**
```
1. Abra Chrome/Firefox no smartphone
2. Digite: http://seu-dominio.com (ou IP local)
3. Aguarde carregar
```

**Passo 2: Instalar como App**
```
1. Menu (três pontos) → Instalar app
2. Ou: Menu → Adicionar à tela inicial
3. Escolha um nome
4. Clique em Instalar
```

**Passo 3: Usar como App**
```
1. Ícone aparece na tela inicial
2. Clique para abrir
3. Funciona como app nativo
4. Funciona offline!
```

**Benefício:** ✅ App sem instalar  
**Tempo:** 5 minutos  
**Custo:** Gratuito  

---

### 3. Testar Predacos Mobile

**Quando app React Native estiver pronto:**

```bash
# No notebook
cd predacos-mobile
npm install
npx expo start

# No smartphone
1. Instale Expo Go (App Store ou Google Play)
2. Abra Expo Go
3. Scannear QR code
4. Teste o app
5. Dê feedback!
```

**Benefício:** ✅ Feedback em tempo real  
**Tempo:** 10 minutos  
**Custo:** Gratuito  

---

## 💻 USANDO SEU NOTEBOOK

### 1. Instalar Ollama (IA Local - CRÍTICO)

**Passo 1: Instalar Ollama**
```bash
# macOS
brew install ollama

# Linux
curl https://ollama.ai/install.sh | sh

# Windows
# Baixar em https://ollama.ai/download
```

**Passo 2: Iniciar Servidor**
```bash
# Terminal 1: Iniciar Ollama
ollama serve

# Saída esperada:
# Listening on 127.0.0.1:11434
```

**Passo 3: Baixar Modelos**
```bash
# Terminal 2: Baixar modelos (enquanto Ollama roda)

# Modelo rápido (2.7GB)
ollama pull mistral

# Modelo conversacional (4GB)
ollama pull neural-chat

# Modelo poderoso (26GB - opcional)
ollama pull dolphin-mixtral
```

**Passo 4: Testar Localmente**
```bash
# Terminal 3: Testar
curl http://localhost:11434/api/generate -d '{
  "model": "mistral",
  "prompt": "Olá, como você está?"
}'

# Resposta esperada:
# Olá! Estou bem, obrigado por perguntar...
```

**Passo 5: Integrar ao Predacos**
```bash
# Editar .env
echo "OLLAMA_ENDPOINT=http://localhost:11434" >> /home/ubuntu/predacos-core/.env
echo "OLLAMA_MODEL=mistral" >> /home/ubuntu/predacos-core/.env

# Reiniciar Predacos
cd /home/ubuntu/predacos-core
npm run dev
```

**Passo 6: Testar Integração**
```bash
# Abrir navegador
http://localhost:3000

# Digitar comando
"Crie um app de lista de tarefas"

# Predacos deve responder usando Ollama local!
```

**Benefício:** ✅ IA offline, sem custos, privacidade total  
**Tempo:** 1-2 horas (download depende da internet)  
**Custo:** Gratuito  
**Requisitos:** 8GB RAM, 10GB disco, internet (download)  

---

### 2. Criar Integrações com Slack

**Passo 1: Criar Slack Workspace**
```
1. Abra https://slack.com/create
2. Digite seu email
3. Crie workspace
4. Escolha um nome (ex: "Predacos")
5. Confirme email
```

**Passo 2: Criar Bot Slack**
```
1. Vá para https://api.slack.com/apps
2. Clique "Create New App"
3. Escolha "From scratch"
4. Nome: "Predacos"
5. Workspace: seu workspace
6. Clique "Create App"
```

**Passo 3: Configurar Permissões**
```
1. Vá para "OAuth & Permissions"
2. Scopes → Bot Token Scopes
3. Adicione:
   - chat:write
   - commands
   - app_mentions:read
4. Clique "Install to Workspace"
5. Copie "Bot User OAuth Token" (começa com xoxb-)
```

**Passo 4: Criar Comando Slash**
```
1. Vá para "Slash Commands"
2. Clique "Create New Command"
3. Command: /predacos
4. Request URL: http://seu-dominio.com/slack/commands
5. Short Description: "Executar comando Predacos"
6. Salve
```

**Passo 5: Integrar ao Predacos**
```bash
# Editar .env
echo "SLACK_BOT_TOKEN=xoxb-..." >> /home/ubuntu/predacos-core/.env
echo "SLACK_SIGNING_SECRET=..." >> /home/ubuntu/predacos-core/.env

# Instalar dependência
npm install @slack/bolt

# Criar arquivo
cat > /home/ubuntu/predacos-core/services/integrations/slack-bot.ts << 'EOF'
import { App } from '@slack/bolt';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.command('/predacos', async ({ command, ack, respond }) => {
  await ack();
  const result = await predacos.executeCommand(command.text);
  await respond(result);
});

app.start(3001);
EOF

# Iniciar
npm run bot:slack
```

**Passo 6: Testar no Slack**
```
1. Abra seu workspace Slack
2. Digite: /predacos criar app de tarefas
3. Predacos responde no Slack!
```

**Benefício:** ✅ Usar Predacos do Slack  
**Tempo:** 30-45 minutos  
**Custo:** Gratuito (Slack workspace)  

---

### 3. Criar Integrações com Discord

**Passo 1: Criar Discord Server**
```
1. Abra https://discord.com
2. Clique "+" para criar servidor
3. Nome: "Predacos"
4. Crie servidor
```

**Passo 2: Criar Bot Discord**
```
1. Vá para https://discord.com/developers/applications
2. Clique "New Application"
3. Nome: "Predacos"
4. Vá para "Bot"
5. Clique "Add Bot"
6. Copie o token
```

**Passo 3: Configurar Permissões**
```
1. Vá para "OAuth2" → "URL Generator"
2. Scopes: bot
3. Permissions:
   - Send Messages
   - Read Messages
   - Read Message History
4. Copie URL gerada
5. Abra URL para adicionar bot ao servidor
```

**Passo 4: Integrar ao Predacos**
```bash
# Editar .env
echo "DISCORD_TOKEN=..." >> /home/ubuntu/predacos-core/.env

# Instalar dependência
npm install discord.js

# Criar arquivo
cat > /home/ubuntu/predacos-core/services/integrations/discord-bot.ts << 'EOF'
import { Client, Events, GatewayIntentBits } from 'discord.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith('!predacos')) {
    const command = message.content.slice(9);
    const result = await predacos.executeCommand(command);
    await message.reply(result);
  }
});

client.login(process.env.DISCORD_TOKEN);
EOF

# Iniciar
npm run bot:discord
```

**Passo 5: Testar no Discord**
```
1. Abra seu servidor Discord
2. Digite: !predacos criar app de tarefas
3. Bot responde!
```

**Benefício:** ✅ Usar Predacos do Discord  
**Tempo:** 30-45 minutos  
**Custo:** Gratuito  

---

### 4. Implementar Autenticação JWT

**Passo 1: Gerar Secrets**
```bash
# Gerar JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copiar output e adicionar ao .env
echo "JWT_SECRET=..." >> /home/ubuntu/predacos-core/.env
echo "REFRESH_SECRET=..." >> /home/ubuntu/predacos-core/.env
```

**Passo 2: Criar Serviço de Autenticação**
```bash
cat > /home/ubuntu/predacos-core/services/auth/jwt-auth.ts << 'EOF'
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string): string {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId },
    process.env.REFRESH_SECRET!,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    return null;
  }
}
EOF

# Instalar dependências
npm install jsonwebtoken bcrypt
npm install --save-dev @types/jsonwebtoken
```

**Passo 3: Criar Endpoints de Autenticação**
```bash
cat > /home/ubuntu/predacos-core/server/auth-routes.ts << 'EOF'
import express from 'express';
import { hashPassword, verifyPassword, generateToken } from '../services/auth/jwt-auth';

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  
  // Validar
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  
  // Hash password
  const hash = await hashPassword(password);
  
  // Salvar no banco
  const user = await db.users.create({ email, password: hash });
  
  // Gerar token
  const token = generateToken(user.id);
  
  res.json({ token, user });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Encontrar usuário
  const user = await db.users.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Email ou senha incorretos' });
  }
  
  // Verificar senha
  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Email ou senha incorretos' });
  }
  
  // Gerar token
  const token = generateToken(user.id);
  
  res.json({ token, user });
});

export default router;
EOF
```

**Passo 4: Atualizar Frontend**
```bash
# Editar client/src/pages/Login.tsx
# Adicionar form de login/registro
# Usar JWT em vez de OAuth
```

**Benefício:** ✅ Autenticação independente  
**Tempo:** 2-3 horas  
**Custo:** Gratuito  

---

### 5. Implementar Auto-Patcher

**Passo 1: Criar Sistema de Patches**
```bash
cat > /home/ubuntu/predacos-core/services/evolution/auto-patcher.ts << 'EOF'
import { spawn } from 'child_process';
import * as fs from 'fs';

export class AutoPatcher {
  async applyOptimization(optimization: any) {
    console.log(`Aplicando otimização: ${optimization.name}`);
    
    // 1. Criar branch
    await this.runCommand('git', ['checkout', '-b', `opt-${optimization.id}`]);
    
    // 2. Aplicar mudança
    await this.applyChange(optimization);
    
    // 3. Testar
    const testResult = await this.runCommand('npm', ['run', 'test']);
    
    // 4. Se passou, fazer merge
    if (testResult.exitCode === 0) {
      await this.runCommand('git', ['add', '.']);
      await this.runCommand('git', ['commit', '-m', `opt: ${optimization.name}`]);
      await this.runCommand('git', ['checkout', 'master']);
      await this.runCommand('git', ['merge', `opt-${optimization.id}`]);
      await this.runCommand('git', ['push']);
      console.log('✅ Otimização aplicada com sucesso!');
    } else {
      // 5. Se falhou, rollback
      await this.runCommand('git', ['checkout', 'master']);
      await this.runCommand('git', ['branch', '-D', `opt-${optimization.id}`]);
      console.log('❌ Testes falharam, rollback realizado');
    }
  }
  
  private async runCommand(cmd: string, args: string[]): Promise<any> {
    return new Promise((resolve) => {
      const process = spawn(cmd, args);
      process.on('close', (code) => {
        resolve({ exitCode: code });
      });
    });
  }
  
  private async applyChange(optimization: any) {
    // Implementar mudança específica
    // Exemplo: aumentar cache
    if (optimization.type === 'increase-cache') {
      const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
      config.cache.ttl = optimization.newValue;
      fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
    }
  }
}
EOF

# Instalar dependências
npm install child_process
```

**Passo 2: Integrar ao Serviço de Evolução**
```bash
# Editar services/evolution/auto-evolution-service.ts
# Adicionar chamada a AutoPatcher
# Executar quando houver propostas aprovadas
```

**Benefício:** ✅ Evolução real e automática  
**Tempo:** 4-6 horas  
**Custo:** Gratuito  

---

### 6. Instalar Whisper (Áudio)

**Passo 1: Instalar Whisper**
```bash
# Instalar Python (se não tiver)
# macOS: brew install python3
# Linux: sudo apt install python3
# Windows: https://www.python.org/downloads/

# Instalar Whisper
pip install openai-whisper

# Testar
whisper --help
```

**Passo 2: Testar com Áudio**
```bash
# Baixar áudio de teste
curl -o test.mp3 "https://example.com/test.mp3"

# Transcrever
whisper test.mp3 --language pt

# Resultado: test.txt com transcrição
```

**Passo 3: Integrar ao Predacos**
```bash
cat > /home/ubuntu/predacos-core/services/ai/whisper-service.ts << 'EOF'
import { spawn } from 'child_process';
import * as fs from 'fs';

export async function transcribeAudio(audioPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const whisper = spawn('whisper', [
      audioPath,
      '--language', 'pt',
      '--output_format', 'json',
      '--output_dir', '/tmp'
    ]);
    
    whisper.on('close', (code) => {
      if (code === 0) {
        const jsonPath = audioPath.replace(/\.[^.]+$/, '.json');
        const result = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        resolve(result.text);
      } else {
        reject(new Error('Whisper failed'));
      }
    });
  });
}
EOF

# Instalar dependência
npm install child_process
```

**Passo 4: Usar no Predacos**
```bash
# Adicionar endpoint para upload de áudio
# POST /api/transcribe
# Recebe: arquivo de áudio
# Retorna: transcrição

# Usar em comandos de voz
# "Olá Predacos" → transcrição → processamento
```

**Benefício:** ✅ Processar áudio  
**Tempo:** 1-2 horas  
**Custo:** Gratuito  
**Requisitos:** Python, 2GB RAM  

---

### 7. Instalar CLIP (Visão)

**Passo 1: Instalar CLIP**
```bash
# Instalar dependências
pip install clip-torch torch torchvision

# Testar
python3 << 'EOF'
import clip
import torch

model, preprocess = clip.load("ViT-B/32", device="cpu")
print("CLIP carregado com sucesso!")
EOF
```

**Passo 2: Testar com Imagem**
```bash
python3 << 'EOF'
import clip
import torch
from PIL import Image

model, preprocess = clip.load("ViT-B/32", device="cpu")

# Carregar imagem
image = preprocess(Image.open("test.jpg")).unsqueeze(0)

# Textos para comparar
texts = clip.tokenize(["um gato", "um cachorro", "uma árvore"])

with torch.no_grad():
    image_features = model.encode_image(image)
    text_features = model.encode_text(texts)
    
    logits_per_image = image_features @ text_features.T
    print(logits_per_image.softmax(dim=-1))
EOF
```

**Passo 3: Integrar ao Predacos**
```bash
cat > /home/ubuntu/predacos-core/services/ai/clip-service.ts << 'EOF'
import { spawn } from 'child_process';

export async function analyzeImage(imagePath: string, labels: string[]): Promise<any> {
  return new Promise((resolve) => {
    const python = spawn('python3', ['-c', `
import clip
import torch
from PIL import Image

model, preprocess = clip.load("ViT-B/32", device="cpu")
image = preprocess(Image.open("${imagePath}")).unsqueeze(0)
texts = clip.tokenize(${JSON.stringify(labels)})

with torch.no_grad():
    image_features = model.encode_image(image)
    text_features = model.encode_text(texts)
    logits = image_features @ text_features.T
    
print(logits.softmax(dim=-1).tolist())
    `]);
    
    let output = '';
    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    python.on('close', () => {
      resolve(JSON.parse(output));
    });
  });
}
EOF
```

**Benefício:** ✅ Analisar imagens  
**Tempo:** 1-2 horas  
**Custo:** Gratuito  
**Requisitos:** Python, 2GB RAM  

---

## 🌐 USANDO SUA INTERNET

### 1. Hospedar Predacos Online

**Opção 1: Railway (RECOMENDADO)**
```bash
# 1. Criar conta em https://railway.app
# 2. Conectar GitHub
# 3. Criar novo projeto
# 4. Selecionar repositório predacos-core
# 5. Railway detecta Node.js automaticamente
# 6. Deploy automático!
# 7. URL: https://predacos-xxx.railway.app

# Ou via CLI:
npm install -g @railway/cli
railway login
cd /home/ubuntu/predacos-core
railway init
railway up
```

**Benefício:** ✅ Acessar de qualquer lugar  
**Tempo:** 10-15 minutos  
**Custo:** Gratuito (até 500 horas/mês)  

**Opção 2: Render**
```bash
# 1. Criar conta em https://render.com
# 2. Conectar GitHub
# 3. Criar novo Web Service
# 4. Selecionar repositório
# 5. Render faz deploy automático
# 6. URL: https://predacos-xxx.onrender.com
```

**Benefício:** ✅ Acessar de qualquer lugar  
**Tempo:** 10-15 minutos  
**Custo:** Gratuito (com limitações)  

**Opção 3: Replit**
```bash
# 1. Ir para https://replit.com
# 2. Clicar "Import from GitHub"
# 3. Colar: https://github.com/ecodigiai/predacos-core
# 4. Replit clona e executa
# 5. URL: https://predacos-core.ecodigiai.repl.co
```

**Benefício:** ✅ Acessar de qualquer lugar  
**Tempo:** 5-10 minutos  
**Custo:** Gratuito  

---

### 2. Configurar Domínio Personalizado

**Passo 1: Registrar Domínio (Gratuito)**
```bash
# Opção 1: .tk (gratuito)
# https://www.freenom.com
# Registre: predacos.tk

# Opção 2: Subdomínio (gratuito)
# Se hospedado em Railway/Render/Replit
# Eles fornecem subdomínio automático
```

**Passo 2: Usar Cloudflare (Gratuito)**
```bash
# 1. Criar conta em https://cloudflare.com
# 2. Adicionar site
# 3. Mudar nameservers (instruções Cloudflare)
# 4. Configurar DNS:
#    - Type: CNAME
#    - Name: predacos
#    - Target: seu-railway-app.railway.app
# 5. Ativar SSL automático
# 6. URL: https://predacos.seu-dominio.com
```

**Benefício:** ✅ URL profissional com SSL  
**Tempo:** 15-20 minutos  
**Custo:** Gratuito  

---

### 3. Configurar Banco de Dados Online

**Opção 1: Neon (PostgreSQL - Gratuito)**
```bash
# 1. Criar conta em https://neon.tech
# 2. Criar novo projeto
# 3. Copiar connection string
# 4. Adicionar ao .env:
echo "DATABASE_URL=postgresql://..." >> .env

# 5. Migrar banco
npm run db:push
```

**Benefício:** ✅ Banco de dados online  
**Tempo:** 10 minutos  
**Custo:** Gratuito (até 3 projetos)  

**Opção 2: Supabase (PostgreSQL + Auth - Gratuito)**
```bash
# 1. Criar conta em https://supabase.com
# 2. Criar novo projeto
# 3. Copiar connection string
# 4. Usar como DATABASE_URL
```

**Benefício:** ✅ Banco + autenticação  
**Tempo:** 10 minutos  
**Custo:** Gratuito  

---

### 4. Configurar Armazenamento Online

**Opção 1: Cloudflare R2 (S3-compatível - Gratuito)**
```bash
# 1. Criar conta Cloudflare
# 2. Ir para R2
# 3. Criar bucket: predacos-storage
# 4. Gerar API token
# 5. Adicionar ao .env:
echo "R2_ACCOUNT_ID=..." >> .env
echo "R2_ACCESS_KEY=..." >> .env
echo "R2_SECRET_KEY=..." >> .env
echo "R2_BUCKET=predacos-storage" >> .env
```

**Benefício:** ✅ Armazenamento online  
**Tempo:** 15 minutos  
**Custo:** Gratuito (até 10GB)  

**Opção 2: AWS S3 (Gratuito primeiro ano)**
```bash
# 1. Criar conta AWS
# 2. Ir para S3
# 3. Criar bucket
# 4. Gerar access keys
# 5. Usar em .env
```

---

## 📋 CHECKLIST PARA VOCÊ

### Semana 1: Independência

**Dia 1 (2-3 horas):**
- [ ] Instalar Ollama
- [ ] Baixar modelos Mistral + Neural Chat
- [ ] Integrar ao Predacos
- [ ] Testar IA local

**Dia 2 (2-3 horas):**
- [ ] Criar Slack workspace
- [ ] Criar bot Slack
- [ ] Integrar ao Predacos
- [ ] Testar no Slack

**Dia 3 (2-3 horas):**
- [ ] Criar Discord server
- [ ] Criar bot Discord
- [ ] Integrar ao Predacos
- [ ] Testar no Discord

**Dia 4 (1-2 horas):**
- [ ] Criar bot Telegram
- [ ] Integrar ao Predacos
- [ ] Testar no smartphone

**Dia 5 (4-5 horas):**
- [ ] Implementar JWT local
- [ ] Testar autenticação
- [ ] Remover OAuth
- [ ] Testar tudo

**Dia 6-7 (3-4 horas):**
- [ ] Testar integração completa
- [ ] Documentar processo
- [ ] Fazer commit
- [ ] Comemorar! 🎉

---

### Semana 2: Extensibilidade

**Dia 1-2 (6-8 horas):**
- [ ] Implementar auto-patcher
- [ ] Criar testes
- [ ] Testar rollback

**Dia 3-4 (4-5 horas):**
- [ ] Instalar Whisper
- [ ] Integrar ao Predacos
- [ ] Testar transcrição

**Dia 5 (4-5 horas):**
- [ ] Instalar CLIP
- [ ] Integrar ao Predacos
- [ ] Testar análise de imagens

**Dia 6-7 (3-4 horas):**
- [ ] Testar tudo junto
- [ ] Documentar
- [ ] Fazer commit

---

## 🎯 PRÓXIMOS PASSOS

**Você está pronto para começar?**

1. **Comece pelo Ollama** (mais impactante)
   - Torna Predacos independente
   - Funciona offline
   - Sem custos

2. **Depois Slack/Discord/Telegram** (mais acessível)
   - Fácil de integrar
   - Gratuito
   - Imediato

3. **Depois Auto-Patcher** (mais poderoso)
   - Evolução real
   - Automático
   - Mais complexo

4. **Depois Whisper/CLIP** (mais funcional)
   - Processamento de mídia
   - Gratuito
   - Requer Python

5. **Depois Mobile** (mais alcance)
   - App no smartphone
   - Mais trabalho
   - Maior impacto

---

## 📞 PRECISA DE AJUDA?

Se tiver dúvidas em qualquer passo:

1. Consulte a documentação completa
2. Veja os exemplos de código
3. Teste localmente primeiro
4. Faça commit do progresso
5. Peça feedback

**Você consegue! 🚀**

---

**Documento Criado:** 2024-11-09  
**Versão:** 1.0.0  
**Próxima Atualização:** Após Semana 1
