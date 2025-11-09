# 🚀 Guia Rápido de Início - Ecossistema Predacos

## ⚡ Início Rápido (5 minutos)

### 1. Acesse a Interface Web

**URL do Projeto:** Disponível após inicialização  
**Credenciais:** ecodigiai@gmail.com / Teste@931218

### 2. Faça Login

Clique em "Entrar" no canto superior direito e use suas credenciais Manus OAuth.

### 3. Digite Seu Primeiro Comando

No campo principal, digite algo como:

```
Crie um app de lista de tarefas simples
```

Pressione "Executar" e aguarde o Jarvis processar!

---

## 📦 Recursos Disponíveis

### Repositórios GitHub

**Principal (Backend):**
- URL: https://github.com/ecodigiai/predacos-core
- Contém: Núcleo Jarvis, agentes, sistema de aprendizado

**Interface Web:**
- URL: https://github.com/ecodigiai/predacos-interface
- Contém: Interface React com tRPC

### Notion Dashboard

**URL:** https://www.notion.so/2a6e80dba4c981d4ae32cdf1e17edeb8

Visualize:
- Status do sistema em tempo real
- Métricas de evolução
- Changelog automático
- Guias de ferramentas descobertas

### Firebase Project

**Project ID:** predacos-dev (ou conforme configurado)

Serviços ativos:
- ✅ Firestore Database
- ✅ Cloud Functions
- ✅ Hosting
- ✅ Storage
- ✅ Authentication

---

## 🎯 Comandos de Exemplo

### Criar Aplicativos

```
Crie um app de notas com React Native
```

```
Desenvolva um aplicativo de controle financeiro pessoal
```

```
Preciso de um app para rastrear hábitos diários
```

### Criar Sites

```
Crie um site para meu restaurante com menu online
```

```
Desenvolva uma landing page para meu produto SaaS
```

```
Preciso de um portfólio profissional com galeria
```

### Otimizar Código

```
Melhore a performance do meu app
```

```
Otimize o código para reduzir o tempo de carregamento
```

```
Refatore o componente X para melhor legibilidade
```

### Integrar Serviços

```
Conecte meu formulário com Google Sheets
```

```
Configure envio de emails automáticos
```

```
Integre autenticação com Google OAuth
```

### Pesquisar Ferramentas

```
Quais são as melhores ferramentas gratuitas para envio de emails?
```

```
Pesquise APIs de pagamento com plano gratuito
```

```
Encontre serviços de hospedagem gratuitos para Node.js
```

---

## 🔧 Configuração Rápida (Desenvolvimento Local)

### Pré-requisitos

- Node.js 20+
- npm 10+
- Git

### Clonar e Instalar

```bash
# Backend
git clone https://github.com/ecodigiai/predacos-core.git
cd predacos-core
npm install
cp .env.example .env
# Edite .env com suas credenciais

# Interface
git clone https://github.com/ecodigiai/predacos-interface.git
cd predacos-interface
pnpm install
pnpm db:push
```

### Iniciar Localmente

```bash
# Backend
cd predacos-core
npm run start

# Interface (em outro terminal)
cd predacos-interface
pnpm dev
```

Acesse: http://localhost:3000

---

## 📊 Monitoramento

### Métricas Principais

**Taxa de Sucesso:** Percentual de comandos executados com sucesso  
**Agentes Ativos:** Número de agentes trabalhando no momento  
**Comandos Processados:** Total de comandos desde o início  

### Onde Ver

- **Interface Web:** Dashboard na página inicial
- **Notion:** Dashboard completo com gráficos
- **Firebase Console:** Logs detalhados no Firestore

---

## 🆘 Solução de Problemas

### Comando não está sendo processado

1. Verifique se você está logado
2. Confirme que o comando está em português
3. Tente reformular de forma mais específica
4. Verifique o histórico para ver se há erros

### Interface não carrega

1. Limpe o cache do navegador
2. Verifique se o servidor está rodando (pnpm dev)
3. Confirme que as variáveis de ambiente estão corretas
4. Veja os logs no console do navegador (F12)

### Erro de autenticação

1. Faça logout e login novamente
2. Limpe cookies do domínio
3. Verifique se as credenciais OAuth estão corretas
4. Confirme que o Firebase Auth está habilitado

### Agentes não estão respondendo

1. Verifique se o backend está rodando
2. Confirme que as Cloud Functions estão deployadas
3. Veja os logs no Firebase Console
4. Reinicie os serviços locais

---

## 📚 Próximos Passos

### Aprender Mais

1. Leia a **Documentação Completa** (`ECOSSISTEMA_PREDACOS_DOCUMENTACAO.md`)
2. Explore o **Notion Dashboard** para ver métricas
3. Revise o código no **GitHub** para entender a arquitetura
4. Teste diferentes tipos de comandos

### Contribuir

1. Reporte bugs via GitHub Issues
2. Sugira novas funcionalidades
3. Contribua com código via Pull Requests
4. Melhore a documentação

### Expandir

1. Adicione novos agentes especializados
2. Integre novas ferramentas descobertas
3. Customize a interface para suas necessidades
4. Crie workflows automatizados personalizados

---

## 🔗 Links Úteis

- **Repositório Principal:** https://github.com/ecodigiai/predacos-core
- **Repositório Interface:** https://github.com/ecodigiai/predacos-interface
- **Notion Dashboard:** https://www.notion.so/2a6e80dba4c981d4ae32cdf1e17edeb8
- **Email Suporte:** ecodigiai@gmail.com

---

## 🎉 Dicas para Melhores Resultados

✅ **Seja específico:** "Crie um app de tarefas com categorias e notificações"  
✅ **Use linguagem natural:** Não precisa ser técnico  
✅ **Itere gradualmente:** Comece simples, adicione complexidade depois  
✅ **Forneça contexto:** Mencione projetos anteriores se relevante  
✅ **Revise os resultados:** Sempre verifique o código gerado  

---

*Desenvolvido com ❤️ usando Manus AI*
