import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  LayoutDashboard, BookOpen, FileText, ClipboardCheck, LogOut,
  Plus, Sparkles, Brain, Check, X, ShieldAlert, Cpu, Award
} from 'lucide-react';

export default function ProfessorDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'exams', 'submissions'
  const [metrics, setMetrics] = useState(null);
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Form prova
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamDesc, setNewExamDesc] = useState('');
  const [newExamInsts, setNewExamInsts] = useState('');
  const [newExamDuration, setNewExamDuration] = useState(30);
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  // Banco de questões de uma prova selecionada
  const [selectedExamForQuestions, setSelectedExamForQuestions] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [newQText, setNewQText] = useState('');
  const [newQType, setNewQType] = useState('multiple_choice');
  const [newQPoints, setNewQPoints] = useState(1.0);
  const [newQCorrect, setNewQCorrect] = useState('');
  const [newQChoices, setNewQChoices] = useState(''); // Comma separated

  // IA modal
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiType, setAiType] = useState('all');
  const [aiQty, setAiQty] = useState(3);
  const [aiDifficulty, setAiDifficulty] = useState('média');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  // Correção modal
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionAnswers, setSubmissionAnswers] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('examtech_user') || '{}');

  useEffect(() => {
    if (!localStorage.getItem('examtech_token') || user.role !== 'professor') {
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
      if (activeTab === 'dashboard') {
        const metricsData = await api.getProfMetrics();
        setMetrics(metricsData);
      } else if (activeTab === 'exams') {
        const examData = await api.getProfExams();
        setExams(examData);
        const classData = await api.getProfClassrooms();
        setClassrooms(classData);
        const subjData = await api.getSubjects(); // Disciplinas globais
        setSubjects(subjData);
      } else if (activeTab === 'submissions') {
        const subs = await api.getProfSubmissions();
        setSubmissions(subs);
      }
    } catch (err) {
      setError(err.message || 'Erro ao carregar painel do Professor.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('examtech_token');
    localStorage.removeItem('examtech_user');
    navigate('/');
  };

  // CRUD Prova
  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!newExamTitle || !selectedClassroomId || !selectedSubjectId) return;
    try {
      await api.createExam({
        title: newExamTitle,
        description: newExamDesc,
        instructions: newExamInsts,
        duration_minutes: parseInt(newExamDuration),
        total_score: 10.0,
        classroom_id: parseInt(selectedClassroomId),
        subject_id: parseInt(selectedSubjectId)
      });
      setSuccess('Avaliação criada como Rascunho com sucesso!');
      setNewExamTitle('');
      setNewExamDesc('');
      setNewExamInsts('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleExamStatus = async (exam, status) => {
    try {
      await api.updateExam(exam.id, { status });
      setSuccess(`Status da avaliação '${exam.title}' alterado para '${status}'!`);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('Excluir esta avaliação e todas as suas questões/respostas?')) return;
    try {
      await api.deleteExam(id);
      setSuccess('Avaliação excluída com sucesso.');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Questões
  const handleViewQuestions = async (exam) => {
    setSelectedExamForQuestions(exam);
    try {
      const details = await api.getExamDetails(exam.id);
      setExamQuestions(details.questions || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQText || !newQCorrect) return;
    
    let choicesList = [];
    if (newQType === 'multiple_choice' && newQChoices) {
      choicesList = newQChoices.split(',').map(c => c.trim());
    } else if (newQType === 'true_false') {
      choicesList = ['Verdadeiro', 'Falso'];
    }

    try {
      await api.addQuestion(selectedExamForQuestions.id, {
        text: newQText,
        type: newQType,
        points: parseFloat(newQPoints),
        correct_answer: newQCorrect,
        choices: choicesList
      });
      setSuccess('Questão adicionada!');
      setNewQText('');
      setNewQCorrect('');
      setNewQChoices('');
      // Recarrega
      handleViewQuestions(selectedExamForQuestions);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Excluir esta questão?')) return;
    try {
      await api.deleteQuestion(qId);
      setSuccess('Questão excluída.');
      handleViewQuestions(selectedExamForQuestions);
    } catch (err) {
      setError(err.message);
    }
  };

  // Assistente de IA
  const handleGenerateAI = async () => {
    if (!aiTopic) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.generateAIQuestions(selectedExamForQuestions.id, {
        topic: aiTopic,
        type: aiType,
        quantity: parseInt(aiQty),
        difficulty: aiDifficulty
      });
      setGeneratedQuestions(data);
      setSuccess('Questões geradas pela IA ExamTech! Revise abaixo e insira.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAIQuestion = async (q) => {
    try {
      await api.addQuestion(selectedExamForQuestions.id, {
        text: q.text,
        type: q.type,
        points: q.points,
        correct_answer: q.correct_answer,
        choices: q.choices
      });
      // Remove da lista gerada
      setGeneratedQuestions(prev => prev.filter(item => item.text !== q.text));
      setSuccess('Questão da IA incorporada com sucesso!');
      handleViewQuestions(selectedExamForQuestions);
    } catch (err) {
      setError(err.message);
    }
  };

  // Correção de submissões
  const handleReviewSubmission = async (sub) => {
    setSelectedSubmission(sub);
    try {
      const details = await api.getSubmissionDetails(sub.id);
      setSubmissionAnswers(details.answers || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAutoGradeWithAI = async (subId) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.autoGradeWithAI(subId);
      setSuccess('Correção automatizada por IA aplicada com sucesso!');
      setSelectedSubmission(res.submission);
      // Recarrega respostas
      const details = await api.getSubmissionDetails(subId);
      setSubmissionAnswers(details.answers || []);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCorrection = async () => {
    // Envia nota corrigida de forma manual/final
    const gradingPayload = {
      answers: submissionAnswers.map(ans => ({
        id: ans.id,
        is_correct: ans.is_correct,
        points_earned: parseFloat(ans.points_earned || 0),
        feedback: ans.feedback
      }))
    };

    try {
      await api.submitManualGrade(selectedSubmission.id, gradingPayload);
      setSuccess('Correção manual salva e publicada!');
      setSelectedSubmission(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Mock dados para gráficos do Recharts se metrics vier vazio/mock
  const performanceData = [
    { name: 'Média Provas', Valor: 8.4 },
    { name: 'Redes Comp.', Valor: 7.9 },
    { name: 'Programação', Valor: 8.8 },
    { name: 'Banco Dados', Valor: 8.2 },
  ];

  const cheatData = [
    { name: 'Sem Infrações', value: 85 },
    { name: 'Saída Fullscreen', value: 10 },
    { name: 'Mudança de Aba', value: 5 },
  ];
  const COLORS = ['#00C49F', '#FFBB28', '#FF8042'];

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
            <p className="text-xs text-slate-500 font-semibold block uppercase">Professor(a)</p>
            <p className="text-sm font-bold text-white mt-1 truncate">{user.name}</p>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 space-y-1.5 mt-6">
            <button
              onClick={() => { setActiveTab('dashboard'); setSelectedExamForQuestions(null); setSelectedSubmission(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border-l-4 border-neon-blue text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" /> Dashboard Docente
            </button>
            <button
              onClick={() => { setActiveTab('exams'); setSelectedSubmission(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'exams'
                  ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border-l-4 border-neon-blue text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FileText className="w-5 h-5" /> Avaliações / Provas
            </button>
            <button
              onClick={() => { setActiveTab('submissions'); setSelectedExamForQuestions(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'submissions'
                  ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border-l-4 border-neon-blue text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ClipboardCheck className="w-5 h-5" /> Correções e Notas
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
            <p className="text-sm text-slate-400">Gerenciador de avaliações online e inteligência acadêmica.</p>
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
        {loading && !showAIModal ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && metrics && (
              <div className="space-y-8">
                {/* Metrics top */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="glass p-6 rounded-2xl border border-white/5">
                    <span className="text-slate-500 text-xs font-bold uppercase block">Minhas Turmas</span>
                    <span className="text-3xl font-extrabold text-white mt-1 block">{metrics.classrooms_count}</span>
                  </div>
                  <div className="glass p-6 rounded-2xl border border-white/5">
                    <span className="text-slate-500 text-xs font-bold uppercase block">Total Alunos</span>
                    <span className="text-3xl font-extrabold text-white mt-1 block">{metrics.students_count}</span>
                  </div>
                  <div className="glass p-6 rounded-2xl border border-white/5">
                    <span className="text-slate-500 text-xs font-bold uppercase block">Provas Aplicadas</span>
                    <span className="text-3xl font-extrabold text-white mt-1 block">{metrics.exams_count}</span>
                  </div>
                  <div className="glass p-6 rounded-2xl border-2 border-neon-blue shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    <span className="text-neon-blue text-xs font-bold uppercase block">Aguardando Correção</span>
                    <span className="text-3xl font-extrabold text-white mt-1 block">{metrics.pending_grading_count}</span>
                  </div>
                </div>

                {/* Recharts Graphs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass p-6 rounded-2xl border border-white/5">
                    <h3 className="text-base font-bold text-white mb-6">Média de Performance por Tópicos</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#24324F" />
                          <XAxis dataKey="name" stroke="#94A3B8" />
                          <YAxis stroke="#94A3B8" />
                          <Tooltip contentStyle={{ backgroundColor: '#151D30', borderColor: '#24324F' }} />
                          <Bar dataKey="Valor" fill="#6366F1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass p-6 rounded-2xl border border-white/5">
                    <h3 className="text-base font-bold text-white mb-6">Auditoria de Segurança (Fraude nas Provas)</h3>
                    <div className="h-64 flex items-center justify-between">
                      <div className="w-1/2 h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={cheatData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {cheatData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#151D30', borderColor: '#24324F' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3 w-1/2 pr-4 text-xs font-semibold">
                        {cheatData.map((item, idx) => (
                          <div key={item.name} className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                            <span className="text-slate-400">{item.name}:</span>
                            <span className="text-white">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'exams' && !selectedExamForQuestions && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Criação */}
                <div className="glass p-6 rounded-2xl border border-white/5 h-fit">
                  <h3 className="text-lg font-bold text-white mb-6">Criar Avaliação</h3>
                  <form onSubmit={handleCreateExam} className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-2 uppercase">Título da Prova</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Prova Parcial de Algoritmos"
                        value={newExamTitle}
                        onChange={(e) => setNewExamTitle(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 outline-none focus:border-neon-blue/50 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-2 uppercase">Descrição / Ementa</label>
                      <textarea
                        placeholder="Aborda variáveis, condicionais..."
                        value={newExamDesc}
                        onChange={(e) => setNewExamDesc(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 outline-none focus:border-neon-blue/50 text-white text-sm h-20 resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-2 uppercase">Instruções aos Alunos</label>
                      <textarea
                        placeholder="Regras anti-cola, modo tela cheia..."
                        value={newExamInsts}
                        onChange={(e) => setNewExamInsts(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 outline-none focus:border-neon-blue/50 text-white text-sm h-20 resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 font-bold block mb-2 uppercase">Duração (Min)</label>
                        <input
                          type="number"
                          required
                          value={newExamDuration}
                          onChange={(e) => setNewExamDuration(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 outline-none focus:border-neon-blue/50 text-white text-sm font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 font-bold block mb-2 uppercase">Nota Total</label>
                        <input
                          type="text"
                          disabled
                          value="10.0"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-slate-500 text-sm font-bold text-center"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 font-bold block mb-2 uppercase">Turma</label>
                        <select
                          required
                          value={selectedClassroomId}
                          onChange={(e) => setSelectedClassroomId(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-dark-card border border-white/5 outline-none text-white text-xs font-bold"
                        >
                          <option value="">Escolher...</option>
                          {classrooms.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 font-bold block mb-2 uppercase">Disciplina</label>
                        <select
                          required
                          value={selectedSubjectId}
                          onChange={(e) => setSelectedSubjectId(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-dark-card border border-white/5 outline-none text-white text-xs font-bold"
                        >
                          <option value="">Escolher...</option>
                          {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Criar Rascunho
                    </button>
                  </form>
                </div>

                {/* Listagem Provas */}
                <div className="col-span-1 lg:col-span-2 glass p-6 rounded-2xl border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-6">Minhas Provas</h3>
                  <div className="space-y-4">
                    {exams.map((e) => (
                      <div key={e.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between md:flex-row md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-white">{e.title}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              e.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                              e.status === 'finished' ? 'bg-slate-500/20 text-slate-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {e.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-2">{e.description || 'Sem descrição.'}</p>
                          <div className="flex gap-4 text-xs text-slate-500 mt-3 font-semibold font-mono">
                            <span>Turma: {e.classroom ? e.classroom.name : 'N/A'}</span>
                            <span>Tempo: {e.duration_minutes} min</span>
                            <span>Questões: <span className="text-neon-blue font-bold">{e.questions_count}</span></span>
                          </div>
                        </div>
                        <div className="flex gap-2 self-end md:self-center shrink-0">
                          <button
                            onClick={() => handleViewQuestions(e)}
                            className="px-3 py-2 rounded-xl bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 text-xs font-bold"
                          >
                            Questões / IA
                          </button>
                          {e.status === 'draft' && (
                            <button
                              onClick={() => handleToggleExamStatus(e, 'active')}
                              className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-bold"
                            >
                              Publicar / Ativar
                            </button>
                          )}
                          {e.status === 'active' && (
                            <button
                              onClick={() => handleToggleExamStatus(e, 'finished')}
                              className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-xs font-bold"
                            >
                              Finalizar Prova
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteExam(e.id)}
                            className="p-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Banco de questões da prova selecionada */}
            {activeTab === 'exams' && selectedExamForQuestions && (
              <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                  <div>
                    <span className="text-xs text-slate-500 font-bold uppercase">Edição de Banco de Questões</span>
                    <h3 className="text-lg font-bold text-white mt-1">{selectedExamForQuestions.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedExamForQuestions(null)}
                    className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/10"
                  >
                    Voltar para Provas
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Form manual */}
                  <div className="glass p-6 rounded-2xl border border-white/5 h-fit space-y-6">
                    <div>
                      <h4 className="text-base font-bold text-white mb-4">Adicionar Questão</h4>
                      <form onSubmit={handleAddQuestion} className="space-y-4">
                        <div>
                          <label className="text-xs text-slate-400 font-bold block mb-1">Enunciado / Texto</label>
                          <textarea
                            required
                            placeholder="Escreva a questão..."
                            value={newQText}
                            onChange={(e) => setNewQText(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 outline-none focus:border-neon-blue/50 text-white text-sm h-24 resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-slate-400 font-bold block mb-1">Tipo</label>
                            <select
                              value={newQType}
                              onChange={(e) => setNewQType(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-dark-card border border-white/5 text-white text-xs font-bold"
                            >
                              <option value="multiple_choice">Múltipla Escolha</option>
                              <option value="true_false">V / F</option>
                              <option value="essay">Discursiva</option>
                              <option value="code">Código / TI</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 font-bold block mb-1">Pontos</label>
                            <input
                              type="number"
                              step="0.5"
                              required
                              value={newQPoints}
                              onChange={(e) => setNewQPoints(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-white text-xs font-semibold"
                            />
                          </div>
                        </div>
                        {newQType === 'multiple_choice' && (
                          <div>
                            <label className="text-xs text-slate-400 font-bold block mb-1">Opções (Separadas por vírgula)</label>
                            <input
                              type="text"
                              required
                              placeholder="Opção A, Opção B, Opção C..."
                              value={newQChoices}
                              onChange={(e) => setNewQChoices(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white text-xs font-medium"
                            />
                          </div>
                        )}
                        <div>
                          <label className="text-xs text-slate-400 font-bold block mb-1">Resposta Correta / Gabarito</label>
                          <input
                            type="text"
                            required
                            placeholder={newQType === 'true_false' ? 'Verdadeiro ou Falso' : 'Texto idêntico à alternativa ou resposta conceitual'}
                            value={newQCorrect}
                            onChange={(e) => setNewQCorrect(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white text-xs font-semibold"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-3 rounded-xl bg-neon-blue hover:scale-[1.01] text-white font-bold text-xs"
                        >
                          Adicionar Questão
                        </button>
                      </form>
                    </div>

                    {/* AI Generator Trigger */}
                    <div className="pt-6 border-t border-white/5">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/10 border border-neon-purple/30 text-center">
                        <Sparkles className="w-8 h-8 text-neon-purple mx-auto animate-pulse" />
                        <h4 className="font-bold text-white mt-2">Assistente de Questões IA</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Gere instantaneamente questões realistas de alto nível sobre TI e qualquer tema de cursos técnicos!
                        </p>
                        <button
                          onClick={() => { setShowAIModal(true); setAiTopic(selectedExamForQuestions.subject ? selectedExamForQuestions.subject.name : ''); }}
                          className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <Brain className="w-4 h-4" /> Gerar com IA
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Listagem de Questões */}
                  <div className="col-span-1 lg:col-span-2 glass p-6 rounded-2xl border border-white/5 space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">Questões da Prova ({examQuestions.length})</h3>
                    {examQuestions.length === 0 ? (
                      <p className="text-slate-500 text-sm py-10 text-center">Nenhuma questão adicionada nesta prova ainda. Adicione manualmente ou use a IA!</p>
                    ) : (
                      <div className="space-y-4">
                        {examQuestions.map((q, idx) => (
                          <div key={q.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex justify-between items-start gap-4">
                              <span className="text-xs font-bold text-neon-blue font-mono">Questão {idx + 1} ({q.points} pt)</span>
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="text-slate-500 hover:text-red-400 transition-colors p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-sm text-white mt-2 font-medium whitespace-pre-line">{q.text}</p>
                            
                            {q.choices && q.choices.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
                                {q.choices.map((choice, cIdx) => (
                                  <div key={cIdx} className="p-2 rounded bg-white/5 border border-white/5 text-slate-400">
                                    {choice}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="mt-4 pt-3 border-t border-white/5 text-xs">
                              <span className="text-slate-500">Gabarito: </span>
                              <span className="font-bold text-emerald-400 font-mono">{q.correct_answer}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submissões enviadas para correção */}
            {activeTab === 'submissions' && !selectedSubmission && (
              <div className="glass p-6 rounded-2xl border border-white/5 overflow-hidden">
                <h3 className="text-lg font-bold text-white mb-6">Submissões de Provas de Alunos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 font-semibold">
                        <th className="pb-4">Aluno</th>
                        <th className="pb-4">Avaliação</th>
                        <th className="pb-4">Envio</th>
                        <th className="pb-4">Infracões Anti-Cola</th>
                        <th className="pb-4">Status</th>
                        <th className="pb-4">Nota</th>
                        <th className="pb-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {submissions.map((sub) => (
                        <tr key={sub.id}>
                          <td className="py-4 font-bold text-white">{sub.student ? sub.student.name : 'Ex-aluno'}</td>
                          <td className="py-4 text-slate-400">{sub.exam ? sub.exam.title : 'N/A'}</td>
                          <td className="py-4 text-xs text-slate-500 font-mono">
                            {sub.finished_at ? new Date(sub.finished_at).toLocaleString() : 'N/A'}
                          </td>
                          <td className="py-4">
                            {sub.cheating_logs && sub.cheating_logs.length > 0 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 animate-pulse flex items-center gap-1 w-fit">
                                <ShieldAlert className="w-3 h-3" /> {sub.cheating_logs.length} infrações!
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 w-fit block">
                                Seguro
                              </span>
                            )}
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              sub.status === 'graded' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {sub.status === 'graded' ? 'Corrigido' : 'Pendente'}
                            </span>
                          </td>
                          <td className="py-4 font-bold font-mono text-base">
                            {sub.score !== null ? (
                              <span className="text-neon-blue">{sub.score} / {sub.exam ? sub.exam.total_score : 10}</span>
                            ) : (
                              <span className="text-slate-500">--</span>
                            )}
                          </td>
                          <td className="py-4 text-right flex justify-end gap-2">
                            <button
                              onClick={() => handleReviewSubmission(sub)}
                              className="px-3 py-1.5 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 text-xs font-bold"
                            >
                              Corrigir
                            </button>
                            {sub.status === 'submitted' && (
                              <button
                                onClick={() => handleAutoGradeWithAI(sub.id)}
                                className="px-3 py-1.5 rounded-lg bg-neon-purple/20 text-neon-purple border border-neon-purple/20 hover:bg-neon-purple/30 text-xs font-bold flex items-center gap-1"
                              >
                                <Cpu className="w-3.5 h-3.5" /> Corrigir com IA
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tela de correção manual */}
            {activeTab === 'submissions' && selectedSubmission && (
              <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                  <div>
                    <span className="text-xs text-slate-500 font-bold uppercase">Revisão de Respostas do Aluno</span>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {selectedSubmission.student ? selectedSubmission.student.name : 'Aluno'} - {selectedSubmission.exam ? selectedSubmission.exam.title : ''}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    {selectedSubmission.status === 'submitted' && (
                      <button
                        onClick={() => handleAutoGradeWithAI(selectedSubmission.id)}
                        className="px-4 py-2 rounded-xl bg-neon-purple text-white text-xs font-bold flex items-center gap-1.5 shadow"
                      >
                        <Cpu className="w-4 h-4 animate-spin-slow" /> Correção Mágica por IA
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/10"
                    >
                      Voltar para Lista
                    </button>
                  </div>
                </div>

                {/* Anti-cheating logs review */}
                {selectedSubmission.cheating_logs && selectedSubmission.cheating_logs.length > 0 && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border-2 border-red-500/20 text-red-400">
                    <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                      <ShieldAlert className="w-5 h-5 animate-pulse" />
                       logs Anti-Cola Detectados ({selectedSubmission.cheating_logs.length})
                    </h4>
                    <div className="mt-3 space-y-2 text-xs font-mono">
                      {selectedSubmission.cheating_logs.map((log, idx) => (
                        <div key={idx} className="p-2 rounded bg-red-500/5 flex justify-between border border-red-500/10">
                          <span>{log.message}</span>
                          <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Respostas para correção */}
                <div className="space-y-6">
                  {submissionAnswers.map((ans, idx) => (
                    <div key={ans.id} className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-xs font-bold text-neon-blue font-mono">Questão {idx + 1} - Tipo: {ans.question ? ans.question.type : 'N/A'}</span>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-500 font-bold">Pontos Obtidos:</label>
                          <input
                            type="number"
                            step="0.1"
                            max={ans.max_points}
                            value={ans.points_earned || 0}
                            onChange={(e) => {
                              const updated = [...submissionAnswers];
                              updated[idx].points_earned = parseFloat(e.target.value);
                              updated[idx].is_correct = parseFloat(e.target.value) >= ans.max_points / 2;
                              setSubmissionAnswers(updated);
                            }}
                            className="w-16 px-2 py-1 bg-white/5 border border-white/5 text-white font-mono text-center text-xs font-bold rounded"
                          />
                          <span className="text-xs text-slate-500">/ {ans.max_points}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-300 font-medium whitespace-pre-line">
                        {ans.question_text || (ans.question ? ans.question.text : '')}
                      </p>

                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm">
                        <span className="text-xs text-slate-500 font-bold block uppercase mb-1">Resposta do Aluno:</span>
                        <p className="font-mono text-white whitespace-pre-line">{ans.student_response}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs">
                        <span className="text-slate-500 font-bold block uppercase mb-1">Gabarito Esperado:</span>
                        <p className="font-mono text-emerald-400 whitespace-pre-line">{ans.correct_answer}</p>
                      </div>

                      <div>
                        <label className="text-xs text-slate-500 font-bold block mb-1">Feedback do Professor / IA</label>
                        <input
                          type="text"
                          value={ans.feedback || ''}
                          onChange={(e) => {
                            const updated = [...submissionAnswers];
                            updated[idx].feedback = e.target.value;
                            setSubmissionAnswers(updated);
                          }}
                          className="w-full px-3 py-2 bg-white/5 border border-white/5 outline-none focus:border-neon-blue/50 text-xs font-medium rounded-xl text-white"
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end gap-3 mt-8">
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="px-6 py-3 rounded-xl border border-white/10 text-slate-300 text-sm font-bold hover:bg-white/10"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveCorrection}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white text-sm font-bold shadow-md hover:scale-[1.01]"
                    >
                      Salvar e Divulgar Nota
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* AI GENERATION MODAL */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl glass p-6 rounded-3xl border border-white/10 max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-neon-purple animate-pulse" />
                Assistente de IA: Gerador de Questões Técnicas
              </h3>
              <button
                onClick={() => { setShowAIModal(false); setGeneratedQuestions([]); }}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-slate-400 font-bold block mb-1">Tópico de Estudo / Matéria</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Condicionais Python, Normalização de Banco de Dados, etc."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 outline-none focus:border-neon-blue/50 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={aiQty}
                  onChange={(e) => setAiQty(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 outline-none text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Dificuldade</label>
                <select
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-card border border-white/5 text-white text-xs font-bold"
                >
                  <option value="fácil">Fácil</option>
                  <option value="média">Média</option>
                  <option value="difícil">Difícil</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateAI}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg"
            >
              <Cpu className="w-4 h-4" /> Gerar Questões na Hora
            </button>

            {/* Results */}
            {generatedQuestions.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Questões Geradas pela IA:</span>
                <div className="space-y-4">
                  {generatedQuestions.map((q, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between md:flex-row md:items-start gap-4">
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-neon-purple block font-mono">
                          Questão {idx + 1} ({q.type} - {q.points} pt)
                        </span>
                        <p className="text-xs text-white font-medium whitespace-pre-line">{q.text}</p>
                        {q.choices && q.choices.length > 0 && (
                          <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 font-mono mt-2">
                            {q.choices.map((c, cIdx) => (
                              <div key={cIdx} className="p-1.5 rounded bg-white/5 border border-white/5">{c}</div>
                            ))}
                          </div>
                        )}
                        <span className="text-[10px] text-emerald-400 font-bold block mt-2">
                          Gabarito da IA: {q.correct_answer}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAcceptAIQuestion(q)}
                        className="py-1.5 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 shrink-0 self-end md:self-start"
                      >
                        Aceitar e Incluir
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
