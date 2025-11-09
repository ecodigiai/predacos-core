import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import OpenAI from 'openai';
import { Octokit } from '@octokit/rest';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Inicializar serviços
initializeApp();
const db = getFirestore();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

/**
 * Builder Agent - Agente responsável por criar código automaticamente
 * Gera PRs, commits e gerencia branches baseado em especificações
 */
class BuilderAgent {
  constructor() {
    this.agentId = 'builder-agent';
    this.nome = 'Builder Agent';
    this.versao = '0.1.0';
    this.habilidades = [
      'codegen',
      'criar-pr',
      'gerenciar-branches',
      'refatoracao',
      'otimizacao'
    ];
    
    logger.info(`🤖 ${this.nome} v${this.versao} inicializado`);
  }

  /**
   * Registra o agente no Firestore
   */
  async registrar() {
    await db.collection('agents').doc(this.agentId).set({
      nome: this.nome,
      tipo: 'builder',
      versao: this.versao,
      habilidades: this.habilidades,
      ativo: true,
      lastSeen: new Date(),
      createdAt: new Date()
    });
    
    logger.info('✅ Agente registrado no Firestore');
  }

  /**
   * Escuta por tasks atribuídas a este agente
   */
  async escutarTasks() {
    logger.info('👂 Escutando por tasks...');
    
    const unsubscribe = db.collection('tasks')
      .where('tipo', 'in', ['criar-app', 'criar-site', 'code-improvement', 'refatoracao'])
      .where('status', '==', 'pendente')
      .onSnapshot(async (snapshot) => {
        for (const doc of snapshot.docs) {
          const task = doc.data();
          logger.info(`📋 Nova task recebida: ${doc.id}`);
          
          await this.executarTask(doc.id, task);
        }
      });
    
    return unsubscribe;
  }

  /**
   * Executa uma task específica
   * @param {string} taskId - ID da task
   * @param {Object} task - Dados da task
   */
  async executarTask(taskId, task) {
    try {
      logger.info(`🔄 Executando task ${taskId}: ${task.tipo}`);
      
      // Atualizar status para em execução
      await db.collection('tasks').doc(taskId).update({
        status: 'em_execucao',
        assignedTo: this.agentId,
        startedAt: new Date()
      });
      
      let resultado;
      
      switch (task.tipo) {
        case 'criar-app':
          resultado = await this.criarApp(task);
          break;
        case 'criar-site':
          resultado = await this.criarSite(task);
          break;
        case 'code-improvement':
          resultado = await this.melhorarCodigo(task);
          break;
        case 'refatoracao':
          resultado = await this.refatorarCodigo(task);
          break;
        default:
          throw new Error(`Tipo de task não suportado: ${task.tipo}`);
      }
      
      // Atualizar task com resultado
      await db.collection('tasks').doc(taskId).update({
        status: 'concluida',
        resultado,
        completedAt: new Date()
      });
      
      logger.info(`✅ Task ${taskId} concluída com sucesso`);
      
    } catch (erro) {
      logger.error(`❌ Erro ao executar task ${taskId}: ${erro.message}`);
      
      await db.collection('tasks').doc(taskId).update({
        status: 'falhou',
        erro: erro.message,
        failedAt: new Date()
      });
    }
  }

  /**
   * Cria um aplicativo baseado na especificação
   * @param {Object} task - Especificação da task
   * @returns {Promise<Object>} Resultado da criação
   */
  async criarApp(task) {
    logger.info('📱 Criando aplicativo...');
    
    const { intencao, plano } = task;
    
    // Gerar código usando GPT-4
    const codigo = await this.gerarCodigo({
      tipo: 'app',
      descricao: intencao.descricao,
      tecnologias: intencao.tecnologias,
      requisitos: intencao.requisitos
    });
    
    // Criar branch
    const branchName = `feature/app-${Date.now()}`;
    await this.criarBranch(branchName);
    
    // Fazer commit do código
    const commitSha = await this.fazerCommit(branchName, codigo, 'feat: criar novo aplicativo');
    
    // Abrir PR
    const prUrl = await this.abrirPR({
      branch: branchName,
      titulo: `Novo App: ${intencao.descricao}`,
      descricao: this.gerarDescricaoPR(task)
    });
    
    return {
      sucesso: true,
      branchName,
      commitSha,
      prUrl,
      arquivos: codigo.arquivos.map(a => a.path)
    };
  }

