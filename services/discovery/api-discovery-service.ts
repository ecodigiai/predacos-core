/**
 * Serviço de Auto-Descoberta de APIs e Ferramentas
 * Descobre automaticamente APIs públicas, ferramentas e serviços úteis
 * Valida e integra descobertas ao ecossistema
 */

import axios from 'axios';
import { aiService } from '../ai/independent-ai-service';

interface DiscoveredAPI {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  documentation: string;
  authentication: 'none' | 'api-key' | 'oauth' | 'basic';
  freeTier: boolean;
  rateLimit: string;
  categories: string[];
  endpoints: Array<{
    path: string;
    method: string;
    description: string;
  }>;
  reliability: number; // 0-100
  lastChecked: Date;
  status: 'active' | 'inactive' | 'deprecated';
}

interface DiscoverySource {
  type: 'github' | 'rapidapi' | 'postman' | 'openapi' | 'crawler';
  name: string;
  enabled: boolean;
  config: Record<string, any>;
}

class APIDiscoveryService {
  private discoveredAPIs: Map<string, DiscoveredAPI> = new Map();
  private sources: DiscoverySource[] = [];
  private discoveryInterval: NodeJS.Timer | null = null;

  constructor() {
    this.initializeSources();
  }

  private initializeSources(): void {
    // GitHub - Descobrir repositórios com APIs
    this.sources.push({
      type: 'github',
      name: 'GitHub API Discovery',
      enabled: !!process.env.GITHUB_TOKEN,
      config: {
        token: process.env.GITHUB_TOKEN,
        topics: ['api', 'rest', 'graphql', 'sdk'],
        minStars: 100,
        language: 'javascript',
      },
    });

    // RapidAPI - Marketplace de APIs
    this.sources.push({
      type: 'rapidapi',
      name: 'RapidAPI Marketplace',
      enabled: !!process.env.RAPIDAPI_KEY,
      config: {
        apiKey: process.env.RAPIDAPI_KEY,
        categories: ['development', 'data', 'tools', 'weather', 'news'],
        minRating: 4.0,
      },
    });

    // Postman - Coleções públicas
    this.sources.push({
      type: 'postman',
      name: 'Postman API Network',
      enabled: !!process.env.POSTMAN_API_KEY,
      config: {
        apiKey: process.env.POSTMAN_API_KEY,
        workspaceId: process.env.POSTMAN_WORKSPACE_ID,
      },
    });

    // OpenAPI.ai - Registro de APIs OpenAPI
    this.sources.push({
      type: 'openapi',
      name: 'OpenAPI Registry',
      enabled: true,
      config: {
        endpoint: 'https://api.apis.guru/v1',
        categories: ['development', 'data', 'tools'],
      },
    });

    // Crawler - Descobrir APIs via web crawling
    this.sources.push({
      type: 'crawler',
      name: 'Web API Crawler',
      enabled: true,
      config: {
        keywords: ['api', 'rest', 'graphql', 'webhook'],
        maxDepth: 3,
      },
    });
  }

  /**
   * Iniciar descoberta automática periódica
   */
  startAutoDiscovery(intervalHours: number = 24): void {
    this.discoveryInterval = setInterval(
      () => this.discoverAPIs(),
      intervalHours * 60 * 60 * 1000
    );

    // Executar descoberta imediatamente
    this.discoverAPIs();
  }

  /**
   * Descobrir APIs de todas as fontes
   */
  async discoverAPIs(): Promise<DiscoveredAPI[]> {
    const discovered: DiscoveredAPI[] = [];

    for (const source of this.sources) {
      if (!source.enabled) continue;

      try {
        const apis = await this.discoverFromSource(source);
        discovered.push(...apis);
      } catch (error) {
        console.error(`Erro ao descobrir de ${source.name}:`, error);
      }
    }

    // Validar e armazenar APIs descobertas
    for (const api of discovered) {
      await this.validateAndStoreAPI(api);
    }

    return discovered;
  }

  /**
   * Descobrir de fonte específica
   */
  private async discoverFromSource(
    source: DiscoverySource
  ): Promise<DiscoveredAPI[]> {
    switch (source.type) {
      case 'github':
        return this.discoverFromGitHub(source.config);
      case 'rapidapi':
        return this.discoverFromRapidAPI(source.config);
      case 'postman':
        return this.discoverFromPostman(source.config);
      case 'openapi':
        return this.discoverFromOpenAPI(source.config);
      case 'crawler':
        return this.discoverFromCrawler(source.config);
      default:
        return [];
    }
  }

