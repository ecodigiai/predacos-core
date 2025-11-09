import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import OpenAI from 'openai';
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

/**
 * Sistema de Aprendizado Contínuo
 * Aprende com cada interação e melhora continuamente
 */
class SistemaAprendizado {
  constructor() {
    this.padroes = new Map();
    this.conhecimento = new Map();
    
    logger.info('🧠 Sistema de Aprendizado inicializado');
  }

  /**
   * Aprende com o resultado de uma execução
   * @param {string} pedidoOriginal - Pedido do usuário
   * @param {Object} resultado - Resultado da execução
   * @param {boolean} sucesso - Se foi bem-sucedido
   */
  async aprenderDoResultado(pedidoOriginal, resultado, sucesso) {
    logger.info(`📚 Registrando aprendizado: ${sucesso ? 'sucesso' : 'falha'}`);
    
    try {
      // Extrair lições do resultado
      const licoes = await this.extrairLicoes(resultado, sucesso);
      
      // Salvar no Firestore
      const aprendizadoRef = await db.collection('aprendizado').add({
        pedido: pedidoOriginal,
        resultado: {
          sucesso: resultado.sucesso,
          etapas: resultado.etapas?.length || 0,
          completadas: resultado.completadas || 0
        },
        sucesso,
        licoes,
        timestamp: new Date(),
        versao: '0.1.0'
      });
      
      logger.info(`✅ Aprendizado registrado: ${aprendizadoRef.id}`);
      
      // Atualizar padrões
      if (sucesso) {
        await this.reforcarPadroes(pedidoOriginal, resultado);
      } else {
        await this.ajustarInterpretacao(pedidoOriginal, resultado);
      }
      
      // Atualizar métricas
      await this.atualizarMetricas(sucesso);
      
    } catch (erro) {
      logger.error(`❌ Erro ao registrar aprendizado: ${erro.message}`);
    }
  }

  /**
   * Extrai lições de um resultado
   * @param {Object} resultado - Resultado da execução
   * @param {boolean} sucesso - Se foi bem-sucedido
   * @returns {Promise<Array>} Lições aprendidas
   */
  async extrairLicoes(resultado, sucesso) {
    const licoes = [];
    
    if (sucesso) {
      licoes.push({
        tipo: 'sucesso',
        mensagem: 'Abordagem bem-sucedida',
        confianca: 0.9
      });
      
      if (resultado.etapas) {
        resultado.etapas.forEach(etapa => {
          if (etapa.sucesso) {
            licoes.push({
              tipo: 'etapa_sucesso',
              etapa: etapa.nome,
              mensagem: `Etapa ${etapa.nome} executada com sucesso`,
              confianca: 0.8
            });
          }
        });
      }
    } else {
      licoes.push({
        tipo: 'falha',
        mensagem: 'Necessário ajustar estratégia',
        confianca: 0.7
      });
      
      if (resultado.etapas) {
        resultado.etapas.forEach(etapa => {
          if (!etapa.sucesso) {
            licoes.push({
              tipo: 'etapa_falha',
              etapa: etapa.nome,
              mensagem: `Etapa ${etapa.nome} falhou - revisar abordagem`,
              confianca: 0.9
            });
          }
        });
      }
    }
    
    return licoes;
  }

  /**
   * Reforça padrões bem-sucedidos
   * @param {string} pedido - Pedido original
   * @param {Object} resultado - Resultado bem-sucedido
   */
  async reforcarPadroes(pedido, resultado) {
    logger.info('💪 Reforçando padrões bem-sucedidos');
    
    // Identificar palavras-chave do pedido
    const palavrasChave = this.extrairPalavrasChave(pedido);
    
    // Atualizar padrões no banco
    for (const palavra of palavrasChave) {
      const padraoRef = db.collection('padroes').doc(palavra.toLowerCase());
      const padraoDoc = await padraoRef.get();
      
      if (padraoDoc.exists) {
        await padraoRef.update({
          sucessos: (padraoDoc.data().sucessos || 0) + 1,
          confianca: Math.min((padraoDoc.data().confianca || 0.5) + 0.05, 1.0),
          ultimoUso: new Date()
        });
      } else {
        await padraoRef.set({
          palavra,
          sucessos: 1,
          falhas: 0,
          confianca: 0.6,
          primeiroUso: new Date(),
          ultimoUso: new Date()
        });
      }
    }
  }

