import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Brain, Cpu, BarChart3, Award, Users, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-dark-bg text-dark-text overflow-x-hidden selection:bg-neon-purple/30 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-neon-purple/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-neon-blue/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]">
            ET
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            EXAM<span className="text-gradient">TECH</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-medium">
          <a href="#features" className="hover:text-neon-blue transition-colors">Recursos</a>
          <a href="#security" className="hover:text-neon-blue transition-colors">Segurança</a>
          <a href="#plans" className="hover:text-neon-blue transition-colors">Planos</a>
          <a href="#ai" className="hover:text-neon-blue transition-colors">Inteligência Artificial</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-4 py-2 hover:text-white transition-colors">
            Entrar
          </Link>
          <Link to="/register" className="relative group px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold overflow-hidden shadow-lg transition-all duration-300 hover:scale-105">
            <span className="relative z-10">Criar Conta</span>
            <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-24 md:pt-32 md:pb-40 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
          <Zap className="w-4 h-4 text-neon-blue animate-pulse" />
          <span className="text-sm font-semibold text-neon-blue tracking-wide uppercase">Lançamento Exclusivo V1.0</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight max-w-5xl">
          Avaliações Inteligentes com <br />
          <span className="text-gradient">Geração e Correção por IA</span>
        </h1>
        <p className="mt-8 text-lg md:text-xl text-slate-400 max-w-3xl leading-relaxed">
          A plataforma SaaS de provas online definitiva para escolas e cursos técnicos. 
          Gere questões técnicas automaticamente com IA, monitore fraudes em tempo real 
          e obtenha diagnósticos de aprendizado detalhados.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row gap-5">
          <Link to="/register" className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold text-lg shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] transition-all duration-300 hover:scale-[1.03]">
            Começar Grátis <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/login" className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-colors backdrop-blur-md">
            Ver Demo do Sistema
          </Link>
        </div>

        {/* Dashboard Preview mockup */}
        <div className="mt-20 w-full max-w-5xl rounded-2xl border border-white/10 bg-dark-card/50 p-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-bg/20 to-dark-bg/80 z-10" />
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="px-8 py-1 rounded bg-white/5 border border-white/5 text-xs text-slate-500 font-mono">
              examtech.io/dashboard/professor
            </div>
            <div className="w-8" />
          </div>
          <div className="grid grid-cols-3 gap-4 text-left p-2">
            <div className="col-span-3 md:col-span-1 rounded-xl bg-white/5 p-5 border border-white/5">
              <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Turma Ativa</span>
              <span className="text-xl font-bold text-white mt-1 block">Técnico em Informática</span>
              <div className="flex justify-between items-center mt-6 text-xs text-slate-400">
                <span>35 Alunos</span>
                <span className="text-neon-blue font-bold">Média: 8.4</span>
              </div>
            </div>
            <div className="col-span-3 md:col-span-2 rounded-xl bg-white/5 p-5 border border-white/5 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Geração Automática de Provas por IA</span>
                <span className="px-2 py-0.5 rounded bg-neon-purple/20 text-neon-purple text-[10px] uppercase font-bold">Ativa</span>
              </div>
              <p className="text-sm text-slate-400 mt-2">
                "Gerar 5 questões de Programação Orientada a Objetos com dificuldade intermediária e incluir uma questão prática de código."
              </p>
              <div className="mt-4 flex gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-neon-blue/20 text-neon-blue text-xs font-mono">
                  #python
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-neon-purple/20 text-neon-purple text-xs font-mono">
                  #poo
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 relative">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white">
            Tudo o que sua instituição precisa <br />
            em um único <span className="text-gradient">SaaS moderno</span>
          </h2>
          <p className="mt-4 text-slate-400 text-lg">
            Combinamos inteligência artificial avançada e segurança ativa de navegação para recriar o ambiente acadêmico perfeito.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass glass-hover p-8 rounded-2xl border border-white/5 relative">
            <div className="w-12 h-12 rounded-xl bg-neon-blue/10 flex items-center justify-center mb-6">
              <Brain className="w-6 h-6 text-neon-blue" />
            </div>
            <h3 className="text-xl font-bold text-white">Módulo de IA Integrado</h3>
            <p className="mt-4 text-slate-400 leading-relaxed text-sm">
              Gere questões técnicas, alternativas coerentes de múltipla escolha e critérios de correção. O sistema corrige respostas discursivas e trechos de código automaticamente comparando com a resposta padrão.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass glass-hover p-8 rounded-2xl border border-white/5 relative">
            <div className="w-12 h-12 rounded-xl bg-neon-purple/10 flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-neon-purple" />
            </div>
            <h3 className="text-xl font-bold text-white">Segurança Ativa Anti-Cola</h3>
            <p className="mt-4 text-slate-400 leading-relaxed text-sm">
              Evite trapaças de forma integrada. O ExamTech detecta se o aluno saiu do modo tela cheia (Fullscreen), trocou de aba no navegador ou minimizou a janela da prova, salvando logs detalhados de desvio de foco.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass glass-hover p-8 rounded-2xl border border-white/5 relative">
            <div className="w-12 h-12 rounded-xl bg-neon-pink/10 flex items-center justify-center mb-6">
              <BarChart3 className="w-6 h-6 text-neon-pink" />
            </div>
            <h3 className="text-xl font-bold text-white">Analytics e Dashboards</h3>
            <p className="mt-4 text-slate-400 leading-relaxed text-sm">
              Gráficos profissionais interativos com média da turma, taxa de erro por questão, ranking gamificado por pontuação e estatísticas detalhadas de progresso dos alunos nos cursos técnicos.
            </p>
          </div>
        </div>
      </section>

      {/* AI Deep Dive */}
      <section id="ai" className="py-24 bg-dark-card/30 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/20 mb-6">
              <Cpu className="w-4 h-4 text-neon-blue" />
              <span className="text-xs font-semibold text-neon-blue uppercase">Inteligência Artificial Generativa</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              Diga adeus ao trabalho <br />
              <span className="text-gradient">de criar dezenas de provas</span>
            </h2>
            <p className="mt-6 text-slate-400 leading-relaxed text-lg">
              Nosso assistente de IA cria simulados técnicos sob demanda, gerando questões teóricas complexas e exercícios práticos de programação, além de analisar os desvios e emitir relatórios de rendimento individualizados.
            </p>
            <ul className="mt-8 space-y-4 font-semibold text-slate-300">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-neon-blue" />
                Geração automática de questões discursivas, objetivas e de código.
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-neon-blue" />
                Adaptação automática de dificuldade conforme a turma.
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-neon-blue" />
                Diagnóstico de aprendizado e feedback personalizado para o aluno.
              </li>
            </ul>
          </div>
          <div className="relative rounded-2xl border border-white/10 bg-dark-card p-8 shadow-[0_0_40px_rgba(99,102,241,0.15)]">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Brain className="w-5 h-5 text-neon-purple" />
              Simulador de Avaliação IA ExamTech
            </h3>
            <div className="space-y-4">
              <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                <span className="text-xs text-neon-blue font-bold">Questão Gerada por IA</span>
                <p className="text-sm text-slate-300 mt-2">
                  "Qual é a complexidade de tempo de pior caso para o algoritmo de busca binária, e por que a estrutura de dados de entrada deve estar previamente ordenada?"
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                <span className="text-xs text-neon-purple font-bold">Gabarito Conceitual Esperado (IA)</span>
                <p className="text-xs text-slate-400 mt-2">
                  O algoritmo de busca binária funciona dividindo o espaço de pesquisa ao meio a cada iteração, resultando em complexidade de tempo O(log n) no pior caso. A ordenação prévia é obrigatória pois o algoritmo assume que todos os elementos à esquerda de uma partição são menores e os da direita são maiores.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Focus */}
      <section id="security" className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 relative rounded-2xl border border-white/10 bg-dark-bg p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-red-400 mb-6 flex items-center gap-2 uppercase tracking-wide">
              <Shield className="w-5 h-5 text-red-500 animate-pulse" />
              Logs de Segurança Ativa (Anti-Cola)
            </h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-300 flex justify-between">
                <span>[10:42:15] DETECTED: Mudança de aba/Blur</span>
                <span className="text-slate-500">2 infrações</span>
              </div>
              <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-300 flex justify-between">
                <span>[10:44:03] DETECTED: Saída de Fullscreen</span>
                <span className="text-slate-500">1 infração</span>
              </div>
              <div className="p-3 rounded bg-white/5 border border-white/5 text-slate-400 flex justify-between">
                <span>[10:45:00] LOG: Tecla especial bloqueada (Ctrl+V)</span>
                <span className="text-slate-500">Ação impedida</span>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
              <Shield className="w-4 h-4 text-red-400" />
              <span className="text-xs font-semibold text-red-400 uppercase">Segurança Acadêmica Rígida</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              Aplicação de provas com <br />
              <span className="text-red-400">integridade assegurada</span>
            </h2>
            <p className="mt-6 text-slate-400 leading-relaxed text-lg">
              Reduza o risco de fraudes com tecnologias dedicadas e integradas diretamente no navegador do aluno. Bloqueamos interações comuns de trapaça e alertamos o professor em tempo real.
            </p>
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                <span className="font-bold text-white text-base">Controle de Foco</span>
                <p className="text-xs text-slate-400 mt-1">Registra imediatamente se o aluno mudou de aba ou desfocou da página.</p>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                <span className="font-bold text-white text-base">Forçar Tela Cheia</span>
                <p className="text-xs text-slate-400 mt-1">Obriga a execução em modo fullscreen para iniciar e continuar a avaliação.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Plans */}
      <section id="plans" className="py-24 bg-dark-card/20 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">
              Planos sob medida para sua <span className="text-gradient">EdTech</span>
            </h2>
            <p className="mt-4 text-slate-400 text-lg">
              De professores individuais a grandes escolas técnicas regionais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plano 1 */}
            <div className="glass p-8 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div>
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Professor Free</span>
                <div className="flex items-baseline mt-4 text-white">
                  <span className="text-4xl font-extrabold">R$ 0</span>
                  <span className="text-sm font-semibold text-slate-500 ml-1">/mês</span>
                </div>
                <p className="mt-6 text-sm text-slate-400">Excelente para professores individuais testando a plataforma.</p>
                <ul className="mt-8 space-y-4 text-sm text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-neon-blue" /> Até 2 turmas e 50 alunos</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-neon-blue" /> 10 gerações de questões IA / mês</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-neon-blue" /> Segurança anti-cola integrada</li>
                </ul>
              </div>
              <Link to="/register" className="mt-8 w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-center transition-colors block">
                Começar Agora
              </Link>
            </div>

            {/* Plano 2 - Destaque */}
            <div className="glass p-8 rounded-2xl border-2 border-neon-purple relative flex flex-col justify-between shadow-[0_0_30px_rgba(99,102,241,0.25)]">
              <div className="absolute top-0 right-8 transform -translate-y-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-xs text-white font-bold uppercase tracking-wider">
                Recomendado
              </div>
              <div>
                <span className="text-sm font-bold text-neon-purple uppercase tracking-widest">Escola Pró</span>
                <div className="flex items-baseline mt-4 text-white">
                  <span className="text-4xl font-extrabold">R$ 297</span>
                  <span className="text-sm font-semibold text-slate-500 ml-1">/mês</span>
                </div>
                <p className="mt-6 text-sm text-slate-400">Para instituições em crescimento focadas em digitalização e IA.</p>
                <ul className="mt-8 space-y-4 text-sm text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-neon-purple" /> Turmas e alunos ilimitados</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-neon-purple" /> Gerações de IA ilimitadas</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-neon-purple" /> Dashboard de estatísticas completo</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-neon-purple" /> Exportação de notas PDF/Excel</li>
                </ul>
              </div>
              <Link to="/register" className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold text-center shadow-lg hover:shadow-xl transition-all duration-300 block">
                Assinar Plano
              </Link>
            </div>

            {/* Plano 3 */}
            <div className="glass p-8 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div>
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Enterprise</span>
                <div className="flex items-baseline mt-4 text-white">
                  <span className="text-4xl font-extrabold">Sob Consulta</span>
                </div>
                <p className="mt-6 text-sm text-slate-400">Customizações avançadas para grandes redes de ensino e institutos federais.</p>
                <ul className="mt-8 space-y-4 text-sm text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-neon-blue" /> Integração total com Moodle/SGA</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-neon-blue" /> Suporte dedicado 24/7 SLA</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-neon-blue" /> Servidores dedicados sob demanda</li>
                </ul>
              </div>
              <a href="mailto:contato@examtech.io" className="mt-8 w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-center transition-colors block">
                Falar com Consultor
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-dark-bg text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight">EXAM<span className="text-gradient">TECH</span></span>
            <span>© 2026. Todos os direitos reservados.</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Políticas de Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