  /**
   * Descobrir APIs do GitHub
   */
  private async discoverFromGitHub(config: Record<string, any>): Promise<DiscoveredAPI[]> {
    const apis: DiscoveredAPI[] = [];

    try {
      const response = await axios.get('https://api.github.com/search/repositories', {
        params: {
          q: `topic:api stars:>${config.minStars} language:${config.language}`,
          sort: 'stars',
          order: 'desc',
          per_page: 30,
        },
        headers: {
          Authorization: `token ${config.token}`,
        },
      });

      for (const repo of response.data.items) {
        // Tentar obter informações da API
        const apiInfo = await this.extractAPIInfo(repo);
        if (apiInfo) {
          apis.push(apiInfo);
        }
      }
    } catch (error) {
      console.error('Erro ao descobrir do GitHub:', error);
    }

    return apis;
  }

  /**
   * Descobrir APIs do RapidAPI
   */
  private async discoverFromRapidAPI(config: Record<string, any>): Promise<DiscoveredAPI[]> {
    const apis: DiscoveredAPI[] = [];

    try {
      const response = await axios.get('https://rapidapi.io/api/apis/search', {
        params: {
          categories: config.categories.join(','),
          minRating: config.minRating,
          limit: 50,
        },
        headers: {
          'X-RapidAPI-Key': config.apiKey,
        },
      });

      for (const api of response.data.results) {
        apis.push({
          id: `rapidapi-${api.id}`,
          name: api.name,
          description: api.description,
          baseUrl: api.baseUrl || '',
          documentation: api.documentationUrl || '',
          authentication: 'api-key',
          freeTier: api.freeTier,
          rateLimit: api.rateLimit || 'unlimited',
          categories: api.categories || [],
          endpoints: [],
          reliability: api.rating * 20, // Converter rating 1-5 para 0-100
          lastChecked: new Date(),
          status: 'active',
        });
      }
    } catch (error) {
      console.error('Erro ao descobrir do RapidAPI:', error);
    }

    return apis;
  }

  /**
   * Descobrir APIs do Postman
   */
  private async discoverFromPostman(config: Record<string, any>): Promise<DiscoveredAPI[]> {
    const apis: DiscoveredAPI[] = [];

    try {
      const response = await axios.get(
        `https://api.getpostman.com/workspaces/${config.workspaceId}/collections`,
        {
          headers: {
            'X-API-Key': config.apiKey,
          },
        }
      );

      for (const collection of response.data.collections) {
        // Extrair informações da coleção
        const api: DiscoveredAPI = {
          id: `postman-${collection.id}`,
          name: collection.name,
          description: collection.description || '',
          baseUrl: this.extractBaseUrl(collection) || '',
          documentation: collection.link || '',
          authentication: 'none',
          freeTier: true,
          rateLimit: 'unlimited',
          categories: ['api'],
          endpoints: this.extractEndpoints(collection),
          reliability: 100,
          lastChecked: new Date(),
          status: 'active',
        };
        apis.push(api);
      }
    } catch (error) {
      console.error('Erro ao descobrir do Postman:', error);
    }

    return apis;
  }

  /**
   * Descobrir APIs do OpenAPI Registry
   */
  private async discoverFromOpenAPI(config: Record<string, any>): Promise<DiscoveredAPI[]> {
    const apis: DiscoveredAPI[] = [];

    try {
      const response = await axios.get(`${config.endpoint}/list.json`);

      // Limitar a 50 primeiras APIs
      const entries = Object.entries(response.data.apis).slice(0, 50);

      for (const [key, value] of entries) {
        const api: DiscoveredAPI = {
          id: `openapi-${key}`,
          name: (value as any).title || key,
          description: (value as any).description || '',
          baseUrl: (value as any).url || '',
          documentation: (value as any).url || '',
          authentication: 'none',
          freeTier: true,
          rateLimit: 'unknown',
          categories: ['api'],
          endpoints: [],
          reliability: 90,
          lastChecked: new Date(),
          status: 'active',
        };
        apis.push(api);
      }
    } catch (error) {
      console.error('Erro ao descobrir do OpenAPI:', error);
    }

    return apis;
  }

