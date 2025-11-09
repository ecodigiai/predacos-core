/**
 * Serviço de Armazenamento Distribuído
 * Implementa replicação P2P, sincronização e backup automático
 * Totalmente independente de serviços em nuvem
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import axios from 'axios';

interface StorageNode {
  id: string;
  endpoint: string;
  available: boolean;
  lastHeartbeat: Date;
  capacity: number; // em bytes
  used: number; // em bytes
  replicationFactor: number;
}

interface StoredFile {
  id: string;
  path: string;
  hash: string;
  size: number;
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
  replicas: string[]; // IDs dos nós que contêm cópias
  encrypted: boolean;
  metadata: Record<string, any>;
}

interface ReplicationJob {
  fileId: string;
  sourceNode: string;
  targetNode: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

class DistributedStorageService {
  private nodes: Map<string, StorageNode> = new Map();
  private files: Map<string, StoredFile> = new Map();
  private replicationQueue: ReplicationJob[] = [];
  private syncInterval: NodeJS.Timer | null = null;
  private heartbeatInterval: NodeJS.Timer | null = null;
  private localStoragePath: string;
  private replicationFactor: number = 3; // Quantas cópias manter

  constructor(storagePath: string = './data/storage') {
    this.localStoragePath = storagePath;
    this.initializeLocalStorage();
    this.startHeartbeat();
    this.startReplication();
  }

  private initializeLocalStorage(): void {
    if (!fs.existsSync(this.localStoragePath)) {
      fs.mkdirSync(this.localStoragePath, { recursive: true });
    }

    // Registrar este nó como node local
    const nodeId = `node-${crypto.randomBytes(8).toString('hex')}`;
    this.nodes.set(nodeId, {
      id: nodeId,
      endpoint: process.env.STORAGE_NODE_ENDPOINT || 'http://localhost:3001',
      available: true,
      lastHeartbeat: new Date(),
      capacity: this.getStorageCapacity(),
      used: this.getStorageUsed(),
      replicationFactor: this.replicationFactor,
    });
  }

  /**
   * Armazenar arquivo com replicação automática
   */
  async storeFile(
    filePath: string,
    fileContent: Buffer,
    mimeType: string = 'application/octet-stream',
    metadata: Record<string, any> = {}
  ): Promise<StoredFile> {
    const fileId = crypto.randomUUID();
    const fileHash = crypto
      .createHash('sha256')
      .update(fileContent)
      .digest('hex');

    // Salvar localmente
    const localPath = path.join(this.localStoragePath, fileId);
    fs.writeFileSync(localPath, fileContent);

    // Criar registro do arquivo
    const storedFile: StoredFile = {
      id: fileId,
      path: filePath,
      hash: fileHash,
      size: fileContent.length,
      mimeType,
      createdAt: new Date(),
      updatedAt: new Date(),
      replicas: [Array.from(this.nodes.keys())[0]], // Começar com nó local
      encrypted: false,
      metadata,
    };

    this.files.set(fileId, storedFile);

    // Iniciar replicação em background
    this.replicateFile(fileId);

    return storedFile;
  }

  /**
   * Recuperar arquivo
   */
  async getFile(fileId: string): Promise<Buffer | null> {
    const file = this.files.get(fileId);
    if (!file) return null;

    const localPath = path.join(this.localStoragePath, fileId);

    // Tentar ler localmente
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath);
    }

    // Tentar recuperar de réplica
    for (const nodeId of file.replicas) {
      const node = this.nodes.get(nodeId);
      if (!node || !node.available) continue;

      try {
        const response = await axios.get(
          `${node.endpoint}/api/storage/file/${fileId}`,
          { responseType: 'arraybuffer' }
        );
        
        // Salvar localmente para cache
        fs.writeFileSync(localPath, response.data);
        return Buffer.from(response.data);
      } catch (error) {
        console.error(`Erro ao recuperar de ${nodeId}:`, error);
      }
    }

    return null;
  }

  /**
   * Deletar arquivo
   */
  async deleteFile(fileId: string): Promise<boolean> {
    const file = this.files.get(fileId);
    if (!file) return false;

    // Deletar localmente
    const localPath = path.join(this.localStoragePath, fileId);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }

    // Deletar de réplicas
    for (const nodeId of file.replicas) {
      const node = this.nodes.get(nodeId);
      if (!node || !node.available) continue;

      try {
        await axios.delete(`${node.endpoint}/api/storage/file/${fileId}`);
      } catch (error) {
        console.error(`Erro ao deletar de ${nodeId}:`, error);
      }
    }

    this.files.delete(fileId);
    return true;
  }

  /**
   * Replicar arquivo para outros nós
   */
  private async replicateFile(fileId: string): Promise<void> {
    const file = this.files.get(fileId);
    if (!file) return;

    const availableNodes = Array.from(this.nodes.values()).filter(
      (n) => n.available && !file.replicas.includes(n.id)
    );

    // Manter replicationFactor cópias
    const neededReplicas = Math.max(
      0,
      this.replicationFactor - file.replicas.length
    );

    for (let i = 0; i < neededReplicas && i < availableNodes.length; i++) {
      const targetNode = availableNodes[i];

      const job: ReplicationJob = {
        fileId,
        sourceNode: file.replicas[0],
        targetNode: targetNode.id,
        status: 'pending',
        progress: 0,
      };

      this.replicationQueue.push(job);
    }
  }

  /**
   * Processar fila de replicação
   */
  private async processReplicationQueue(): Promise<void> {
    for (const job of this.replicationQueue) {
      if (job.status === 'in_progress') continue;

      try {
        job.status = 'in_progress';
        job.progress = 0;

        const file = this.files.get(job.fileId);
        if (!file) {
          job.status = 'failed';
          job.error = 'Arquivo não encontrado';
          continue;
        }

        const sourceNode = this.nodes.get(job.sourceNode);
        const targetNode = this.nodes.get(job.targetNode);

        if (!sourceNode || !targetNode) {
          job.status = 'failed';
          job.error = 'Nó não encontrado';
          continue;
        }

        // Recuperar arquivo
        const fileContent = await this.getFile(job.fileId);
        if (!fileContent) {
          job.status = 'failed';
          job.error = 'Não foi possível recuperar arquivo';
          continue;
        }

        // Enviar para nó alvo
        await axios.post(
          `${targetNode.endpoint}/api/storage/replicate`,
          {
            fileId: job.fileId,
            content: fileContent.toString('base64'),
            metadata: file,
          }
        );

        job.progress = 100;
        job.status = 'completed';

        // Atualizar registro de réplicas
        if (!file.replicas.includes(job.targetNode)) {
          file.replicas.push(job.targetNode);
        }
      } catch (error) {
        job.status = 'failed';
        job.error = String(error);
      }
    }

    // Remover jobs completados
    this.replicationQueue = this.replicationQueue.filter(
      (j) => j.status !== 'completed'
    );
  }

  /**
   * Registrar nó remoto
   */
  registerNode(nodeId: string, endpoint: string): void {
    this.nodes.set(nodeId, {
      id: nodeId,
      endpoint,
      available: true,
      lastHeartbeat: new Date(),
      capacity: 0,
      used: 0,
      replicationFactor: this.replicationFactor,
    });
  }

  /**
   * Verificar saúde dos nós
   */
  private async startHeartbeat(): Promise<void> {
    this.heartbeatInterval = setInterval(async () => {
      for (const [nodeId, node] of this.nodes) {
        try {
          const response = await axios.get(`${node.endpoint}/api/health`, {
            timeout: 5000,
          });

          node.available = true;
          node.lastHeartbeat = new Date();
          node.capacity = response.data.capacity || 0;
          node.used = response.data.used || 0;
        } catch (error) {
          node.available = false;
          console.warn(`Nó ${nodeId} indisponível`);
        }
      }
    }, 30000); // A cada 30 segundos
  }

  /**
   * Iniciar processamento de replicação
   */
  private async startReplication(): Promise<void> {
    this.syncInterval = setInterval(
      () => this.processReplicationQueue(),
      5000 // A cada 5 segundos
    );
  }

  /**
   * Fazer backup completo
   */
  async backupAll(backupPath: string): Promise<void> {
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    // Copiar todos os arquivos
    for (const [fileId, file] of this.files) {
      const sourcePath = path.join(this.localStoragePath, fileId);
      const destPath = path.join(backupPath, fileId);

      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
      }
    }

    // Salvar metadados
    const metadata = {
      timestamp: new Date(),
      files: Array.from(this.files.values()),
      nodes: Array.from(this.nodes.values()),
    };

    fs.writeFileSync(
      path.join(backupPath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    console.log(`Backup completo realizado em ${backupPath}`);
  }

  /**
   * Restaurar de backup
   */
  async restoreFromBackup(backupPath: string): Promise<void> {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Caminho de backup não encontrado: ${backupPath}`);
    }

    // Restaurar metadados
    const metadataPath = path.join(backupPath, 'metadata.json');
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

      for (const file of metadata.files) {
        this.files.set(file.id, file);
      }
    }

    // Restaurar arquivos
    const files = fs.readdirSync(backupPath);
    for (const file of files) {
      if (file === 'metadata.json') continue;

      const sourcePath = path.join(backupPath, file);
      const destPath = path.join(this.localStoragePath, file);

      fs.copyFileSync(sourcePath, destPath);
    }

    console.log(`Backup restaurado de ${backupPath}`);
  }

  /**
   * Obter estatísticas
   */
  getStats(): {
    totalFiles: number;
    totalSize: number;
    nodes: number;
    availableNodes: number;
    replicationJobs: number;
    averageReplicationFactor: number;
  } {
    let totalSize = 0;
    let totalReplicas = 0;

    for (const file of this.files.values()) {
      totalSize += file.size;
      totalReplicas += file.replicas.length;
    }

    const availableNodes = Array.from(this.nodes.values()).filter(
      (n) => n.available
    ).length;

    return {
      totalFiles: this.files.size,
      totalSize,
      nodes: this.nodes.size,
      availableNodes,
      replicationJobs: this.replicationQueue.length,
      averageReplicationFactor:
        this.files.size > 0 ? totalReplicas / this.files.size : 0,
    };
  }

  /**
   * Parar serviço
   */
  stop(): void {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.syncInterval) clearInterval(this.syncInterval);
  }

  // Métodos auxiliares
  private getStorageCapacity(): number {
    // Retornar capacidade em bytes (ex: 100GB)
    return 100 * 1024 * 1024 * 1024;
  }

  private getStorageUsed(): number {
    let used = 0;
    const files = fs.readdirSync(this.localStoragePath);

    for (const file of files) {
      const filePath = path.join(this.localStoragePath, file);
      const stats = fs.statSync(filePath);
      used += stats.size;
    }

    return used;
  }
}

export const storageService = new DistributedStorageService();
export type { StorageNode, StoredFile, ReplicationJob };
