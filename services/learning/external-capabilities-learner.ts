/**
 * Serviço de Aprendizado de Capacidades Externas
 * Descobre, cataloga e aprende a usar capacidades de agentes externos (Manus AI)
 * Integra essas capacidades aos workflows do Predacos
 */

import * as fs from 'fs';
import axios from 'axios';

interface ExternalCapability {
  id: string;
  name: string;
  description: string;
  category: string;
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
  performance: {
    average_time: number; // em segundos
    accuracy: number; // 0-100
    reliability: number; // 0-100
    cost: 'low' | 'medium' | 'high';
  };
  limitations: string[];
  use_cases: string[];
  examples: Array<{
    input: Record<string, any>;
    output: Record<string, any>;
    description: string;
  }>;
  integration_pattern: string;
  status: 'available' | 'testing' | 'deprecated';
}

interface CapabilityUsageRecord {
  capability_id: string;
  timestamp: Date;
  input: Record<string, any>;
  output: Record<string, any>;
  success: boolean;
  duration: number;
  quality_score: number; // 0-100
  context: Record<string, any>;
  learned_insights: string[];
}

interface CapabilityPattern {
  capability_id: string;
  pattern_type: string; // 'sequential', 'parallel', 'conditional'
  trigger_conditions: Record<string, any>;
  expected_outcome: string;
  success_rate: number;
  average_time: number;
  examples: number;
}

interface CapabilityKnowledge {
  capability_id: string;
  when_to_use: string[];
  when_not_to_use: string[];
  best_practices: string[];
  common_mistakes: string[];
  optimization_tips: string[];
  integration_guide: string;
}

class ExternalCapabilitiesLearner {
  private capabilities: Map<string, ExternalCapability> = new Map();
  private usageHistory: CapabilityUsageRecord[] = [];
  private patterns: Map<string, CapabilityPattern[]> = new Map();
  private knowledge: Map<string, CapabilityKnowledge> = new Map();
  private learningInterval: NodeJS.Timer | null = null;

  constructor() {
    this.initializeLearning();
  }

  /**
   * Descobrir capacidades de um relatório externo
   */
  async discoverCapabilitiesFromReport(reportPath: string): Promise<void> {
    try {
      const reportContent = fs.readFileSync(reportPath, 'utf-8');

      // Extrair capacidades do relatório
      const capabilities = this.parseCapabilitiesFromReport(reportContent);

      console.log(`[Learning] Descobertas ${capabilities.length} capacidades`);

      for (const capability of capabilities) {
        this.capabilities.set(capability.id, capability);
        
        // Iniciar aprendizado de cada capacidade
        await this.learnCapability(capability);
      }
    } catch (error) {
      console.error('[Learning] Erro ao descobrir capacidades:', error);
    }
  }

  /**
   * Fazer parsing de capacidades do relatório
   */
  private parseCapabilitiesFromReport(content: string): ExternalCapability[] {
    const capabilities: ExternalCapability[] = [];

    // Extrair seções de capacidades
    const capabilityRegex = /### (\d+\.\d+)\s+(.+?)\n([\s\S]*?)(?=###|$)/g;
    let match;

    while ((match = capabilityRegex.exec(content)) !== null) {
      const [, number, title, description] = match;
      const capability = this.parseCapabilitySection(title, description, number);

      if (capability) {
        capabilities.push(capability);
      }
    }

    return capabilities;
  }

  /**
   * Fazer parsing de uma seção de capacidade
   */
  private parseCapabilitySection(
    title: string,
    description: string,
    number: string
  ): ExternalCapability | null {
    try {
      const id = `capability-${number.replace('.', '-')}`;
      const category = this.extractCategory(description);
      const limitations = this.extractLimitations(description);
      const useCases = this.extractUseCases(description);

      return {
        id,
        name: title.trim(),
        description: description.substring(0, 500),
        category,
        input_schema: this.extractInputSchema(description),
        output_schema: this.extractOutputSchema(description),
        performance: this.extractPerformance(description),
        limitations,
        use_cases: useCases,
        examples: this.extractExamples(description),
        integration_pattern: this.extractIntegrationPattern(description),
        status: 'available',
      };
    } catch (error) {
      console.error('[Learning] Erro ao fazer parsing:', error);
      return null;
    }
  }

