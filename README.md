# 🛡️ CodeReviewer — Análise Inteligente de Código & Boas Práticas

> Plataforma web para análise instantânea de código-fonte, identificação de vulnerabilidades (OWASP), refatoração de *code smells* (Clean Code), otimização algorítmica (Performance) e clonagem direta de repositórios do GitHub.

---

## 📌 Sumário

* [Sobre o Projeto](#-sobre-o-projeto)
* [Público-Alvo](#-público-alvo)
* [Principais Funcionalidades](#-principais-funcionalidades)
* [Integração com o GitHub](#-integração-com-o-github)
* [Arquitetura & Tecnologias](#-arquitetura--tecnologias)
* [Privacidade & Armazenamento Local](#-privacidade--armazenamento-local)
* [Como Executar o Projeto](#-como-executar-o-projeto)
* [Estrutura de Diretórios](#-estrutura-de-diretórios)
* [Licença](#-licença)

---

## 💡 Sobre o Projeto

O **CodeReviewer** foi concebido para resolver um dos maiores gargalos no aprendizado e no ciclo de desenvolvimento de software: o acesso a revisões de código didáticas, objetivas e imediatas.

Em vez de apenas acusar erros sintáticos como os linters tradicionais, o CodeReviewer analisa o código sob três perspectivas fundamentais de engenharia de software:
1. **Clean Code & Boas Práticas**: Legibilidade, coesão, nomenclatura semântica, eliminação de números mágicos e aderência aos princípios SOLID.
2. **Segurança (AppSec)**: Prevenção contra as principais falhas do OWASP Top 10 (SQL Injection, vazamento de credenciais/tokens, execução dinâmica insegura, exposição de *stack traces* sensíveis).
3. **Performance**: Análise de complexidade assintótica (Notação Big-O), eliminação de loops quadráticos $O(N^2)$, redução de varreduras lineares e alocação eficiente de memória.

---

## 🎯 Público-Alvo

* **Estudantes e Desenvolvedores Júnior/Trainee**: Para compreender o *porquê* de cada refatoração e acessar links diretos para documentações e conceitos oficiais.
* **Desenvolvedores Plenos e Seniores**: Para obter um segundo olhar ágil antes da abertura de Pull Requests, checando regressões de performance e brechas de segurança.
* **Instrutores Técnicos e Tech Leads**: Como ferramenta didática para demonstrar padrões de refatoração (*Antes vs. Depois*) e nivelar a qualidade dos códigos do time.

---

## 🚀 Principais Funcionalidades

| Requisito | Funcionalidade | Descrição |
| :--- | :--- | :--- |
| **RF01** | **Editor Dedicado** | Área de código monospaçada (*JetBrains Mono*) com numeração de linhas, contagem de linhas e caracteres, suporte a indentação `Tab` e atalho rápido `Ctrl + Enter`. |
| **RF02** | **Multi-Linguagem** | Suporte a 12 linguagens: TypeScript, JavaScript, Python, Java, C#, Go, PHP, Rust, Ruby, C++, SQL e HTML/CSS. |
| **RF03** | **Seleção de Foco** | Alternância instantânea entre *Clean Code*, *Segurança* ou *Performance*. |
| **RF04** | **Score de Qualidade (0 a 10)** | Pontuação visual com anel dinâmico e feedback semântico categorizado (*Defesa/Eficiência*, *Manutenibilidade* e *Resiliência*). |
| **RF05** | **Top 3 Problemas Críticos** | Lista priorizada com severidade (*Alta/Crítico*, *Média/Atenção*, *Baixa/Melhoria*), linha afetada, regra violada e impacto real. |
| **RF06** | **Código Refatorado & Diff** | Bloco de código otimizado com botão de cópia em 1 clique e visualizador de **Diff Lado a Lado** (*Antes vs. Depois*). |
| **RF07** | **Explicações Técnicas** | Racional detalhado justificando cada linha alterada e o princípio de engenharia aplicado (ex: *Guard Clauses*, *12-Factor App*, *Prepared Statements*). |
| **RF08** | **Guia de Estudos** | Cards com links diretos para referências oficiais (OWASP, Big-O Cheat Sheet, Martin Fowler, TypeScript Handbook, etc.). |
| **RF09** | **Painel & Histórico** | Dashboard com KPIs consolidados (total de revisões, score médio, riscos críticos) e busca textual por arquivos e regras. |
| **RF10** | **Projetos e Múltiplos Arquivos** | Criação e organização de projetos nomeados com múltiplas abas de arquivos simultâneos. |
| **RF11** | **Barra de Linguagens GitHub** | Distribuição proporcional e colorida das linguagens utilizadas no projeto e globalmente, com porcentagens exatas (`tabular-nums`). |
| **RF12** | **Persistência LocalStorage** | Salvamento automático e offline no navegador, com opções de **Exportar Backup (.json)** e **Importar Backup**. |
| **RF13** | **Exclusão Granular** | Deleção de arquivos individuais ou projetos inteiros com modal de confirmação e recálculo reativo da barra de linguagens. |

---

## 🐙 Integração com o GitHub

O CodeReviewer permite clonar e inspecionar repositórios do GitHub diretamente pela URL:

* **Formatos de URL aceitos**:
  * `https://github.com/usuario/repositorio`
  * `https://github.com/usuario/repositorio.git`
  * `git@github.com:usuario/repositorio.git`
  * Formato rápido: `usuario/repositorio`
* **Inspeção Prévia**: Visualização de estrelas, descrição, branch padrão e lista de arquivos de código-fonte (filtrando automaticamente ruídos como `node_modules/`, `dist/`, `.lock` e imagens).
* **Seleção Granular**: Escolha quais arquivos do repositório você deseja importar para o seu workspace.
* **Suporte a Repositórios Privados e Alta Cota**: Campo para inserção opcional de *Personal Access Token* (PAT), liberando acesso a repositórios privados e elevando o limite da API para 5.000 requisições/hora.

---

## 💻 Arquitetura & Tecnologias

A aplicação foi desenvolvida seguindo as melhores práticas modernas de front-end:

* **React 19** + **TypeScript**: Componentização funcional com tipagem estrita de todos os modelos de dados.
* **Tailwind CSS v4**: Estilização responsiva, semântica e sem dependência de classes de UI pré-fabricadas.
* **Lucide React**: Conjunto consistente de ícones vetoriais.
* **Motor Analítico Client-Side**: Diagnósticos determinísticos baseados em regras e heurísticas de compiladores e AST, operando diretamente no navegador sem necessidade de servidor backend.
* **Vite**: Build tool ultrarrápido com Hot Module Replacement otimizado.

---

## 🔒 Privacidade & Armazenamento Local

* **Privacidade Absoluta**: Seus códigos **não** são enviados nem armazenados em bancos de dados remotos. Toda a árvore de arquivos, histórico de análises e configurações residem exclusivamente no `localStorage` do seu navegador.
* **Portabilidade**: Através da ferramenta de **Dados Locais**, você pode exportar um arquivo `.json` com todos os seus projetos e restaurá-lo em qualquer outro computador ou navegador a qualquer momento.

---

## 🛠️ Como Executar o Projeto

### Pré-requisitos
* **Node.js** (versão 18 ou superior)
* Gerenciador de pacotes **npm**, **yarn** ou **pnpm**

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/codereviewer.git
   cd codereviewer
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acessar a aplicação:**
   Abra seu navegador e acesse: [http://localhost:3000](http://localhost:3000)

5. **Gerar a build de produção:**
   ```bash
   npm run build
   ```

---

## 📂 Estrutura de Diretórios

```text
├── src/
│   ├── components/            # Componentes visuais modulares
│   │   ├── AnalysisResults.tsx        # Exibição de score, issues, diff e explicações
│   │   ├── BackupModal.tsx            # Modal de exportação/importação JSON (RF12)
│   │   ├── CodeEditor.tsx             # Editor com numeração de linhas e atalhos (RF01)
│   │   ├── ConfirmModal.tsx           # Modal de confirmação para exclusões (RF13)
│   │   ├── FileNavigation.tsx         # Abas de arquivos do projeto ativo (RF10)
│   │   ├── GitHubImportModal.tsx      # Clonagem e inspeção por URL do GitHub
│   │   ├── Header.tsx                 # Barra superior com ações e alternador de tema
│   │   ├── HistoryDashboard.tsx       # Painel de métricas e histórico de auditoria (RF09)
│   │   ├── LanguageDistributionBar.tsx# Barra de linguagens estilo GitHub (RF11)
│   │   └── ProjectSidebar.tsx         # Gerenciamento de projetos e pastas (RF10)
│   ├── services/              # Serviços de negócio e infraestrutura
│   │   ├── githubService.ts           # Integração com a API REST do GitHub
│   │   ├── reviewEngine.ts            # Motor analítico (Clean Code, Segurança, Performance)
│   │   └── storageService.ts          # Persistência e sincronização com LocalStorage
│   ├── types/                 # Definições de tipos e interfaces TypeScript
│   │   └── index.ts
│   ├── utils/                 # Constantes e utilitários
│   │   └── languages.ts               # Mapeamento de 12 linguagens e cores oficiais
│   ├── App.tsx                # Orquestrador principal da aplicação
│   ├── index.css              # Configurações globais de estilos e fontes
│   └── main.tsx               # Ponto de entrada do React
├── index.html                 # HTML com importação de fontes (JetBrains Mono & Plus Jakarta)
├── metadata.json              # Configurações do AI Studio Build
├── package.json               # Dependências e scripts do projeto
├── tsconfig.json              # Configurações do TypeScript
└── README.md                  # Documentação oficial do projeto
```

---

## 📄 Licença

Este projeto é distribuído sob a licença **Apache 2.0**. Consulte o arquivo de licença correspondente para maiores detalhes.

---

Desenvolvido com foco em excelência técnica, código limpo e experiência do desenvolvedor! 🚀