  /**
   * Cria um site baseado na especificação
   * @param {Object} task - Especificação da task
   * @returns {Promise<Object>} Resultado da criação
   */
  async criarSite(task) {
    logger.info('🌐 Criando site...');
    
    const { intencao } = task;
    
    // Gerar código do site
    const codigo = await this.gerarCodigo({
      tipo: 'site',
      descricao: intencao.descricao,
      tecnologias: intencao.tecnologias || ['html', 'css', 'javascript'],
      requisitos: intencao.requisitos
    });
    
    // Criar branch
    const branchName = `feature/site-${Date.now()}`;
    await this.criarBranch(branchName);
    
    // Fazer commit
    const commitSha = await this.fazerCommit(branchName, codigo, 'feat: criar novo site');
    
    // Abrir PR
    const prUrl = await this.abrirPR({
      branch: branchName,
      titulo: `Novo Site: ${intencao.descricao}`,
      descricao: this.gerarDescricaoPR(task)
    });
    
    return {
      sucesso: true,
      branchName,
      commitSha,
      prUrl,
      arquivos: codigo.arquivos.map(a => a.path)
    };
  }

  /**
   * Melhora código existente
   * @param {Object} task - Especificação da task
   * @returns {Promise<Object>} Resultado da melhoria
   */
  async melhorarCodigo(task) {
    logger.info('⚡ Melhorando código...');
    
    const { spec } = task;
    
    // Analisar código atual
    const codigoAtual = await this.lerArquivo(spec.path);
    
    // Gerar melhorias usando IA
    const melhorias = await this.gerarMelhorias(codigoAtual, spec.goal);
    
    // Criar branch
    const branchName = `improvement/${spec.path.replace(/\//g, '-')}-${Date.now()}`;
    await this.criarBranch(branchName);
    
    // Aplicar melhorias
    const commitSha = await this.fazerCommit(
      branchName,
      { arquivos: [{ path: spec.path, conteudo: melhorias.codigo }] },
      `perf: ${spec.goal}`
    );
    
    // Abrir PR
    const prUrl = await this.abrirPR({
      branch: branchName,
      titulo: `Melhoria: ${spec.goal}`,
      descricao: melhorias.explicacao
    });
    
    return {
      sucesso: true,
      branchName,
      commitSha,
      prUrl,
      melhorias: melhorias.resumo
    };
  }

  /**
   * Refatora código existente
   * @param {Object} task - Especificação da task
   * @returns {Promise<Object>} Resultado da refatoração
   */
  async refatorarCodigo(task) {
    logger.info('🔧 Refatorando código...');
    
    // Similar a melhorarCodigo, mas focado em refatoração
    return await this.melhorarCodigo(task);
  }