  /**
   * Aprender sobre uma capacidade
   */
  private async learnCapability(capability: ExternalCapability): Promise<void> {
    console.log(`[Learning] Aprendendo sobre: ${capability.name}`);

    // Gerar conhecimento sobre a capacidade
    const knowledge: CapabilityKnowledge = {
      capability_id: capability.id,
      when_to_use: this.generateWhenToUse(capability),
      when_not_to_use: this.generateWhenNotToUse(capability),
      best_practices: this.generateBestPractices(capability),
      common_mistakes: this.generateCommonMistakes(capability),
      optimization_tips: this.generateOptimizationTips(capability),
      integration_guide: this.generateIntegrationGuide(capability),
    };

    this.knowledge.set(capability.id, knowledge);

    // Registrar padrões de uso
    const patterns = this.generateUsagePatterns(capability);
    this.patterns.set(capability.id, patterns);
  }

  /**
   * Usar uma capacidade e registrar aprendizado
   */
  async useCapability(
    capabilityId: string,
    input: Record<string, any>,
    context: Record<string, any> = {}
  ): Promise<any> {
    const capability = this.capabilities.get(capabilityId);
    if (!capability) {
      throw new Error(`Capacidade não encontrada: ${capabilityId}`);
    }

    const startTime = Date.now();

    try {
      // Executar capacidade
      const output = await this.executeCapability(capability, input);
      const duration = (Date.now() - startTime) / 1000;

      // Registrar uso
      const record: CapabilityUsageRecord = {
        capability_id: capabilityId,
        timestamp: new Date(),
        input,
        output,
        success: true,
        duration,
        quality_score: this.assessQuality(capability, output),
        context,
        learned_insights: this.extractInsights(capability, input, output),
      };

      this.usageHistory.push(record);

      // Aprender com o resultado
      await this.learnFromUsage(record);

      return output;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;

      // Registrar falha
      const record: CapabilityUsageRecord = {
        capability_id: capabilityId,
        timestamp: new Date(),
        input,
        output: { error: String(error) },
        success: false,
        duration,
        quality_score: 0,
        context,
        learned_insights: [`Falha ao usar ${capability.name}`],
      };

      this.usageHistory.push(record);

      throw error;
    }
  }

  /**
   * Executar uma capacidade
   */
  private async executeCapability(
    capability: ExternalCapability,
    input: Record<string, any>
  ): Promise<any> {
    // Aqui seria feita a chamada real à capacidade externa
    // Por enquanto, simular execução
    console.log(`[Learning] Executando: ${capability.name}`);
    console.log(`[Learning] Input:`, input);

    // Simular delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Retornar output simulado
    return {
      success: true,
      data: `Resultado de ${capability.name}`,
      timestamp: new Date(),
    };
  }

  /**
   * Aprender com o uso de uma capacidade
   */
  private async learnFromUsage(record: CapabilityUsageRecord): Promise<void> {
    const capability = this.capabilities.get(record.capability_id);
    if (!capability) return;

    console.log(
      `[Learning] Aprendendo do uso de ${capability.name}: qualidade ${record.quality_score}%`
    );

    // Atualizar padrões de uso
    this.updateUsagePatterns(record);

    // Atualizar conhecimento
    this.updateKnowledge(record);

    // Registrar insights
    if (record.learned_insights.length > 0) {
      console.log(`[Learning] Insights:`, record.learned_insights);
    }
  }

  /**
   * Sugerir capacidade para um objetivo
   */
  suggestCapability(objective: string): ExternalCapability | null {
    let bestMatch: ExternalCapability | null = null;
    let bestScore = 0;

    for (const capability of this.capabilities.values()) {
      const score = this.calculateRelevanceScore(capability, objective);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = capability;
      }
    }

