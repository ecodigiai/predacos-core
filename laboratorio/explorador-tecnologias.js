import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import OpenAI from 'openai';
import axios from 'axios';
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
 * Explorador de Tecnologias
 * Descobre, testa e integra novas ferramentas e tecnologias
 */
class ExploradorTecnologias {
  constructor() {
    this.ferramentasConhecidas = new Map();
    this.categoriasInteresse = [
      'hospedagem',
      'banco-dados',
      'email',
      'storage',
      'cdn',
      'analytics',
      'monitoring',
      'ci-cd',
      'api',
      'ai-ml'
    ];
    
    logger.info('🔍 Explorador de Tecnologias inicializado');
  }

  /**
   * Descobre novas ferramentas gratuitas
   * @returns {Promise<Array>} Lista de ferramentas descobertas
   */
  async descobrirNovasFerramentas() {
    logger.info('🔍 Iniciando descoberta de novas ferramentas...');
    
    const ferramentasDescoberta = [];
    
    for (const categoria of this.categoriasInteresse) {
      logger.info(`📂 Explorando categoria: ${categoria}`);
      
      const ferramentas = await this.pesquisarFerramentasCategoria(categoria);
      ferramentasDescoberta.push(...ferramentas);
    }
    
    logger.info(`✅ Descobertas ${ferramentasDescoberta.length} ferramentas`);
    
    // Testar cada ferramenta
    for (const ferramenta of ferramentasDescoberta) {
      await this.testarFerramenta(ferramenta);
    }
    
    return ferramentasDescoberta;
  }