  /**
   * Descobrir APIs via web crawling
   */
  private async discoverFromCrawler(config: Record<string, any>): Promise<DiscoveredAPI[]> {
    // Implementação simplificada - em produção seria mais sofisticada
    const apis: DiscoveredAPI[] = [];

    const seedURLs = [
      'https://github.com/public-apis/public-apis',
      'https://apilist.fun',
      'https://www.programmableweb.com/apis/directory',
    ];

    for (const url of seedURLs) {
      try {
        const response = await axios.get(url, { timeout: 10000 });
        // Aqui você faria parsing do HTML para extrair APIs
        // Implementação simplificada para demonstração
      } catch (error) {
        console.error(`Erro ao fazer crawl de ${url}:`, error);
      }
    }

    return apis;
  }

  /**
   * Validar e armazenar API descoberta
   */
  private async validateAndStoreAPI(api: DiscoveredAPI): Promise<void> {
    try {
      // Validar se a API está acessível
      if (api.baseUrl) {
        await axios.head(api.baseUrl, { timeout: 5000 });
        api.status = 'active';
      }

      // Usar IA para melhorar descrição
      if (!api.description || api.description.length < 10) {
        const response = await aiService.process({
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em APIs. Gere uma descrição breve e útil.',
            },
            {
              role: 'user',
              content: `Gere uma descrição para a API: ${api.name}`,
            },
          ],
          maxTokens: 100,
        });
        api.description = response.content;
      }

      // Armazenar
      this.discoveredAPIs.set(api.id, api);

      console.log(`API descoberta e validada: ${api.name}`);
    } catch (error) {
      console.warn(`Falha ao validar API ${api.name}:`, error);
      api.status = 'inactive';
      this.discoveredAPIs.set(api.id, api);
    }
  }

  /**
   * Obter APIs descobertas por categoria
   */
  getAPIsByCategory(category: string): DiscoveredAPI[] {
    return Array.from(this.discoveredAPIs.values()).filter((api) =>
      api.categories.includes(category)
    );
  }

  /**
   * Obter APIs ativas
   */
  getActiveAPIs(): DiscoveredAPI[] {
    return Array.from(this.discoveredAPIs.values()).filter(
      (api) => api.status === 'active'
    );
  }

  /**
   * Obter estatísticas de descoberta
   */
  getStats(): {
    total: number;
    active: number;
    categories: Record<string, number>;
  } {
    const apis = Array.from(this.discoveredAPIs.values());
    const categories: Record<string, number> = {};

    for (const api of apis) {
      for (const cat of api.categories) {
        categories[cat] = (categories[cat] || 0) + 1;
      }
    }

    return {
      total: apis.length,
      active: apis.filter((a) => a.status === 'active').length,
      categories,
    };
  }

  /**
   * Parar descoberta automática
   */
  stop(): void {
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
    }
  }

  // Métodos auxiliares
  private extractAPIInfo(repo: any): DiscoveredAPI | null {
    // Tentar extrair informações de API do repositório
    if (!repo.homepage && !repo.description) return null;

    return {
      id: `github-${repo.id}`,
      name: repo.name,
      description: repo.description || '',
      baseUrl: repo.homepage || '',
      documentation: repo.html_url,
      authentication: 'none',
      freeTier: true,
      rateLimit: 'unknown',
      categories: repo.topics || ['api'],
      endpoints: [],
      reliability: 85,
      lastChecked: new Date(),
      status: 'active',
    };
  }

  private extractBaseUrl(collection: any): string | null {
    // Extrair URL base da coleção Postman
    return collection.item?.[0]?.request?.url?.raw || null;
  }

  private extractEndpoints(collection: any): Array<{ path: string; method: string; description: string }> {
    // Extrair endpoints da coleção Postman
    const endpoints = [];
    if (collection.item) {
      for (const item of collection.item) {
        if (item.request) {
          endpoints.push({
            path: item.request.url?.path?.join('/') || '',
            method: item.request.method || 'GET',
            description: item.name || '',
          });
        }
      }
    }
    return endpoints;
  }
}

export const discoveryService = new APIDiscoveryService();
export type { DiscoveredAPI, DiscoverySource };
