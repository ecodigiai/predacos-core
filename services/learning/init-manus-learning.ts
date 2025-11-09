/**
 * Inicialização do Aprendizado de Capacidades do Manus AI
 * Carrega o relatório de capacidades e inicia o processo de aprendizado
 */

import { capabilitiesLearner } from './external-capabilities-learner';
import * as path from 'path';

/**
 * Inicializar aprendizado de capacidades do Manus AI
 */
export async function initializeManusCApabilitiesLearning(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('🤖 INICIALIZANDO APRENDIZADO DE CAPACIDADES DO MANUS AI');
  console.log('='.repeat(60) + '\n');

  try {
    // Caminho do relatório de capacidades
    const reportPath = path.join(
      __dirname,
      '../../MANUS_AI_CAPABILITIES_REPORT.md'
    );

    console.log(`📖 Carregando relatório de capacidades: ${reportPath}\n`);

    // Descobrir capacidades do relatório
    await capabilitiesLearner.discoverCapabilitiesFromReport(reportPath);

    // Exibir estatísticas
    const stats = capabilitiesLearner.getStats();
    console.log('\n' + '='.repeat(60));
    console.log('📊 ESTATÍSTICAS DE APRENDIZADO');
    console.log('='.repeat(60));
    console.log(`✓ Capacidades descobertas: ${stats.total_capabilities}`);
    console.log(`✓ Usos registrados: ${stats.total_usages}`);
    console.log(`✓ Taxa de sucesso: ${stats.successful_usages}/${stats.total_usages}`);
    console.log(`✓ Qualidade média: ${stats.average_quality.toFixed(1)}%`);
    console.log(`✓ Capacidade mais usada: ${stats.most_used}`);
    console.log(`✓ Capacidade mais confiável: ${stats.most_reliable}`);
    console.log('='.repeat(60) + '\n');

    // Exportar conhecimento aprendido
    const knowledgePath = path.join(
      __dirname,
      '../../data/manus-learned-knowledge.json'
    );
    capabilitiesLearner.exportKnowledge(knowledgePath);

    console.log(`✅ Aprendizado inicializado com sucesso!`);
    console.log(`📁 Conhecimento salvo em: ${knowledgePath}\n`);

    // Demonstrar recomendações
    demonstrateRecommendations();
  } catch (error) {
    console.error('❌ Erro ao inicializar aprendizado:', error);
    throw error;
  }
}

/**
 * Demonstrar sistema de recomendações
 */