  /**
   * Ajusta interpretação após falha
   * @param {string} pedido - Pedido original
   * @param {Object} resultado - Resultado com falha
   */
  async ajustarInterpretacao(pedido, resultado) {
    logger.info('🔧 Ajustando interpretação após falha');
    
    const palavrasChave = this.extrairPalavrasChave(pedido);
    
    for (const palavra of palavrasChave) {
      const padraoRef = db.collection('padroes').doc(palavra.toLowerCase());
      const padraoDoc = await padraoRef.get();
      
      if (padraoDoc.exists) {
        await padraoRef.update({
          falhas: (padraoDoc.data().falhas || 0) + 1,
          confianca: Math.max((padraoDoc.data().confianca || 0.5) - 0.03, 0.1),
          ultimoUso: new Date()
        });
      }
    }
  }

  /**
   * Extrai palavras-chave de um texto
   * @param {string} texto - Texto para análise
   * @returns {Array} Palavras-chave
   */
  extrairPalavrasChave(texto) {
    // Palavras comuns a ignorar
    const stopWords = new Set([
      'o', 'a', 'de', 'da', 'do', 'em', 'um', 'uma', 'para', 'com', 'por',
      'que', 'e', 'é', 'ou', 'se', 'na', 'no', 'os', 'as', 'dos', 'das'
    ]);
    
    return texto
      .toLowerCase()
      .split(/\s+/)
      .filter(palavra => palavra.length > 3 && !stopWords.has(palavra));
  }

  /**
   * Pesquisa conhecimento na internet
   * @param {string} duvida - Dúvida ou tópico
   * @returns {Promise<Object>} Conhecimento encontrado
   */
  async pesquisarInternet(duvida) {
    logger.info(`🔍 Pesquisando: ${duvida}`);
    
    try {
      // Usar GPT para gerar query de busca otimizada
      const queryOtimizada = await this.otimizarQuery(duvida);
      
      // Aqui seria integrado com API de busca (Google, Bing, etc)
      // Por enquanto, usar GPT como fonte de conhecimento
      const conhecimento = await this.buscarConhecimentoIA(queryOtimizada);
      
      // Armazenar conhecimento
      await this.armazenarConhecimento(duvida, conhecimento);
      
      return conhecimento;
      
    } catch (erro) {
      logger.error(`❌ Erro ao pesquisar: ${erro.message}`);
      return null;
    }
  }