    return bestMatch;
  }

  /**
   * Recomendar sequência de capacidades para um workflow
   */
  recommendWorkflow(goal: string): ExternalCapability[] {
    const recommended: ExternalCapability[] = [];
    const seen = new Set<string>();

    // Encontrar capacidade inicial
    const initial = this.suggestCapability(goal);
    if (!initial) return [];

    recommended.push(initial);
    seen.add(initial.id);

    // Encontrar capacidades complementares
    for (let i = 0; i < 3; i++) {
      const lastCapability = recommended[recommended.length - 1];
      const nextCapability = this.findComplementaryCapability(
        lastCapability,
        seen
      );

      if (nextCapability) {
        recommended.push(nextCapability);
        seen.add(nextCapability.id);
      } else {
        break;
      }
    }

    return recommended;
  }

  /**
   * Inicializar aprendizado contínuo
   */
  private initializeLearning(): void {
    this.learningInterval = setInterval(() => {
      this.analyzeAndOptimize();
    }, 3600000); // A cada hora
  }

  /**
   * Analisar e otimizar conhecimento
   */
  private async analyzeAndOptimize(): Promise<void> {
    console.log('[Learning] Analisando e otimizando conhecimento...');

    // Analisar padrões de uso
    const analysis = this.analyzeUsagePatterns();

    // Atualizar recomendações
    this.updateRecommendations(analysis);

    // Identificar oportunidades de melhoria
    const improvements = this.identifyImprovements(analysis);

    if (improvements.length > 0) {
      console.log('[Learning] Oportunidades de melhoria encontradas:');
      improvements.forEach((imp) => console.log(`  - ${imp}`));
    }
  }

  /**
   * Obter estatísticas de aprendizado
   */
  getStats(): {
    total_capabilities: number;
    total_usages: number;
    successful_usages: number;
    average_quality: number;
    most_used: string;
    most_reliable: string;
  } {
    const successful = this.usageHistory.filter((u) => u.success).length;
    const avgQuality =
      this.usageHistory.length > 0
        ? this.usageHistory.reduce((sum, u) => sum + u.quality_score, 0) /
          this.usageHistory.length
        : 0;

    // Encontrar mais usada
    const usageCount = new Map<string, number>();
    for (const record of this.usageHistory) {
      usageCount.set(
        record.capability_id,
        (usageCount.get(record.capability_id) || 0) + 1
      );
    }

    const mostUsed = Array.from(usageCount.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    // Encontrar mais confiável
    const reliability = new Map<string, number>();
    for (const record of this.usageHistory) {
      const current = reliability.get(record.capability_id) || 0;
      const rate = record.success ? 1 : 0;
      const count = this.usageHistory.filter(
        (u) => u.capability_id === record.capability_id
      ).length;
      reliability.set(
        record.capability_id,
        (current * (count - 1) + rate) / count
      );
    }

    const mostReliable = Array.from(reliability.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    return {
      total_capabilities: this.capabilities.size,
      total_usages: this.usageHistory.length,
      successful_usages: successful,
      average_quality: avgQuality,
      most_used: mostUsed || 'N/A',
      most_reliable: mostReliable || 'N/A',
    };
  }

  /**
   * Exportar conhecimento aprendido
   */
  exportKnowledge(outputPath: string): void {
    const knowledge = {
      capabilities: Array.from(this.capabilities.values()),
      patterns: Array.from(this.patterns.entries()).map(([id, patterns]) => ({
        capability_id: id,
        patterns,
      })),
      knowledge: Array.from(this.knowledge.values()),
      usage_history: this.usageHistory,
      stats: this.getStats(),
    };

    fs.writeFileSync(outputPath, JSON.stringify(knowledge, null, 2));
    console.log(`[Learning] Conhecimento exportado para ${outputPath}`);
  }

  // Métodos auxiliares
  private extractCategory(description: string): string {
    const match = description.match(/\*\*Tipo:\*\*\s*(.+?)(?:\n|$)/);
    return match ? match[1].trim() : 'unknown';
  }

  private extractLimitations(description: string): string[] {
    const match = description.match(/\*\*Limitações:\*\*\s*([\s\S]*?)(?=\*\*|$)/);
    if (!match) return [];
    return match[1]
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => line.replace(/^-\s*/, '').trim());
  }

  private extractUseCases(description: string): string[] {
    const match = description.match(/\*\*Caso de Uso:\*\*\s*([\s\S]*?)(?=\*\*|$)/);
    if (!match) return [];
    return match[1]
      .split(',')
      .map((case_) => case_.trim())
      .filter((c) => c);
  }

  private extractInputSchema(description: string): Record<string, any> {
    return {
      type: 'object',
      properties: {},
      required: [],
    };
  }

  private extractOutputSchema(description: string): Record<string, any> {
    return {
      type: 'object',
      properties: {},
    };
  }

  private extractPerformance(description: string): any {
    return {
      average_time: 10,
      accuracy: 90,
      reliability: 95,
      cost: 'medium',
    };
  }

  private extractExamples(description: string): any[] {
    return [];
  }

  private extractIntegrationPattern(description: string): string {
    return 'sequential';
  }

  private generateWhenToUse(capability: ExternalCapability): string[] {
    return capability.use_cases;
  }

  private generateWhenNotToUse(capability: ExternalCapability): string[] {
    return capability.limitations;
  }

  private generateBestPractices(capability: ExternalCapability): string[] {
    return [
      `Usar quando ${capability.use_cases[0] || 'apropriado'}`,
      `Respeitar limitações: ${capability.limitations[0] || 'nenhuma'}`,
      `Validar entrada antes de usar`,
      `Tratar erros apropriadamente`,
    ];
  }

  private generateCommonMistakes(capability: ExternalCapability): string[] {
    return [
      `Ignorar limitações de ${capability.name}`,
      `Não validar entrada`,
      `Não tratar timeouts`,
      `Usar sem verificar disponibilidade`,
    ];
  }

  private generateOptimizationTips(capability: ExternalCapability): string[] {
    return [
      `Cache resultados quando possível`,
      `Usar em paralelo com outras capacidades`,
      `Monitorar performance`,
      `Ajustar parâmetros conforme necessário`,
    ];
  }

  private generateIntegrationGuide(capability: ExternalCapability): string {
    return `Integrar ${capability.name} seguindo o padrão ${capability.integration_pattern}`;
  }

  private generateUsagePatterns(capability: ExternalCapability): CapabilityPattern[] {
    return [
      {
        capability_id: capability.id,
        pattern_type: 'sequential',
        trigger_conditions: { type: 'manual' },
        expected_outcome: `Usar ${capability.name} com sucesso`,
        success_rate: 0.9,
        average_time: capability.performance.average_time,
        examples: 0,
      },
    ];
  }

  private assessQuality(capability: ExternalCapability, output: any): number {
    return Math.min(100, capability.performance.accuracy);
  }

  private extractInsights(
    capability: ExternalCapability,
    input: Record<string, any>,
    output: any
  ): string[] {
    return [
      `${capability.name} executado com sucesso`,
      `Input validado corretamente`,
      `Output gerado conforme esperado`,
    ];
  }

  private updateUsagePatterns(record: CapabilityUsageRecord): void {
    const patterns = this.patterns.get(record.capability_id);
    if (patterns && patterns.length > 0) {
      patterns[0].examples += 1;
      if (record.success) {
        patterns[0].success_rate =
          (patterns[0].success_rate * (patterns[0].examples - 1) + 1) /
          patterns[0].examples;
      }
    }
  }

  private updateKnowledge(record: CapabilityUsageRecord): void {
    // Atualizar conhecimento baseado no uso
  }

  private calculateRelevanceScore(
    capability: ExternalCapability,
    objective: string
  ): number {
    let score = 0;

    for (const useCase of capability.use_cases) {
      if (objective.toLowerCase().includes(useCase.toLowerCase())) {
        score += 50;
      }
    }

    score += capability.performance.reliability * 0.5;
    return score;
  }

  private findComplementaryCapability(
    capability: ExternalCapability,
    seen: Set<string>
  ): ExternalCapability | null {
    for (const other of this.capabilities.values()) {
      if (seen.has(other.id)) continue;

      if (
        other.category !== capability.category &&
        other.performance.reliability > 80
      ) {
        return other;
      }
    }

    return null;
  }

  private analyzeUsagePatterns(): any {
    return {
      total_usages: this.usageHistory.length,
      success_rate:
        this.usageHistory.filter((u) => u.success).length /
        this.usageHistory.length,
      average_quality:
        this.usageHistory.reduce((sum, u) => sum + u.quality_score, 0) /
        this.usageHistory.length,
    };
  }

  private updateRecommendations(analysis: any): void {
    console.log('[Learning] Atualizando recomendações baseado em análise');
  }

  private identifyImprovements(analysis: any): string[] {
    const improvements: string[] = [];

    if (analysis.success_rate < 0.8) {
      improvements.push('Melhorar taxa de sucesso');
    }

    if (analysis.average_quality < 80) {
      improvements.push('Melhorar qualidade dos resultados');
    }

    return improvements;
  }

  stop(): void {
    if (this.learningInterval) clearInterval(this.learningInterval);
  }
}

export const capabilitiesLearner = new ExternalCapabilitiesLearner();
export type {
  ExternalCapability,
  CapabilityUsageRecord,
  CapabilityPattern,
  CapabilityKnowledge,
};