function demonstrateRecommendations(): void {
  console.log('='.repeat(60));
  console.log('💡 DEMONSTRAÇÃO DE RECOMENDAÇÕES');
  console.log('='.repeat(60) + '\n');

  const objectives = [
    'Criar um site profissional',
    'Analisar dados de vendas',
    'Pesquisar tendências de mercado',
    'Gerar imagens para marketing',
    'Automatizar backup de dados',
  ];

  for (const objective of objectives) {
    console.log(`\n🎯 Objetivo: "${objective}"`);

    const suggested = capabilitiesLearner.suggestCapability(objective);
    if (suggested) {
      console.log(`   ✓ Capacidade sugerida: ${suggested.name}`);
      console.log(`   ✓ Categoria: ${suggested.category}`);
      console.log(`   ✓ Confiabilidade: ${suggested.performance.reliability}%`);
    }

    const workflow = capabilitiesLearner.recommendWorkflow(objective);
    if (workflow.length > 0) {
      console.log(`   ✓ Workflow recomendado:`);
      workflow.forEach((cap, idx) => {
        console.log(`     ${idx + 1}. ${cap.name}`);
      });
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Demonstrar uso de uma capacidade
 */
export async function demonstrateCapabilityUsage(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 DEMONSTRAÇÃO DE USO DE CAPACIDADE');
  console.log('='.repeat(60) + '\n');

  try {
    // Usar uma capacidade
    const result = await capabilitiesLearner.useCapability(
      'capability-2-1', // Web Search
      {
        queries: ['tendências de IA em 2024'],
        search_type: 'info',
      },
      {
        goal: 'pesquisa_mercado',
        user: 'predacos_system',
      }
    );

    console.log('✓ Capacidade executada com sucesso');
    console.log('📊 Resultado:', result);

    // Exibir estatísticas atualizadas
    const stats = capabilitiesLearner.getStats();
    console.log('\n📈 Estatísticas atualizadas:');
    console.log(`   Qualidade média: ${stats.average_quality.toFixed(1)}%`);
    console.log(`   Total de usos: ${stats.total_usages}`);
    console.log(`   Taxa de sucesso: ${stats.successful_usages}/${stats.total_usages}`);
  } catch (error) {
    console.error('❌ Erro ao demonstrar uso:', error);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Criar exemplo de integração em workflow
 */
export function createWorkflowExample(): void {
  console.log('\n' + '='.repeat(60));
  console.log('🔄 EXEMPLO DE INTEGRAÇÃO EM WORKFLOW');
  console.log('='.repeat(60) + '\n');

  const workflowCode = `
// Exemplo: Criar relatório de mercado usando capacidades do Manus

async function createMarketReport(topic: string) {
  console.log('Iniciando criação de relatório...');

  // Passo 1: Pesquisar informações
  const searchResults = await capabilitiesLearner.useCapability(
    'capability-2-1', // Web Search
    {
      queries: [topic, \`\${topic} tendências\`, \`\${topic} mercado\`],
      search_type: 'research'
    },
    { goal: 'market_research' }
  );

  // Passo 2: Analisar dados
  const analysis = await capabilitiesLearner.useCapability(
    'capability-4-1', // Data Analysis
    {
      data: searchResults,
      analysis_type: 'descriptive'
    },
    { goal: 'market_research' }
  );

  // Passo 3: Gerar visualizações
  const visualizations = await capabilitiesLearner.useCapability(
    'capability-4-2', // Visualization Generation
    {
      data: analysis,
      chart_types: ['line', 'bar', 'pie']
    },
    { goal: 'market_research' }
  );

  // Passo 4: Gerar documento
  const report = await capabilitiesLearner.useCapability(
    'capability-2-3', // Presentation Generation
    {
      title: \`Relatório de Mercado: \${topic}\`,
      content: analysis,
      visualizations: visualizations
    },
    { goal: 'market_research' }
  );

  return report;
}

// Executar
const report = await createMarketReport('Inteligência Artificial');
console.log('Relatório criado:', report);
  `;

  console.log(workflowCode);
  console.log('='.repeat(60) + '\n');
}

/**
 * Exibir guia de integração
 */
export function displayIntegrationGuide(): void {
  console.log('\n' + '='.repeat(60));
  console.log('📚 GUIA DE INTEGRAÇÃO');
  console.log('='.repeat(60) + '\n');

  const guide = `
1️⃣  DESCOBERTA AUTOMÁTICA
   - O Predacos lê MANUS_AI_CAPABILITIES_REPORT.md
   - Cataloga todas as 30+ capacidades
   - Cria índice para acesso rápido

2️⃣  APRENDIZADO DE PADRÕES
   - Analisa quando usar cada capacidade
   - Identifica sequências eficientes
   - Otimiza combinações de capacidades

3️⃣  INTEGRAÇÃO EM WORKFLOWS
   - Usa capacidades em comandos do usuário
   - Combina múltiplas capacidades
   - Otimiza resultado final

4️⃣  EVOLUÇÃO CONTÍNUA
   - Registra cada uso
   - Aprende com sucessos e falhas
   - Melhora decisões futuras

5️⃣  COMPARTILHAMENTO DE CONHECIMENTO
   - Ensina outros agentes
   - Cria padrões reutilizáveis
   - Contribui ao ecossistema

EXEMPLOS DE INTEGRAÇÃO:

a) Pesquisa + Análise + Visualização
   web_search → data_analysis → visualization_generation

b) Desenvolvimento + Teste + Deploy
   code_generation → test_generation → github_management

c) Automação + Monitoramento + Alertas
   task_automation → system_monitoring → notification

d) Coleta + Processamento + Relatório
   data_collection → data_processing → presentation_generation

MÉTRICAS IMPORTANTES:

✓ Tempo de execução: Monitorar para otimizar
✓ Taxa de sucesso: Melhorar com aprendizado
✓ Qualidade: Validar resultados
✓ Custo: Otimizar uso de recursos
✓ Confiabilidade: Aumentar com testes

PRÓXIMOS PASSOS:

1. Carregar relatório de capacidades ✓
2. Descobrir capacidades ✓
3. Aprender padrões de uso ✓
4. Integrar em workflows ✓
5. Evoluir continuamente ✓
  `;

  console.log(guide);
  console.log('='.repeat(60) + '\n');
}

// Executar inicialização se for módulo principal
if (require.main === module) {
  (async () => {
    try {
      await initializeManusCApabilitiesLearning();
      await demonstrateCapabilityUsage();
      createWorkflowExample();
      displayIntegrationGuide();

      console.log('✅ INICIALIZAÇÃO COMPLETA!');
      console.log('\nO Predacos agora conhece as capacidades do Manus AI');
      console.log('e pode utilizá-las para evoluir e criar soluções inteligentes.\n');
    } catch (error) {
      console.error('Erro fatal:', error);
      process.exit(1);
    }
  })();
}

export { capabilitiesLearner };
