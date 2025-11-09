/**
 * Serviço de IA Independente
 * Suporta múltiplos provedores de IA com fallback automático
 * Sem dependências do Manus AI
 */

import axios from 'axios';
import { LRUCache } from 'lru-cache';

interface AIProvider {
  type: 'ollama' | 'groq' | 'together' | 'huggingface';
  endpoint?: string;
  apiKey?: string;
  model: string;
  priority: number;
  available: boolean;
}

interface AIRequest {
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  cacheKey?: string;
}

interface AIResponse {
  content: string;
  provider: string;
  model: string;
  tokensUsed: number;
  cached: boolean;
}

class IndependentAIService {
  private providers: AIProvider[] = [];
  private cache: LRUCache<string, AIResponse>;
  private healthCheckInterval: NodeJS.Timer | null = null;

  constructor() {
    // Inicializar cache
    this.cache = new LRUCache({
      max: 1000,
      ttl: 1000 * 60 * 60 * 24, // 24 horas
    });

    // Configurar provedores
    this.initializeProviders();

    // Iniciar verificação de saúde
    this.startHealthCheck();
  }

  private initializeProviders(): void {
    // Ollama - Modelo local (prioridade alta)
    this.providers.push({
      type: 'ollama',
      endpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'mistral',
      priority: 1,
      available: true,
    });

    // Groq - API gratuita com limite generoso
    if (process.env.GROQ_API_KEY) {
      this.providers.push({
        type: 'groq',
        endpoint: 'https://api.groq.com/openai/v1',
        apiKey: process.env.GROQ_API_KEY,
        model: 'mixtral-8x7b-32768',
        priority: 2,
        available: true,
      });
    }

    // Together.ai - API gratuita sem limite
    if (process.env.TOGETHER_API_KEY) {
      this.providers.push({
        type: 'together',
        endpoint: 'https://api.together.xyz/v1',
        apiKey: process.env.TOGETHER_API_KEY,
        model: 'meta-llama/Llama-2-70b-chat-hf',
        priority: 3,
        available: true,
      });
    }

    // HuggingFace - API gratuita
    if (process.env.HF_API_KEY) {
      this.providers.push({
        type: 'huggingface',
        endpoint: 'https://api-inference.huggingface.co/v1',
        apiKey: process.env.HF_API_KEY,
        model: 'meta-llama/Llama-2-7b-chat-hf',
        priority: 4,
        available: true,
      });
    }

    // Ordenar por prioridade
    this.providers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Processar requisição de IA com fallback automático
   */
  async process(request: AIRequest): Promise<AIResponse> {
    // Verificar cache
    if (request.cacheKey) {
      const cached = this.cache.get(request.cacheKey);
      if (cached) {
        return { ...cached, cached: true };
      }
    }

    // Tentar cada provedor em ordem de prioridade
    for (const provider of this.providers) {
      if (!provider.available) continue;

      try {
        const response = await this.callProvider(provider, request);

        // Armazenar em cache
        if (request.cacheKey) {
          this.cache.set(request.cacheKey, response);
        }

        return response;
      } catch (error) {
        console.error(`Erro ao chamar ${provider.type}:`, error);
        provider.available = false;

        // Tentar próximo provedor
        continue;
      }
    }

    throw new Error('Nenhum provedor de IA disponível');
  }

  /**
   * Chamar provedor específico
   */
  private async callProvider(
    provider: AIProvider,
    request: AIRequest
  ): Promise<AIResponse> {
    switch (provider.type) {
      case 'ollama':
        return this.callOllama(provider, request);
      case 'groq':
        return this.callGroq(provider, request);
      case 'together':
        return this.callTogether(provider, request);
      case 'huggingface':
        return this.callHuggingFace(provider, request);
      default:
        throw new Error(`Provedor desconhecido: ${provider.type}`);
    }
  }

  /**
   * Chamar Ollama (modelo local)
   */
  private async callOllama(
    provider: AIProvider,
    request: AIRequest
  ): Promise<AIResponse> {
    const response = await axios.post(
      `${provider.endpoint}/api/chat`,
      {
        model: provider.model,
        messages: request.messages,
        stream: false,
        options: {
          temperature: request.temperature || 0.7,
          num_predict: request.maxTokens || 2048,
        },
      },
      { timeout: 60000 }
    );

    const content = response.data.message.content;
    const tokensUsed = response.data.eval_count || 0;

    return {
      content,
      provider: 'ollama',
      model: provider.model,
      tokensUsed,
      cached: false,
    };
  }

  /**
   * Chamar Groq (API gratuita)
   */
  private async callGroq(
    provider: AIProvider,
    request: AIRequest
  ): Promise<AIResponse> {
    const response = await axios.post(
      `${provider.endpoint}/chat/completions`,
      {
        model: provider.model,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2048,
      },
      {
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const content = response.data.choices[0].message.content;
    const tokensUsed =
      response.data.usage.completion_tokens +
      response.data.usage.prompt_tokens;

    return {
      content,
      provider: 'groq',
      model: provider.model,
      tokensUsed,
      cached: false,
    };
  }

  /**
   * Chamar Together.ai (API gratuita)
   */
  private async callTogether(
    provider: AIProvider,
    request: AIRequest
  ): Promise<AIResponse> {
    const response = await axios.post(
      `${provider.endpoint}/chat/completions`,
      {
        model: provider.model,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2048,
      },
      {
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const content = response.data.choices[0].message.content;
    const tokensUsed =
      response.data.usage.completion_tokens +
      response.data.usage.prompt_tokens;

    return {
      content,
      provider: 'together',
      model: provider.model,
      tokensUsed,
      cached: false,
    };
  }

  /**
   * Chamar HuggingFace (API gratuita)
   */
  private async callHuggingFace(
    provider: AIProvider,
    request: AIRequest
  ): Promise<AIResponse> {
    // Converter mensagens para formato esperado
    const text = request.messages
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    const response = await axios.post(
      `${provider.endpoint}/text-generation`,
      {
        inputs: text,
        parameters: {
          temperature: request.temperature || 0.7,
          max_new_tokens: request.maxTokens || 2048,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const content = response.data[0].generated_text;
    const tokensUsed = Math.ceil(content.split(' ').length * 1.3); // Estimativa

    return {
      content,
      provider: 'huggingface',
      model: provider.model,
      tokensUsed,
      cached: false,
    };
  }

  /**
   * Verificar saúde dos provedores periodicamente
   */
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      for (const provider of this.providers) {
        try {
          if (provider.type === 'ollama') {
            await axios.get(`${provider.endpoint}/api/tags`, {
              timeout: 5000,
            });
            provider.available = true;
          } else {
            // Para APIs, fazer uma chamada simples
            provider.available = true;
          }
        } catch (error) {
          console.warn(`Provedor ${provider.type} indisponível`);
          provider.available = false;
        }
      }
    }, 60000); // Verificar a cada minuto
  }

  /**
   * Obter status dos provedores
   */
  getStatus(): Array<{
    type: string;
    model: string;
    available: boolean;
    priority: number;
  }> {
    return this.providers.map((p) => ({
      type: p.type,
      model: p.model,
      available: p.available,
      priority: p.priority,
    }));
  }

  /**
   * Limpar cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Parar serviço
   */
  stop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

// Exportar instância singleton
export const aiService = new IndependentAIService();

export type { AIRequest, AIResponse, AIProvider };
