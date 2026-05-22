# 🌌 EXAMTECH - Plataforma SaaS Premium de Provas Online com IA

O **ExamTech** é um ecossistema SaaS completo e moderno voltado para a aplicação de avaliações online e simulados de forma automatizada e inteligente. Idealizado para cursos técnicos e escolas, ele combina a potência da Inteligência Artificial Generativa para criação de questões e correção diagnóstica automática com mecanismos ativos e rigorosos de segurança Acadêmica (Anti-Cola) integrados ao navegador.

---

## 🚀 Tecnologias Utilizadas (Stack Obrigatória)

- **Frontend**: React + Vite (SPA) estilizado com TailwindCSS, animações dinâmicas via Framer Motion, ícones vetoriais de alto nível Lucide Icons e gráficos analíticos interativos Recharts.
- **Backend**: Flask (Python) com controle de rotas modulares (Blueprints), JWT (JSON Web Tokens) para controle seguro de sessões e SQLAlchemy.
- **Banco de Dados**: SQLite estruturado localmente (pronto para migração para PostgreSQL em produção).
- **Mecanismos de Segurança**: Proteção ativa no frontend via eventos DOM, com injeção automática de logs de infração no banco de dados.

---

## 🔑 Contas de Demonstração Rápida (Seed Integrado)

O banco de dados do sistema já inicia previamente alimentado com uma estrutura educacional de testes completa (turmas, matérias, provas feitas, infrações de cola e notas) para facilitar a demonstração.

Na tela de login, utilize os botões de **Acesso Rápido (Demo)** ou entre com as credenciais abaixo:

### 1. 👨💼 Administrador (Diretora Mariana)
- **E-mail**: `admin@examtech.com`
- **Senha**: `admin123`
- *Funções*: Aprovar/reprovar professores, gerenciar turmas, disciplinas, auditoria central e logs gerais de segurança.

### 2. 👨🏫 Professor (Prof. Carlos Eduardo)
- **E-mail**: `professor1@examtech.com`
- **Senha**: `admin123`
- *Funções*: Criar provas, banco de questões, **gerador de questões automático por IA**, correção manual, **correção automática mágica com IA para discursivas/código** e gráficos analíticos de desempenho da turma.

### 3. 👨🎓 Aluno (Jean Lucas)
- **E-mail**: `aluno1@examtech.com`
- **Senha**: `admin123`
- *Funções*: Entrar em turmas via código único (`TECINF`), painel de provas ativas, **ambiente de prova seguro com temporizador**, ranking gamificado e **diagnóstico de aprendizado por IA**.

---

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos
- Python 3.8+ instalado e configurado no PATH
- Node.js 18+ instalado

---

### Passo 1: Inicializar o Backend

1. Abra o terminal e acesse a pasta `backend`:
   ```bash
   cd backend
   ```
2. Instale as dependências listadas no `requirements.txt`:
   ```bash
   python -m pip install -r requirements.txt
   ```
3. Inicie o servidor Flask:
   ```bash
   python app.py
   ```
   *O backend rodará na porta `5000` (http://localhost:5000) e gerará o banco de dadosSQLite `examtech.db` com todas as tabelas e dados populados de forma automática na primeira execução.*

---

### Passo 2: Inicializar o Frontend

1. Abra outro terminal e acesse a pasta `frontend`:
   ```bash
   cd frontend
   ```
2. Instale as dependências do React:
   ```bash
   npm install
   ```
3. Inicialize o servidor de desenvolvimento do Vite:
   ```bash
   npm run dev
   ```
   *O frontend rodará e informará o endereço local no terminal (geralmente http://localhost:5173).*

---

## 🔐 Diferenciais Técnicos e Arquitetura de Segurança

### 1. Sistema Anti-Cola Ativo (Provas Seguras)
Durante a realização das avaliações no painel do aluno, o sistema monitora ativamente as interações:
- **Modo Tela Cheia**: A prova exige fullscreen obrigatório. Sair desse modo pausa a visualização das questões e gera logs.
- **Detecção de Blur (Foco)**: Se o estudante abrir outra aba, navegador ou minimizar a janela para pesquisar, o sistema detecta e salva a infração instantaneamente.
- **Bloqueio de Teclas Especiais**: Atalhos como `Ctrl+C` (copiar), `Ctrl+V` (colar), F12 (ferramentas de desenvolvedor) e o botão direito do mouse são completamente bloqueados.
- **Auditoria Docente**: O professor visualiza o histórico exato de alertas de fraude de cada aluno antes de lançar a nota.

### 2. Módulo de IA Inteligente (ExamTech AI Engine)
- **Gerador de Questões**: Cria questões técnicas inéditas, gerando alternativas coerentes de múltipla escolha e critérios de gabaritos em segundos.
- **Corretor Mágico discursivo**: Compara semanticamente a resposta discursiva ou código do aluno com o gabarito oficial, computando pontuação parcial justa e gerando feedbacks técnicos específicos.
- **Análise Diagnóstica**: Gera relatórios de aproveitamento individualizados destacando os pontos fortes e o que o aluno precisa reforçar nos estudos.
