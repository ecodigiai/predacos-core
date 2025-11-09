import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import OpenAI from 'openai';
import winston from 'winston';

// Configuração de logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Inicializar Firebase
initializeApp();
const db = getFirestore();

// Inicializar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Classe principal do Jarvis Predacos
 * Sistema de IA auto-evolutivo que interpreta comandos em português
 * e orquestra agentes especializados para criar soluções
 */
class JarvisPredacos {
  constructor() {
    this.ferramentas = ['github', 'firebase', 'replit', 'notion', 'cloudflare'];
    this.habilidades = [
      'criar-apps',
      'criar-sites',
      'conectar-servicos',
      'pesquisar',
      'otimizar',
      'testar',
      'deploy'
    ];
    this.historicoAprendizado = [];
    this.agentesAtivos = new Map();
    
    logger.info('🧠 Jarvis Predacos inicializado');
  }

  /**
   * Processa um pedido em linguagem natural (português)
   * @param {string} pedidoPortugues - Comando do usuário
   * @param {string} usuarioId - ID do usuário que fez o pedido
   * @returns {Promise<Object>} Resultado da execução
   */
  async processarPedido(pedidoPortugues, usuarioId = 'system') {
    logger.info(`📝 Novo pedido recebido: "${pedidoPortugues}"`);
    
    try {
      // 1. Interpretar o pedido usando IA
      const intencao = await this.interpretarLinguagemNatural(pedidoPortugues);
      logger.info(`🎯 Intenção identificada: ${intencao.tipo}`);
      
      // 2. Planejar a solução
      const plano = await this.planejarSolucao(intencao);
      logger.info(`📋 Plano criado com ${plano.etapas.length} etapas`);
      
      // 3. Criar task no Firestore
      const taskId = await this.criarTask(pedidoPortugues, intencao, plano, usuarioId);
      
      // 4. Executar o plano usando agentes
      const resultado = await this.executarPlano(plano, taskId);
      
      // 5. Aprender com o resultado
      await this.aprender(resultado, pedidoPortugues, intencao);
      
      // 6. Atualizar task com resultado
      await this.atualizarTask(taskId, resultado);
      
      logger.info(`✅ Pedido concluído com sucesso`);
      
      return {
        sucesso: true,
        taskId,
        resultado,
        mensagem: this.gerarMensagemResposta(resultado)
      };
      
    } catch (erro) {
      logger.error(`❌ Erro ao processar pedido: ${erro.message}`);
      
      return {
        sucesso: false,
        erro: erro.message,
        mensagem: `Desculpe, encontrei um problema: ${erro.message}`
      };
    }
  }