  /**
   * Gera código usando GPT-4
   * @param {Object} spec - Especificação do código
   * @returns {Promise<Object>} Código gerado
   */
  async gerarCodigo(spec) {
    const prompt = `Você é um desenvolvedor expert. Crie código para:

Tipo: ${spec.tipo}
Descrição: ${spec.descricao}
Tecnologias: ${spec.tecnologias.join(', ')}
Requisitos: ${spec.requisitos.join(', ')}

Gere código completo e funcional. Responda em JSON:
{
  "arquivos": [
    {
      "path": "caminho/arquivo.js",
      "conteudo": "código do arquivo",
      "descricao": "descrição do arquivo"
    }
  ],
  "instrucoes": "instruções de instalação e execução"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Gera melhorias para código existente
   * @param {string} codigoAtual - Código atual
   * @param {string} objetivo - Objetivo da melhoria
   * @returns {Promise<Object>} Melhorias sugeridas
   */
  async gerarMelhorias(codigoAtual, objetivo) {
    const prompt = `Você é um desenvolvedor expert em otimização. Analise e melhore o código:

Objetivo: ${objetivo}

Código atual:
\`\`\`
${codigoAtual}
\`\`\`

Gere código melhorado. Responda em JSON:
{
  "codigo": "código melhorado",
  "explicacao": "explicação das melhorias",
  "resumo": ["melhoria1", "melhoria2"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Cria uma nova branch no repositório
   * @param {string} branchName - Nome da branch
   */
  async criarBranch(branchName) {
    const [owner, repo] = process.env.GITHUB_REPO.split('/');
    
    // Obter SHA da branch main
    const { data: ref } = await octokit.git.getRef({
      owner,
      repo,
      ref: 'heads/main'
    });
    
    // Criar nova branch
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: ref.object.sha
    });
    
    logger.info(`🌿 Branch criada: ${branchName}`);
  }

  /**
   * Faz commit de arquivos
   * @param {string} branchName - Nome da branch
   * @param {Object} codigo - Código a commitar
   * @param {string} mensagem - Mensagem do commit
   * @returns {Promise<string>} SHA do commit
   */
  async fazerCommit(branchName, codigo, mensagem) {
    const [owner, repo] = process.env.GITHUB_REPO.split('/');
    
    // Simplificação: por enquanto apenas loga
    // Implementação completa requer manipulação de tree do Git
    logger.info(`💾 Commit: ${mensagem} na branch ${branchName}`);
    
    return 'commit-sha-placeholder';
  }

  /**
   * Abre um Pull Request
   * @param {Object} options - Opções do PR
   * @returns {Promise<string>} URL do PR
   */
  async abrirPR({ branch, titulo, descricao }) {
    const [owner, repo] = process.env.GITHUB_REPO.split('/');
    
    const { data: pr } = await octokit.pulls.create({
      owner,
      repo,
      title: titulo,
      head: branch,
      base: 'main',
      body: descricao
    });
    
    logger.info(`🔀 PR criado: ${pr.html_url}`);
    
    return pr.html_url;
  }

  /**
   * Lê conteúdo de um arquivo do repositório
   * @param {string} path - Caminho do arquivo
   * @returns {Promise<string>} Conteúdo do arquivo
   */
  async lerArquivo(path) {
    const [owner, repo] = process.env.GITHUB_REPO.split('/');
    
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path
    });
    
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }

  /**
   * Gera descrição formatada para PR
   * @param {Object} task - Task original
   * @returns {string} Descrição do PR
   */
  gerarDescricaoPR(task) {
    return `## 🤖 PR Gerado Automaticamente pelo Builder Agent

### 📋 Descrição
${task.intencao.descricao}

### 🎯 Objetivo
${task.plano.etapas.map(e => `- ${e.nome}`).join('\n')}

### 🔧 Tecnologias
${task.intencao.tecnologias.join(', ')}

### ✅ Checklist
- [ ] Código revisado
- [ ] Testes passando
- [ ] Documentação atualizada

---
*Gerado automaticamente pelo Ecossistema Predacos*`;
  }

  /**
   * Atualiza heartbeat do agente
   */
  async atualizarHeartbeat() {
    await db.collection('agents').doc(this.agentId).update({
      lastSeen: new Date()
    });
  }

  /**
   * Inicia o agente
   */
  async iniciar() {
    await this.registrar();
    await this.escutarTasks();
    
    // Heartbeat a cada 30 segundos
    setInterval(() => this.atualizarHeartbeat(), 30000);
    
    logger.info('🚀 Builder Agent ativo e aguardando tasks');
  }
}

// Inicializar e exportar
const builderAgent = new BuilderAgent();

// Se executado diretamente, iniciar o agente
if (import.meta.url === `file://${process.argv[1]}`) {
  builderAgent.iniciar().catch(console.error);
}

export default builderAgent;