  /**
   * Pesquisa ferramentas de uma categoria específica
   * @param {string} categoria - Categoria a pesquisar
   * @returns {Promise<Array>} Ferramentas encontradas
   */
  async pesquisarFerramentasCategoria(categoria) {
    const prompt = `Liste as 5 melhores ferramentas GRATUITAS para ${categoria} em 2025.

Para cada ferramenta, forneça:
- Nome
- Descrição curta
- Plano gratuito (limites)
- API disponível (sim/não)
- Facilidade de integração (1-10)
- URL oficial

Responda em JSON:
{
  "ferramentas": [
    {
      "nome": "Nome da Ferramenta",
      "categoria": "${categoria}",
      "descricao": "descrição",
      "planoGratuito": "detalhes do plano free",
      "temAPI": true,
      "facilidadeIntegracao": 8,
      "url": "https://...",
      "pontosFavoraveis": ["ponto1", "ponto2"],
      "limitacoes": ["limitacao1"]
    }
  ]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const resultado = JSON.parse(response.choices[0].message.content);
      return resultado.ferramentas || [];
      
    } catch (erro) {
      logger.error(`❌ Erro ao pesquisar categoria ${categoria}: ${erro.message}`);
      return [];
    }
  }

  /**
   * Testa uma ferramenta específica
   * @param {Object} ferramenta - Ferramenta a testar
   * @returns {Promise<Object>} Resultado do teste
   */
  async testarFerramenta(ferramenta) {
    logger.info(`🧪 Testando: ${ferramenta.nome}`);
    
    try {
      // Verificar se a URL está acessível
      const acessivel = await this.verificarAcessibilidade(ferramenta.url);
      
      // Analisar documentação
      const qualidadeDoc = await this.analisarDocumentacao(ferramenta);
      
      // Verificar se já foi testada antes
      const jaTestada = await this.verificarSeJaTestada(ferramenta.nome);
      
      const resultado = {
        ferramenta: ferramenta.nome,
        categoria: ferramenta.categoria,
        acessivel,
        qualidadeDocumentacao: qualidadeDoc,
        jaTestada,
        recomendada: acessivel && qualidadeDoc >= 7,
        testadoEm: new Date()
      };
      
      // Registrar ferramenta útil
      if (resultado.recomendada) {
        await this.registrarFerramentaUtil(ferramenta, resultado);
      }
      
      // Salvar resultado do teste
      await db.collection('testes_ferramentas').add({
        ...resultado,
        detalhes: ferramenta
      });
      
      logger.info(`${resultado.recomendada ? '✅' : '⚠️'} ${ferramenta.nome}: ${resultado.recomendada ? 'Recomendada' : 'Não recomendada'}`);
      
      return resultado;
      
    } catch (erro) {
      logger.error(`❌ Erro ao testar ${ferramenta.nome}: ${erro.message}`);
      
      return {
        ferramenta: ferramenta.nome,
        erro: erro.message,
        recomendada: false,
        testadoEm: new Date()
      };
    }
  }

  /**
   * Verifica se uma URL está acessível
   * @param {string} url - URL a verificar
   * @returns {Promise<boolean>} Se está acessível
   */
  async verificarAcessibilidade(url) {
    try {
      const response = await axios.head(url, {
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      
      return response.status < 400;
      
    } catch (erro) {
      logger.warn(`⚠️ URL não acessível: ${url}`);
      return false;
    }
  }

  /**
   * Analisa qualidade da documentação
   * @param {Object} ferramenta - Ferramenta a analisar
   * @returns {Promise<number>} Nota de 1-10
   */
  async analisarDocumentacao(ferramenta) {
    const prompt = `Avalie a qualidade da documentação desta ferramenta:

Nome: ${ferramenta.nome}
Categoria: ${ferramenta.categoria}
URL: ${ferramenta.url}
Tem API: ${ferramenta.temAPI ? 'Sim' : 'Não'}

Baseado nas informações disponíveis, dê uma nota de 1-10 para a qualidade da documentação.
Considere: clareza, completude, exemplos práticos, facilidade de começar.

Responda apenas com um número de 1 a 10.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 10
      });

      const nota = parseInt(response.choices[0].message.content.trim());
      return isNaN(nota) ? 5 : Math.max(1, Math.min(10, nota));
      
    } catch (erro) {
      logger.warn(`⚠️ Erro ao analisar documentação: ${erro.message}`);
      return 5; // Nota padrão
    }
  }

  /**
   * Verifica se ferramenta já foi testada
   * @param {string} nome - Nome da ferramenta
   * @returns {Promise<boolean>} Se já foi testada
   */
  async verificarSeJaTestada(nome) {
    const snapshot = await db.collection('ferramentas_uteis')
      .where('nome', '==', nome)
      .limit(1)
      .get();
    
    return !snapshot.empty;
  }

  /**
   * Registra ferramenta útil no banco
   * @param {Object} ferramenta - Ferramenta a registrar
   * @param {Object} resultadoTeste - Resultado do teste
   */
  async registrarFerramentaUtil(ferramenta, resultadoTeste) {
    await db.collection('ferramentas_uteis').add({
      nome: ferramenta.nome,
      categoria: ferramenta.categoria,
      descricao: ferramenta.descricao,
      url: ferramenta.url,
      planoGratuito: ferramenta.planoGratuito,
      temAPI: ferramenta.temAPI,
      facilidadeIntegracao: ferramenta.facilidadeIntegracao,
      pontosFavoraveis: ferramenta.pontosFavoraveis,
      limitacoes: ferramenta.limitacoes,
      qualidadeDocumentacao: resultadoTeste.qualidadeDocumentacao,
      status: 'validada',
      descobertaEm: new Date(),
      ultimoTeste: new Date(),
      vezesUsada: 0
    });
    
    logger.info(`💾 Ferramenta registrada: ${ferramenta.nome}`);
  }

  /**
   * Aprende como usar uma ferramenta
   * @param {Object} ferramenta - Ferramenta a aprender
   * @returns {Promise<Object>} Guia de uso
   */
  async aprenderComoUsar(ferramenta) {
    logger.info(`📚 Aprendendo a usar: ${ferramenta.nome}`);
    
    const prompt = `Você é um tutor técnico. Crie um guia rápido de como integrar esta ferramenta:

Nome: ${ferramenta.nome}
Categoria: ${ferramenta.categoria}
Descrição: ${ferramenta.descricao}
URL: ${ferramenta.url}
Tem API: ${ferramenta.temAPI ? 'Sim' : 'Não'}

Forneça:
1. Passos para começar (setup inicial)
2. Exemplo de código básico (se aplicável)
3. Melhores práticas
4. Armadilhas comuns a evitar

Responda em JSON:
{
  "setupInicial": ["passo1", "passo2"],
  "exemploBasico": "código exemplo",
  "melhoresPraticas": ["pratica1", "pratica2"],
  "armadilhas": ["armadilha1", "armadilha2"],
  "recursosAdicionais": ["recurso1", "recurso2"]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        response_format: { type: 'json_object' }
      });

      const guia = JSON.parse(response.choices[0].message.content);
      
      // Salvar guia no banco
      await db.collection('guias_ferramentas').add({
        ferramenta: ferramenta.nome,
        guia,
        criadoEm: new Date()
      });
      
      logger.info(`✅ Guia criado para: ${ferramenta.nome}`);
      
      return guia;
      
    } catch (erro) {
      logger.error(`❌ Erro ao criar guia: ${erro.message}`);
      return null;
    }
  }

  /**
   * Gera relatório de descobertas
   * @returns {Promise<Object>} Relatório completo
   */
  async gerarRelatorioDescoberta() {
    logger.info('📊 Gerando relatório de descobertas...');
    
    // Ferramentas por categoria
    const ferramentasPorCategoria = {};
    
    for (const categoria of this.categoriasInteresse) {
      const snapshot = await db.collection('ferramentas_uteis')
        .where('categoria', '==', categoria)
        .where('status', '==', 'validada')
        .get();
      
      ferramentasPorCategoria[categoria] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
    
    // Ferramentas mais usadas
    const maisUsadasSnapshot = await db.collection('ferramentas_uteis')
      .orderBy('vezesUsada', 'desc')
      .limit(10)
      .get();
    
    const ferramentasMaisUsadas = maisUsadasSnapshot.docs.map(doc => ({
      nome: doc.data().nome,
      categoria: doc.data().categoria,
      vezesUsada: doc.data().vezesUsada
    }));
    
    // Testes recentes
    const testesRecentesSnapshot = await db.collection('testes_ferramentas')
      .orderBy('testadoEm', 'desc')
      .limit(20)
      .get();
    
    const testesRecentes = testesRecentesSnapshot.docs.map(doc => doc.data());
    
    const relatorio = {
      totalFerramentasValidadas: Object.values(ferramentasPorCategoria)
        .reduce((sum, arr) => sum + arr.length, 0),
      ferramentasPorCategoria,
      ferramentasMaisUsadas,
      testesRecentes,
      categorias: this.categoriasInteresse,
      geradoEm: new Date()
    };
    
    return relatorio;
  }

  /**
   * Recomenda ferramenta para uma necessidade
   * @param {string} necessidade - Descrição da necessidade
   * @returns {Promise<Object>} Ferramenta recomendada
   */
  async recomendarFerramenta(necessidade) {
    logger.info(`💡 Buscando recomendação para: ${necessidade}`);
    
    // Identificar categoria
    const categoria = await this.identificarCategoria(necessidade);
    
    // Buscar ferramentas da categoria
    const snapshot = await db.collection('ferramentas_uteis')
      .where('categoria', '==', categoria)
      .where('status', '==', 'validada')
      .orderBy('facilidadeIntegracao', 'desc')
      .limit(3)
      .get();
    
    if (snapshot.empty) {
      logger.warn(`⚠️ Nenhuma ferramenta encontrada para: ${categoria}`);
      return null;
    }
    
    const ferramentas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Usar IA para escolher a melhor
    const melhorFerramenta = await this.escolherMelhorOpcao(necessidade, ferramentas);
    
    return melhorFerramenta;
  }

  /**
   * Identifica categoria baseado em necessidade
   * @param {string} necessidade - Descrição da necessidade
   * @returns {Promise<string>} Categoria identificada
   */
  async identificarCategoria(necessidade) {
    const prompt = `Identifique a categoria desta necessidade:

Necessidade: "${necessidade}"

Categorias disponíveis: ${this.categoriasInteresse.join(', ')}

Responda apenas com o nome da categoria mais apropriada.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 20
    });

    const categoria = response.choices[0].message.content.trim().toLowerCase();
    
    return this.categoriasInteresse.includes(categoria) ? categoria : 'api';
  }

  /**
   * Escolhe melhor opção entre ferramentas
   * @param {string} necessidade - Necessidade do usuário
   * @param {Array} ferramentas - Ferramentas candidatas
   * @returns {Promise<Object>} Melhor ferramenta
   */
  async escolherMelhorOpcao(necessidade, ferramentas) {
    const prompt = `Escolha a melhor ferramenta para esta necessidade:

Necessidade: "${necessidade}"

Opções:
${ferramentas.map((f, i) => `${i + 1}. ${f.nome}: ${f.descricao} (Facilidade: ${f.facilidadeIntegracao}/10)`).join('\n')}

Responda em JSON:
{
  "escolhida": 1,
  "justificativa": "razão da escolha"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      response_format: { type: 'json_object' }
    });

    const resultado = JSON.parse(response.choices[0].message.content);
    const indice = resultado.escolhida - 1;
    
    return {
      ...ferramentas[indice],
      justificativa: resultado.justificativa
    };
  }

  /**
   * Executa ciclo completo de descoberta
   */
  async executarCicloCompleto() {
    logger.info('🚀 Iniciando ciclo completo de descoberta...');
    
    try {
      // 1. Descobrir novas ferramentas
      const ferramentasDescoberta = await this.descobrirNovasFerramentas();
      
      // 2. Aprender a usar as recomendadas
      const recomendadas = ferramentasDescoberta.filter(f => 
        f.facilidadeIntegracao >= 7 && f.temAPI
      );
      
      for (const ferramenta of recomendadas.slice(0, 5)) {
        await this.aprenderComoUsar(ferramenta);
      }
      
      // 3. Gerar relatório
      const relatorio = await this.gerarRelatorioDescoberta();
      
      logger.info('✅ Ciclo completo concluído!');
      
      return {
        descobertas: ferramentasDescoberta.length,
        recomendadas: recomendadas.length,
        relatorio
      };
      
    } catch (erro) {
      logger.error(`❌ Erro no ciclo de descoberta: ${erro.message}`);
      throw erro;
    }
  }
}

// Inicializar e exportar
const explorador = new ExploradorTecnologias();

// Se executado diretamente, executar ciclo completo
if (import.meta.url === `file://${process.argv[1]}`) {
  explorador.executarCicloCompleto()
    .then(resultado => {
      console.log('\n🔍 CICLO DE DESCOBERTA CONCLUÍDO\n');
      console.log(JSON.stringify(resultado, null, 2));
    })
    .catch(console.error);
}

export default explorador;