  /**
   * Otimiza query de busca
   * @param {string} duvida - Dúvida original
   * @returns {Promise<string>} Query otimizada
   */
  async otimizarQuery(duvida) {
    const prompt = `Otimize esta query de busca para obter melhores resultados:

Dúvida: "${duvida}"

Gere uma query de busca otimizada (máximo 10 palavras).`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 50
    });

    return response.choices[0].message.content.trim();
  }

  /**
   * Busca conhecimento usando IA
   * @param {string} query - Query de busca
   * @returns {Promise<Object>} Conhecimento
   */
  async buscarConhecimentoIA(query) {
    const prompt = `Você é um assistente de pesquisa. Forneça informações precisas e atualizadas sobre:

${query}

Responda em JSON:
{
  "resumo": "resumo conciso",
  "detalhes": "informações detalhadas",
  "fontes": ["fonte1", "fonte2"],
  "confiabilidade": 0.8,
  "dataAtualizacao": "2025-11-09"
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
   * Armazena conhecimento no banco
   * @param {string} topico - Tópico do conhecimento
   * @param {Object} conhecimento - Conhecimento adquirido
   */
  async armazenarConhecimento(topico, conhecimento) {
    await db.collection('conhecimento').add({
      topico,
      conhecimento,
      timestamp: new Date(),
      acessos: 0,
      ultimoAcesso: new Date()
    });
    
    logger.info(`💾 Conhecimento armazenado: ${topico}`);
  }

  /**
   * Recupera conhecimento armazenado
   * @param {string} topico - Tópico a buscar
   * @returns {Promise<Object|null>} Conhecimento encontrado
   */
  async recuperarConhecimento(topico) {
    const snapshot = await db.collection('conhecimento')
      .where('topico', '==', topico)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    
    // Atualizar contadores
    await doc.ref.update({
      acessos: (doc.data().acessos || 0) + 1,
      ultimoAcesso: new Date()
    });
    
    return doc.data().conhecimento;
  }

  /**
   * Atualiza métricas de aprendizado
   * @param {boolean} sucesso - Se foi bem-sucedido
   */
  async atualizarMetricas(sucesso) {
    const hoje = new Date().toISOString().split('T')[0];
    const metricaRef = db.collection('metricas').doc(hoje);
    
    const metricaDoc = await metricaRef.get();
    
    if (metricaDoc.exists) {
      const data = metricaDoc.data();
      await metricaRef.update({
        totalComandos: (data.totalComandos || 0) + 1,
        sucessos: (data.sucessos || 0) + (sucesso ? 1 : 0),
        falhas: (data.falhas || 0) + (sucesso ? 0 : 1),
        taxaAcerto: ((data.sucessos || 0) + (sucesso ? 1 : 0)) / ((data.totalComandos || 0) + 1),
        ultimaAtualizacao: new Date()
      });
    } else {
      await metricaRef.set({
        data: hoje,
        totalComandos: 1,
        sucessos: sucesso ? 1 : 0,
        falhas: sucesso ? 0 : 1,
        taxaAcerto: sucesso ? 1.0 : 0.0,
        primeiraAtualizacao: new Date(),
        ultimaAtualizacao: new Date()
      });
    }
  }

  /**
   * Analisa tendências de aprendizado
   * @param {number} dias - Número de dias para análise
   * @returns {Promise<Object>} Análise de tendências
   */
  async analisarTendencias(dias = 7) {
    logger.info(`📊 Analisando tendências dos últimos ${dias} dias`);
    
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - dias);
    
    const snapshot = await db.collection('metricas')
      .where('primeiraAtualizacao', '>=', dataInicio)
      .orderBy('primeiraAtualizacao', 'asc')
      .get();
    
    const metricas = snapshot.docs.map(doc => doc.data());
    
    if (metricas.length === 0) {
      return {
        periodo: dias,
        dados: [],
        tendencia: 'insuficiente'
      };
    }
    
    const totalComandos = metricas.reduce((sum, m) => sum + m.totalComandos, 0);
    const totalSucessos = metricas.reduce((sum, m) => sum + m.sucessos, 0);
    const taxaMediaAcerto = totalSucessos / totalComandos;
    
    // Calcular tendência
    const taxas = metricas.map(m => m.taxaAcerto);
    const tendencia = this.calcularTendencia(taxas);
    
    return {
      periodo: dias,
      totalComandos,
      totalSucessos,
      taxaMediaAcerto,
      tendencia,
      dados: metricas
    };
  }

  /**
   * Calcula tendência de uma série temporal
   * @param {Array} valores - Valores da série
   * @returns {string} Tendência (crescente, decrescente, estavel)
   */
  calcularTendencia(valores) {
    if (valores.length < 2) return 'estavel';
    
    const metade = Math.floor(valores.length / 2);
    const primeiraMetade = valores.slice(0, metade);
    const segundaMetade = valores.slice(metade);
    
    const mediaPrimeira = primeiraMetade.reduce((a, b) => a + b, 0) / primeiraMetade.length;
    const mediaSegunda = segundaMetade.reduce((a, b) => a + b, 0) / segundaMetade.length;
    
    const diferenca = mediaSegunda - mediaPrimeira;
    
    if (diferenca > 0.05) return 'crescente';
    if (diferenca < -0.05) return 'decrescente';
    return 'estavel';
  }

  /**
   * Gera relatório de aprendizado
   * @returns {Promise<Object>} Relatório completo
   */
  async gerarRelatorio() {
    logger.info('📋 Gerando relatório de aprendizado');
    
    const tendencias = await this.analisarTendencias(30);
    
    // Padrões mais bem-sucedidos
    const padroesSnapshot = await db.collection('padroes')
      .orderBy('sucessos', 'desc')
      .limit(10)
      .get();
    
    const padroesSucesso = padroesSnapshot.docs.map(doc => ({
      palavra: doc.id,
      ...doc.data()
    }));
    
    // Conhecimento mais acessado
    const conhecimentoSnapshot = await db.collection('conhecimento')
      .orderBy('acessos', 'desc')
      .limit(10)
      .get();
    
    const conhecimentoPopular = conhecimentoSnapshot.docs.map(doc => ({
      topico: doc.data().topico,
      acessos: doc.data().acessos
    }));
    
    return {
      tendencias,
      padroesSucesso,
      conhecimentoPopular,
      geradoEm: new Date()
    };
  }
}

// Inicializar e exportar
const sistemaAprendizado = new SistemaAprendizado();

// Se executado diretamente, gerar relatório
if (import.meta.url === `file://${process.argv[1]}`) {
  sistemaAprendizado.gerarRelatorio()
    .then(relatorio => {
      console.log('\n📊 RELATÓRIO DE APRENDIZADO\n');
      console.log(JSON.stringify(relatorio, null, 2));
    })
    .catch(console.error);
}

export default sistemaAprendizado;
