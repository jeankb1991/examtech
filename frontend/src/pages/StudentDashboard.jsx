import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  GraduationCap, FileText, Award, LogOut, Plus, Check, 
  ShieldAlert, Sparkles, Brain, ShieldCheck, ArrowRight, Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'history'
  const [metrics, setMetrics] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  
  // Joins
  const [classroomCode, setClassroomCode] = useState('');
  
  // Results view
  const [selectedExamResult, setSelectedExamResult] = useState(null);
  const [examResultDetails, setExamResultDetails] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('examtech_user') || '{}');

  useEffect(() => {
    if (!localStorage.getItem('examtech_token') || user.role !== 'student') {
      navigate('/login');
      return;
    }
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await api.getStudentMetrics();
      setMetrics(data);
      const classData = await api.getStudentClassrooms();
      setClassrooms(classData);
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados do painel do Aluno.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('examtech_token');
    localStorage.removeItem('examtech_user');
    navigate('/');
  };

  const handleJoinClassroom = async (e) => {
    e.preventDefault();
    if (!classroomCode) return;
    try {
      await api.joinClassroom(classroomCode);
      setSuccess(`Você entrou na turma! Bons estudos.`);
      setClassroomCode('');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStartExam = async (examId) => {
    if (!window.confirm('Iniciar esta avaliação? O temporizador começará a rodar e a segurança anti-cola será ativada.')) return;
    navigate(`/exam/${examId}`);
  };

  const handleViewResult = async (examId) => {
    try {
      setLoading(true);
      const result = await api.getStudentExamResult(examId);
      if (result.status && result.status !== 'graded') {
        alert(result.message);
        return;
      }
      setExamResultDetails(result);
      setSelectedExamResult(examId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex selection:bg-neon-purple/30">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/5 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div className="p-6 flex items-center gap-3 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] text-sm">
              ET
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              EXAM<span className="text-gradient">TECH</span>
            </span>
          </div>

          {/* User Info */}
          <div className="p-4 mx-4 my-4 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-xs text-slate-500 font-semibold block uppercase">Estudante</p>
            <p className="text-sm font-bold text-white mt-1 truncate">{user.name}</p>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 space-y-1.5 mt-6">
            <button
              onClick={() => { setActiveTab('dashboard'); setSelectedExamResult(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border-l-4 border-neon-blue text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <GraduationCap className="w-5 h-5" /> Painel do Aluno
            </button>
            <button
              onClick={() => { setActiveTab('history'); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border-l-4 border-neon-blue text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FileText className="w-5 h-5" /> Histórico / Notas
            </button>
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-sm font-bold transition-all"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white capitalize">{activeTab}</h1>
            <p className="text-sm text-slate-400">Acesse suas turmas, realize exames e veja análises de IA.</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-3 mb-6">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex gap-3 mb-6">
            <Check className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Render Tab Content */}
        {loading && !selectedExamResult ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && metrics && !selectedExamResult && (
              <div className="space-y-8">
                {/* Metrics top */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass p-6 rounded-2xl border border-white/5">
                    <span className="text-slate-500 text-xs font-bold uppercase block">Minhas Turmas</span>
                    <span className="text-3xl font-extrabold text-white mt-1 block">{metrics.classrooms_count}</span>
                  </div>
                  <div className="glass p-6 rounded-2xl border-2 border-neon-blue shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    <span className="text-neon-blue text-xs font-bold uppercase block">Provas Disponíveis</span>
                    <span className="text-3xl font-extrabold text-white mt-1 block">{metrics.pending_exams_count}</span>
                  </div>
                  <div className="glass p-6 rounded-2xl border border-white/5">
                    <span className="text-slate-500 text-xs font-bold uppercase block">Provas Feitas</span>
                    <span className="text-3xl font-extrabold text-white mt-1 block">{metrics.completed_exams_count}</span>
                  </div>
                </div>

                {/* Main Dashboard Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Provas & Turmas */}
                  <div className="col-span-1 lg:col-span-2 space-y-8">
                    {/* Provas Disponiveis */}
                    <div className="glass p-6 rounded-2xl border border-white/5">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-neon-blue" />
                        Avaliações Ativas
                      </h3>
                      {metrics.available_exams && metrics.available_exams.length > 0 ? (
                        <div className="space-y-4">
                          {metrics.available_exams.map((exam) => (
                            <div key={exam.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <span className="font-bold text-white text-base">{exam.title}</span>
                                <div className="flex gap-4 text-xs text-slate-400 mt-2 font-mono">
                                  <span>Matéria: {exam.subject ? exam.subject.name : 'Geral'}</span>
                                  <span>Duração: {exam.duration_minutes} min</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleStartExam(exam.id)}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] shrink-0 self-end sm:self-center flex items-center gap-1.5"
                              >
                                Fazer Prova <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm text-center py-8">Excelente! Nenhuma prova disponível no momento.</p>
                      )}
                    </div>

                    {/* Turmas joined & Join form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="glass p-6 rounded-2xl border border-white/5">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Minhas Turmas</h3>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {classrooms.map(c => (
                            <div key={c.id} className="p-3 rounded-lg bg-white/5 border border-white/5 flex justify-between items-center text-xs">
                              <span className="font-bold text-white">{c.name}</span>
                              <span className="px-2 py-0.5 rounded bg-neon-blue/20 text-neon-blue font-mono font-bold">{c.code}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Entrar em Turma</h3>
                          <p className="text-xs text-slate-400 mb-4">Digite o código único fornecido pelo seu professor.</p>
                        </div>
                        <form onSubmit={handleJoinClassroom} className="flex gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Ex: TECINF"
                            value={classroomCode}
                            onChange={(e) => setClassroomCode(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/5 outline-none focus:border-neon-blue/50 text-white text-xs font-bold text-center uppercase"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-neon-blue text-white rounded-lg text-xs font-bold shrink-0"
                          >
                            Entrar
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Gamified Ranking */}
                  <div className="glass p-6 rounded-2xl border border-white/5 h-fit">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      Liga Acadêmica (Top 10)
                    </h3>
                    <div className="space-y-3 font-semibold text-xs">
                      {metrics.ranking && metrics.ranking.map((rank, idx) => (
                        <div key={idx} className={`p-3 rounded-xl flex items-center justify-between border ${
                          rank.name === user.name
                            ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border-neon-blue shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                            : 'bg-white/5 border-white/5'
                        }`}>
                          <div className="flex items-center gap-3">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                              idx === 0 ? 'bg-yellow-400 text-slate-900 shadow-[0_0_10px_rgba(250,204,21,0.5)]' :
                              idx === 1 ? 'bg-slate-300 text-slate-900' :
                              idx === 2 ? 'bg-amber-600 text-white' :
                              'bg-white/10 text-slate-400'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="text-white truncate max-w-[120px]">{rank.name}</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-neon-blue">{rank.avg_score} pt</span>
                            <span className="text-[10px] text-slate-500">({rank.exams_completed} pr)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Listagem histórico de notas */}
            {activeTab === 'history' && metrics && !selectedExamResult && (
              <div className="glass p-6 rounded-2xl border border-white/5 overflow-hidden">
                <h3 className="text-lg font-bold text-white mb-6">Minhas Provas Resolvidas</h3>
                {metrics.past_exams && metrics.past_exams.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-400 font-semibold">
                          <th className="pb-4">Avaliação</th>
                          <th className="pb-4">Data de Finalização</th>
                          <th className="pb-4">Status</th>
                          <th className="pb-4">Nota Obtida</th>
                          <th className="pb-4 text-right">Resultado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {metrics.past_exams.map((sub) => (
                          <tr key={sub.id}>
                            <td className="py-4 font-bold text-white">{sub.exam ? sub.exam.title : 'N/A'}</td>
                            <td className="py-4 text-xs text-slate-500 font-mono">
                              {sub.finished_at ? new Date(sub.finished_at).toLocaleString() : 'N/A'}
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                sub.status === 'graded' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {sub.status === 'graded' ? 'Corrigido' : 'Em Correção'}
                              </span>
                            </td>
                            <td className="py-4 font-bold font-mono text-base">
                              {sub.score !== null ? (
                                <span className="text-neon-blue">{sub.score} / {sub.exam ? sub.exam.total_score : 10}</span>
                              ) : (
                                <span className="text-slate-500">Pendente</span>
                              )}
                            </td>
                            <td className="py-4 text-right">
                              {sub.status === 'graded' ? (
                                <button
                                  onClick={() => handleViewResult(sub.exam.id)}
                                  className="px-3 py-1.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 text-xs font-bold flex items-center gap-1 ml-auto"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Ver Feedback
                                </button>
                              ) : (
                                <span className="text-slate-500 text-xs font-mono">Aguardando correção...</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm text-center py-10">Você ainda não realizou nenhuma prova.</p>
                )}
              </div>
            )}

            {/* Tela de feedback de prova detalhado (IA diagnostics!) */}
            {selectedExamResult && examResultDetails && (
              <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                  <div>
                    <span className="text-xs text-slate-500 font-bold uppercase">Resultado e Análise Conceitual</span>
                    <h3 className="text-lg font-bold text-white mt-1">{examResultDetails.exam.title}</h3>
                  </div>
                  <button
                    onClick={() => { setSelectedExamResult(null); setExamResultDetails(null); }}
                    className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/10"
                  >
                    Voltar
                  </button>
                </div>

                {/* AI Diagnostics Feedback card */}
                {examResultDetails.feedback_ia && (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-neon-purple/20 via-dark-card to-neon-blue/10 border border-neon-purple/30 shadow-[0_0_20px_rgba(99,102,241,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-neon-purple/10 blur-2xl pointer-events-none" />
                    <h4 className="font-extrabold flex items-center gap-2 text-white text-base">
                      <Sparkles className="w-5 h-5 text-neon-purple animate-pulse" />
                      Análise de Aprendizado Automatizada da IA ExamTech
                    </h4>
                    <p className="text-slate-300 mt-4 leading-relaxed text-sm whitespace-pre-line font-medium">
                      {examResultDetails.feedback_ia}
                    </p>
                  </div>
                )}

                {/* Detalhes de cada questao */}
                <div className="space-y-6">
                  <h4 className="text-base font-bold text-white uppercase tracking-wider block">Gabarito Revisado</h4>
                  {examResultDetails.answers && examResultDetails.answers.map((ans, idx) => (
                    <div key={ans.id} className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-xs font-bold text-neon-blue font-mono">Questão {idx + 1} ({ans.question_type})</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ans.is_correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {ans.is_correct ? 'Correta' : 'Incorreta'} ({ans.points_earned} / {ans.max_points} pt)
                        </span>
                      </div>
                      
                      <p className="text-sm text-white font-medium whitespace-pre-line">{ans.question_text}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs">
                          <span className="text-slate-500 font-bold block uppercase mb-1">Sua Resposta:</span>
                          <p className="font-mono text-white whitespace-pre-line">{ans.student_response}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs">
                          <span className="text-slate-500 font-bold block uppercase mb-1">Gabarito Ideal:</span>
                          <p className="font-mono text-emerald-400 whitespace-pre-line">{ans.correct_answer}</p>
                        </div>
                      </div>

                      {ans.feedback && (
                        <div className="p-3.5 rounded-xl bg-neon-blue/5 border border-neon-blue/10 text-xs text-slate-300">
                          <span className="text-neon-blue font-bold">Comentário do Professor/IA:</span> {ans.feedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
