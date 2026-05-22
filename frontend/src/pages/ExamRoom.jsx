import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ShieldAlert, AlertTriangle, Play, CheckCircle2, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ExamRoom() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // {question_id: answer}
  const [timeRemaining, setTimeRemaining] = useState(0); // em segundos
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // Status de execução
  const [examStarted, setExamStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Segurança logs
  const [warningsCount, setWarningsCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState('');
  const [showWarningAlert, setShowWarningAlert] = useState(false);

  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadExam();
    return () => {
      // Limpeza de timers e listeners
      if (timerRef.current) clearInterval(timerRef.current);
      removeSecurityListeners();
    };
  }, [examId]);

  const loadExam = async () => {
    try {
      setLoading(true);
      const res = await api.startExam(parseInt(examId));
      setExam(res.exam);
      setQuestions(res.questions || []);
      setTimeRemaining(res.exam.duration_minutes * 60);
      
      // Reconstrói respostas parciais se houver
      const savedAnswers = {};
      if (res.answers) {
        res.answers.forEach(ans => {
          savedAnswers[ans.question_id] = ans.student_response;
        });
      }
      setAnswers(savedAnswers);
    } catch (err) {
      setError(err.message || 'Erro ao carregar ambiente de prova.');
    } finally {
      setLoading(false);
    }
  };

  const startExamFlow = () => {
    // Tenta entrar em fullscreen
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen().catch(() => {
        alert('Por favor, ative o modo tela cheia para iniciar a prova.');
        return;
      });
    }
    
    setExamStarted(true);
    setIsFullscreen(true);
    setupSecurityListeners();
    startTimer();
  };

  // Timer
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          autoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // MECANISMOS DE SEGURANÇA E TENTATIVAS DE TRAPAÇA
  const setupSecurityListeners = () => {
    // 1. Detectar perda de foco (Blur)
    window.addEventListener('blur', handleBlurEvent);
    
    // 2. Detectar saída de fullscreen
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // 3. Bloquear clique direito (Menu contextual)
    document.addEventListener('contextmenu', preventDefaultAction);
    
    // 4. Bloquear copiar/colar e teclas de atalho
    document.addEventListener('copy', preventDefaultAction);
    document.addEventListener('cut', preventDefaultAction);
    document.addEventListener('paste', preventDefaultAction);
    document.addEventListener('keydown', handleKeydownActions);
  };

  const removeSecurityListeners = () => {
    window.removeEventListener('blur', handleBlurEvent);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('contextmenu', preventDefaultAction);
    document.removeEventListener('copy', preventDefaultAction);
    document.removeEventListener('cut', preventDefaultAction);
    document.removeEventListener('paste', preventDefaultAction);
    document.removeEventListener('keydown', handleKeydownActions);
  };

  const preventDefaultAction = (e) => {
    e.preventDefault();
    triggerWarning('Bloqueado', 'Ação copiada/colada ou clique com botão direito está desativado nesta prova para garantir a integridade.');
  };

  const handleKeydownActions = (e) => {
    // Bloqueia Ctrl+C, Ctrl+V, Ctrl+U, F12
    if ((e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u')) || e.key === 'F12') {
      e.preventDefault();
      triggerWarning('Tecla Bloqueada', 'Atalhos de cópia, visualização de código ou ferramentas do desenvolvedor estão bloqueados.');
    }
  };

  const handleBlurEvent = async () => {
    if (!examStarted) return;
    setWarningsCount(w => w + 1);
    triggerWarning('Desvio de Foco', 'Você trocou de aba ou minimizou o navegador! O professor foi alertado.');
    
    try {
      await api.sendCheatingLog(
        parseInt(examId),
        'blur',
        'O aluno minimizou o navegador ou mudou de aba para outra janela.'
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleFullscreenChange = async () => {
    if (!examStarted) return;
    const isFull = !!document.fullscreenElement;
    setIsFullscreen(isFull);
    
    if (!isFull) {
      setWarningsCount(w => w + 1);
      triggerWarning('Fora de Tela Cheia', 'Você saiu do modo tela cheia obrigatório! O professor foi notificado.');
      
      try {
        await api.sendCheatingLog(
          parseInt(examId),
          'fullscreen-exit',
          'O aluno desativou o modo tela cheia.'
        );
      } catch (e) {
        console.error(e);
      }
    }
  };

  const triggerWarning = (title, message) => {
    setWarningMessage(`${title}: ${message}`);
    setShowWarningAlert(true);
    setTimeout(() => {
      setShowWarningAlert(false);
    }, 5000);
  };

  // Answers handler
  const handleAnswerSelect = (qId, val) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: val
    }));
  };

  // Submit
  const handleManualSubmit = async () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    let confirmMsg = 'Tem certeza que deseja enviar sua prova?';
    if (unansweredCount > 0) {
      confirmMsg += ` Você deixou ${unansweredCount} questão(ões) sem responder!`;
    }
    
    if (!window.confirm(confirmMsg)) return;
    submitExam();
  };

  const autoSubmit = () => {
    alert('O tempo esgotou! Suas respostas estão sendo enviadas automaticamente.');
    submitExam();
  };

  const submitExam = async () => {
    setSubmitting(true);
    setError('');
    removeSecurityListeners();
    
    // Tenta sair de fullscreen
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(e => console.log(e));
    }

    try {
      await api.submitExamAnswers(parseInt(examId), answers);
      
      // Efeito Confetti de finalização!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 }
      });

      // feedback visual imediato e volta para dashboard do estudante
      alert('Sua avaliação foi enviada com sucesso! Parabéns pelo esforço.');
      navigate('/student');
    } catch (err) {
      setError(err.message || 'Erro ao enviar respostas.');
      setSubmitting(false);
      // Reativa segurança se falhar
      setupSecurityListeners();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg text-dark-text flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !examStarted) {
    return (
      <div className="min-h-screen bg-dark-bg text-dark-text flex items-center justify-center p-6">
        <div className="glass p-8 rounded-3xl border border-red-500/20 text-center max-w-md space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Falha no Acesso</h2>
          <p className="text-sm text-slate-400">{error}</p>
          <button
            onClick={() => navigate('/student')}
            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col justify-between relative selection:bg-neon-purple/30 no-select">
      
      {/* Warning popup alert on infractions */}
      {showWarningAlert && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-6 animate-bounce">
          <div className="p-4 rounded-2xl bg-red-500 border border-red-400 text-white flex gap-3 shadow-2xl relative">
            <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">AVISO DE SEGURANÇA!</p>
              <p className="text-xs text-white/90 mt-1">{warningMessage}</p>
              <p className="text-[10px] text-white/70 mt-2 font-mono">Infrações detectadas: {warningsCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* BEFORE STARTING: Instructions & fullscreen requirement */}
      {!examStarted ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl glass p-8 rounded-3xl border border-white/5 shadow-2xl space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center font-bold text-white">
                ET
              </div>
              <h2 className="text-2xl font-extrabold text-white">{exam.title}</h2>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Instruções de Execução</span>
              <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                {exam.instructions || 'Leia cada questão com atenção antes de responder.'}
              </p>
            </div>

            {/* Security checklist info */}
            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-3 text-xs text-red-400">
              <span className="font-bold uppercase tracking-wider block">🚨 SISTEMA ANTI-COLA ATIVO:</span>
              <ul className="list-disc pl-4 space-y-1">
                <li>O ambiente de prova será executado obrigatoriamente em Modo Tela Cheia (Fullscreen).</li>
                <li>Qualquer alteração de abas do navegador ou perda de foco do programa gera uma notificação e log de infração.</li>
                <li>Recursos de cópia (Ctrl+C), colagem (Ctrl+V) e cliques direitos do mouse estão desativados.</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono font-semibold">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-500 block uppercase mb-1">Duração Máxima</span>
                <span className="text-white text-base font-bold">{exam.duration_minutes} minutos</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-500 block uppercase mb-1">Questões Totais</span>
                <span className="text-white text-base font-bold">{questions.length} itens</span>
              </div>
            </div>

            <button
              onClick={startExamFlow}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple hover:scale-[1.01] active:scale-[0.99] text-white font-bold text-base transition-all shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-white" /> Iniciar Avaliação Agora
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE EXAM INTERFACE */
        <>
          {/* Header Bar */}
          <header className="glass px-6 py-4 flex items-center justify-between border-b border-white/5 sticky top-0 z-30">
            <div>
              <span className="text-[10px] text-slate-500 font-bold font-mono block uppercase">Avaliação em Curso</span>
              <h1 className="text-base font-bold text-white max-w-[200px] sm:max-w-md truncate">{exam.title}</h1>
            </div>
            
            {/* Realtime Timer UI */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-sm border ${
              timeRemaining < 300 
                ? 'bg-red-500/20 border-red-500/30 text-red-400 animate-pulse' 
                : 'bg-white/5 border-white/5 text-neon-blue'
            }`}>
              <Clock className="w-4 h-4 shrink-0" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          </header>

          {/* Exam core layouts */}
          <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
            {/* Left/Main Column: Question detail & Choices inputs */}
            <div className="flex-1 space-y-8">
              {questions.length > 0 && (
                <div className="glass p-6 rounded-3xl border border-white/5 space-y-6">
                  {/* Info Row */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-neon-blue uppercase tracking-wider font-mono">
                      Questão {activeQuestionIdx + 1} de {questions.length}
                    </span>
                    <span className="text-slate-500 font-mono">Valor: {questions[activeQuestionIdx].points} pontos</span>
                  </div>

                  {/* Question body */}
                  <p className="text-base md:text-lg text-white font-medium whitespace-pre-line leading-relaxed">
                    {questions[activeQuestionIdx].text}
                  </p>

                  {/* Inputs based on type */}
                  <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                    {questions[activeQuestionIdx].type === 'multiple_choice' && questions[activeQuestionIdx].choices && (
                      <div className="grid grid-cols-1 gap-3">
                        {questions[activeQuestionIdx].choices.map((choice, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => handleAnswerSelect(questions[activeQuestionIdx].id, choice)}
                            className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${
                              answers[questions[activeQuestionIdx].id] === choice
                                ? 'border-neon-blue bg-neon-blue/10 text-white font-bold'
                                : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <span>{choice}</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-4 ${
                              answers[questions[activeQuestionIdx].id] === choice
                                ? 'border-neon-blue bg-neon-blue'
                                : 'border-slate-600'
                            }`}>
                              {answers[questions[activeQuestionIdx].id] === choice && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {questions[activeQuestionIdx].type === 'true_false' && (
                      <div className="grid grid-cols-2 gap-4">
                        {['Verdadeiro', 'Falso'].map((val) => (
                          <button
                            key={val}
                            onClick={() => handleAnswerSelect(questions[activeQuestionIdx].id, val)}
                            className={`p-4 rounded-xl border text-sm font-bold transition-all text-center ${
                              answers[questions[activeQuestionIdx].id] === val
                                ? 'border-neon-blue bg-neon-blue/10 text-white'
                                : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    )}

                    {(questions[activeQuestionIdx].type === 'essay' || questions[activeQuestionIdx].type === 'code') && (
                      <textarea
                        value={answers[questions[activeQuestionIdx].id] || ''}
                        onChange={(e) => handleAnswerSelect(questions[activeQuestionIdx].id, e.target.value)}
                        placeholder={
                          questions[activeQuestionIdx].type === 'code'
                            ? 'Escreva seu algoritmo/código aqui. Utilize identação apropriada.'
                            : 'Escreva sua resposta teórica detalhadamente. Aborde todos os conceitos solicitados.'
                        }
                        className="w-full h-48 px-4 py-3.5 rounded-xl bg-white/5 border border-white/5 focus:border-neon-blue/50 focus:bg-white/10 outline-none text-white text-sm font-mono transition-all resize-none leading-relaxed"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Navigation controls */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setActiveQuestionIdx(prev => Math.max(0, prev - 1))}
                  disabled={activeQuestionIdx === 0}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-bold disabled:opacity-30 disabled:pointer-events-none hover:bg-white/10"
                >
                  Questão Anterior
                </button>
                
                {activeQuestionIdx < questions.length - 1 ? (
                  <button
                    onClick={() => setActiveQuestionIdx(prev => Math.min(questions.length - 1, prev + 1))}
                    className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold"
                  >
                    Próxima Questão
                  </button>
                ) : (
                  <button
                    onClick={handleManualSubmit}
                    disabled={submitting}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white text-xs font-bold shadow-md hover:scale-[1.02] transition-transform flex items-center gap-1.5"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Finalizar Prova
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Mini question navigation index */}
            <div className="w-full md:w-56 shrink-0">
              <div className="glass p-5 rounded-2xl border border-white/5 space-y-4">
                <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Navegação</span>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setActiveQuestionIdx(idx)}
                      className={`h-9 rounded-lg font-bold font-mono text-xs flex items-center justify-center transition-all ${
                        activeQuestionIdx === idx
                          ? 'bg-neon-blue text-white font-extrabold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                          : answers[q.id]
                            ? 'bg-neon-purple/20 border border-neon-purple/30 text-neon-purple'
                            : 'bg-white/5 border border-white/5 text-slate-500 hover:bg-white/10'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                
                {/* Security warning status panel */}
                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${warningsCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className="text-slate-400">Auditoria: </span>
                    <span className={`font-bold ${warningsCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {warningsCount > 0 ? `${warningsCount} Alertas` : 'Seguro'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Alert status bar */}
          {!isFullscreen && (
            <div className="bg-red-500/20 border-t border-red-500/30 px-6 py-3 flex items-center justify-between text-xs text-red-400 font-bold relative animate-pulse shrink-0">
              <span>⚠️ MODO TELA CHEIA DESATIVADO! Clique no botão ao lado para reativar e continuar a prova.</span>
              <button
                onClick={() => {
                  const docEl = document.documentElement;
                  if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {});
                }}
                className="px-3 py-1.5 rounded bg-red-500 text-white font-bold"
              >
                Ativar Fullscreen
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