  /**
   * Interpreta linguagem natural usando GPT-4
   * @param {string} texto - Texto em português
   * @returns {Promise<Object>} Intenção identificada
   */
  async interpretarLinguagemNatural(texto) {
    const prompt = `Você é um assistente que interpreta comandos em português para um sistema de automação.

Analise o seguinte comando e identifique:
1. Tipo de ação (criar-app, criar-site, conectar-servicos, otimizar, pesquisar, testar, deploy)
2. Tecnologias envolvidas
3. Requisitos específicos
4. Prioridade (baixa, média, alta, urgente)

Comando: "${texto}"

Responda em JSON com esta estrutura:
{
  "tipo": "tipo-da-acao",
  "tecnologias": ["tech1", "tech2"],
  "requisitos": ["req1", "req2"],
  "prioridade": "media",
  "descricao": "descrição clara da intenção"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Planeja a solução baseado na intenção
   * @param {Object} intencao - Intenção identificada
   * @returns {Promise<Object>} Plano de execução
   */
  async planejarSolucao(intencao) {
    const prompt = `Você é um arquiteto de software. Crie um plano detalhado para executar esta tarefa:

Tipo: ${intencao.tipo}
Descrição: ${intencao.descricao}
Tecnologias: ${intencao.tecnologias.join(', ')}
Requisitos: ${intencao.requisitos.join(', ')}

Crie um plano com etapas sequenciais. Cada etapa deve ter:
- nome: nome descritivo
- agente: qual agente executará (builder, tester, deployer, explorer, evolver)
- acao: ação específica a executar
- dependencias: etapas que devem ser concluídas antes
- estimativa: tempo estimado em minutos

Responda em JSON:
{
  "etapas": [
    {
      "id": 1,
      "nome": "nome-etapa",
      "agente": "builder",
      "acao": "descrição da ação",
      "dependencias": [],
      "estimativa": 5
    }
  ],
  "riscos": ["risco1", "risco2"],
  "ferramentas": ["ferramenta1", "ferramenta2"]
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
   * Cria uma task no Firestore
   * @param {string} pedido - Pedido original
   * @param {Object} intencao - Intenção identificada
   * @param {Object} plano - Plano de execução
   * @param {string} usuarioId - ID do usuário
   * @returns {Promise<string>} ID da task criada
   */
  async criarTask(pedido, intencao, plano, usuarioId) {
    const taskRef = await db.collection('tasks').add({
      pedidoOriginal: pedido,
      tipo: intencao.tipo,
      intencao,
      plano,
      status: 'em_execucao',
      prioridade: intencao.prioridade || 'media',
      usuarioId,
      createdAt: new Date(),
      updatedAt: new Date(),
      etapasCompletadas: [],
      logs: []
    });

    return taskRef.id;
  }

  /**
   * Executa o plano usando agentes especializados
   * @param {Object} plano - Plano de execução
   * @param {string} taskId - ID da task
   * @returns {Promise<Object>} Resultado da execução
   */
  async executarPlano(plano, taskId) {
    const resultados = [];
    
    for (const etapa of plano.etapas) {
      logger.info(`🔄 Executando etapa ${etapa.id}: ${etapa.nome}`);
      
      // Adicionar log à task
      await this.adicionarLogTask(taskId, `Iniciando etapa: ${etapa.nome}`);
      
      // Simular execução da etapa (será implementado pelos agentes reais)
      const resultadoEtapa = await this.executarEtapa(etapa, taskId);
      
      resultados.push({
        etapaId: etapa.id,
        nome: etapa.nome,
        sucesso: resultadoEtapa.sucesso,
        saida: resultadoEtapa.saida
      });
      
      // Atualizar etapas completadas
      await db.collection('tasks').doc(taskId).update({
        etapasCompletadas: resultados.map(r => r.etapaId),
        updatedAt: new Date()
      });
      
      if (!resultadoEtapa.sucesso) {
        logger.error(`❌ Etapa ${etapa.id} falhou: ${resultadoEtapa.erro}`);
        break;
      }
    }
    
    return {
      sucesso: resultados.every(r => r.sucesso),
      etapas: resultados,
      totalEtapas: plano.etapas.length,
      completadas: resultados.filter(r => r.sucesso).length
    };
  }

  /**
   * Executa uma etapa específica
   * @param {Object} etapa - Etapa a executar
   * @param {string} taskId - ID da task
   * @returns {Promise<Object>} Resultado da etapa
   */
  async executarEtapa(etapa, taskId) {
    // Por enquanto, simulação básica
    // Será substituído por chamadas aos agentes reais
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      sucesso: true,
      saida: `Etapa ${etapa.nome} executada com sucesso`,
      artefatos: []
    };
  }

  /**
   * Adiciona log a uma task
   * @param {string} taskId - ID da task
   * @param {string} mensagem - Mensagem de log
   */
  async adicionarLogTask(taskId, mensagem) {
    await db.collection('tasks').doc(taskId).update({
      logs: getFirestore.FieldValue.arrayUnion({
        timestamp: new Date(),
        mensagem
      })
    });
  }

  /**
   * Atualiza task com resultado final
   * @param {string} taskId - ID da task
   * @param {Object} resultado - Resultado da execução
   */
  async atualizarTask(taskId, resultado) {
    await db.collection('tasks').doc(taskId).update({
      status: resultado.sucesso ? 'concluida' : 'falhou',
      resultado,
      updatedAt: new Date(),
      completedAt: new Date()
    });
  }

  /**
   * Sistema de aprendizado - registra experiência
   * @param {Object} resultado - Resultado da execução
   * @param {string} pedido - Pedido original
   * @param {Object} intencao - Intenção identificada
   */
  async aprender(resultado, pedido, intencao) {
    await db.collection('aprendizado').add({
      pedido,
      intencao,
      resultado,
      sucesso: resultado.sucesso,
      timestamp: new Date(),
      licoes: this.extrairLicoes(resultado)
    });
    
    logger.info('🧠 Aprendizado registrado');
  }

  /**
   * Extrai lições do resultado para aprendizado
   * @param {Object} resultado - Resultado da execução
   * @returns {Array} Lições aprendidas
   */
  extrairLicoes(resultado) {
    const licoes = [];
    
    if (resultado.sucesso) {
      licoes.push('Abordagem bem-sucedida');
    } else {
      licoes.push('Necessário ajustar estratégia');
    }
    
    return licoes;
  }

  /**
   * Gera mensagem de resposta amigável
   * @param {Object} resultado - Resultado da execução
   * @returns {string} Mensagem formatada
   */
  gerarMensagemResposta(resultado) {
    if (resultado.sucesso) {
      return `✅ Pronto! Completei ${resultado.completadas} de ${resultado.totalEtapas} etapas com sucesso.`;
    } else {
      return `⚠️ Consegui completar ${resultado.completadas} de ${resultado.totalEtapas} etapas. Vou tentar melhorar na próxima vez.`;
    }
  }

  /**
   * Inicia o sistema e fica aguardando comandos
   */
  async iniciar() {
    logger.info('🚀 Sistema Jarvis Predacos iniciado e pronto para receber comandos');
    logger.info(`🔧 Ferramentas disponíveis: ${this.ferramentas.join(', ')}`);
    logger.info(`🎯 Habilidades: ${this.habilidades.join(', ')}`);
    
    // Registrar sistema como agente
    await db.collection('agents').doc('jarvis-core').set({
      nome: 'Jarvis Core',
      tipo: 'orchestrator',
      versao: '0.1.0-alpha',
      ativo: true,
      lastSeen: new Date(),
      habilidades: this.habilidades,
      ferramentas: this.ferramentas
    });
  }
}

// Inicializar e exportar
const jarvis = new JarvisPredacos();

// Se executado diretamente, iniciar o sistema
if (import.meta.url === `file://${process.argv[1]}`) {
  jarvis.iniciar().catch(console.error);
}

export default jarvis;
