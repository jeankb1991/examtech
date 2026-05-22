import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Users, BookOpen, GraduationCap, Server, LogOut, 
  Plus, Check, X, ShieldAlert, Award, FileText, LayoutDashboard, Settings
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'users', 'classrooms', 'subjects', 'logs'
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Forms
  const [newClassroomName, setNewClassroomName] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDesc, setNewSubjectDesc] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('examtech_user') || '{}');

  useEffect(() => {
    if (!localStorage.getItem('examtech_token') || user.role !== 'admin') {
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
        const data = await api.getAdminMetrics();
        setMetrics(data);
      } else if (activeTab === 'users') {
        const data = await api.getAdminUsers();
        setUsers(data);
      } else if (activeTab === 'classrooms') {
        const classData = await api.getClassrooms();
        setClassrooms(classData);
        // Pega os professores para popular o select
        const userData = await api.getAdminUsers();
        setUsers(userData.filter(u => u.role === 'professor' && u.is_active));
      } else if (activeTab === 'subjects') {
        const data = await api.getSubjects();
        setSubjects(data);
      } else if (activeTab === 'logs') {
        const data = await api.getAdminLogs();
        setLogs(data);
      }
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados do painel.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('examtech_token');
    localStorage.removeItem('examtech_user');
    navigate('/');
  };

  const handleToggleUser = async (userId) => {
    try {
      await api.toggleUserActive(userId);
      setSuccess('Status do usuário atualizado!');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateClassroom = async (e) => {
    e.preventDefault();
    if (!newClassroomName || !selectedTeacherId) return;
    try {
      await api.createClassroom(newClassroomName, selectedTeacherId);
      setSuccess('Turma criada com sucesso!');
      setNewClassroomName('');
      setSelectedTeacherId('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteClassroom = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta turma?')) return;
    try {
      await api.deleteClassroom(id);
      setSuccess('Turma excluída com sucesso!');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName) return;
    try {
      await api.createSubject(newSubjectName, newSubjectDesc);
      setSuccess('Disciplina criada com sucesso!');
      setNewSubjectName('');
      setNewSubjectDesc('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta disciplina?')) return;
    try {
      await api.deleteSubject(id);
      setSuccess('Disciplina excluída com sucesso!');
      loadData();
    } catch (err) {
      setError(err.message);
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
            <p className="text-xs text-slate-500 font-semibold block uppercase">Administrador</p>
            <p className="text-sm font-bold text-white mt-1 truncate">{user.name}</p>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 space-y-1.5 mt-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border-l-4 border-neon-blue text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border-l-4 border-neon-blue text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" /> Usuários / Aprovações
            </button>
            <button
              onClick={() => setActiveTab('classrooms')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'classrooms'
                  ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border-l-4 border-neon-blue text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <GraduationCap className="w-5 h-5" /> Gerenciar Turmas
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'subjects'
                  ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border-l-4 border-neon-blue text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <BookOpen className="w-5 h-5" /> Disciplinas
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'logs'
                  ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border-l-4 border-neon-blue text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Server className="w-5 h-5" /> Auditoria Geral
            </button>
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-sm font-bold transition-all"
          >
            <LogOut className="w-4 h-4" /> Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white capitalize">{activeTab}</h1>
            <p className="text-sm text-slate-400">Controle total da plataforma EdTech ExamTech.</p>
          </div>
          <div className="text-xs text-slate-500 font-mono py-1 px-3 rounded-lg border border-white/5 bg-white/5">
            SaaS Ativo: v1.0.0
          </div>
        </div>

        {/* Feedback alerts */}
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

        {/* Tab content rendering */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && metrics && (
              <div className="space-y-8">
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="glass p-6 rounded-2xl border border-white/5">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Alunos Cadastrados</span>
                    <span className="text-3xl font-extrabold text-white mt-2 block">{metrics.students_count}</span>
                  </div>
                  <div className="glass p-6 rounded-2xl border border-white/5">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Professores Cadastrados</span>
                    <span className="text-3xl font-extrabold text-white mt-2 block">{metrics.teachers_count}</span>
                  </div>
                  <div className="glass p-6 rounded-2xl border border-white/5">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Turmas Criadas</span>
                    <span className="text-3xl font-extrabold text-white mt-2 block">{metrics.classrooms_count}</span>
                  </div>
                  <div className="glass p-6 rounded-2xl border border-white/5">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Provas Aplicadas</span>
                    <span className="text-3xl font-extrabold text-white mt-2 block">{metrics.exams_count}</span>
                  </div>
                </div>

                {/* Recent activity & Pendings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="col-span-1 md:col-span-2 glass p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-6">Logs de Auditoria Recentes</h3>
                    <div className="space-y-4">
                      {metrics.recent_logs && metrics.recent_logs.map((log) => (
                        <div key={log.id} className="p-3 rounded-lg bg-white/5 border border-white/5 flex justify-between text-xs">
                          <div>
                            <span className="font-bold text-neon-blue">{log.action}</span>
                            <p className="text-slate-400 mt-1">{log.details}</p>
                          </div>
                          <span className="text-slate-500 font-mono">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="glass p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-6">Aprovações Pendentes</h3>
                    {metrics.pending_users_count > 0 ? (
                      <div className="text-center py-6">
                        <span className="text-4xl font-extrabold text-neon-purple">{metrics.pending_users_count}</span>
                        <p className="text-sm text-slate-400 mt-2">Usuário(s) aguardando ativação de acesso.</p>
                        <button
                          onClick={() => setActiveTab('users')}
                          className="mt-6 py-2.5 px-4 rounded-xl bg-neon-blue text-white text-xs font-bold w-full"
                        >
                          Ir para Aprovações
                        </button>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm text-center py-10">Tudo em dia! Nenhum usuário pendente.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="glass p-6 rounded-2xl border border-white/5 overflow-hidden">
                <h3 className="text-lg font-bold text-white mb-6">Controle Geral de Contas</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 font-semibold">
                        <th className="pb-4">Nome</th>
                        <th className="pb-4">E-mail</th>
                        <th className="pb-4">Cargo</th>
                        <th className="pb-4">Acesso</th>
                        <th className="pb-4 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map((u) => (
                        <tr key={u.id} className="text-slate-300">
                          <td className="py-4 font-bold text-white">{u.name}</td>
                          <td className="py-4 font-mono text-xs">{u.email}</td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              u.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                              u.role === 'professor' ? 'bg-neon-purple/20 text-neon-purple' :
                              'bg-neon-blue/20 text-neon-blue'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {u.is_active ? 'Ativo' : 'Pendente'}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            {u.id !== user.id && (
                              <button
                                onClick={() => handleToggleUser(u.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  u.is_active 
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                }`}
                              >
                                {u.is_active ? 'Bloquear' : 'Aprovar'}
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

            {activeTab === 'classrooms' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Cadastro */}
                <div className="glass p-6 rounded-2xl border border-white/5 h-fit">
                  <h3 className="text-lg font-bold text-white mb-6">Criar Nova Turma</h3>
                  <form onSubmit={handleCreateClassroom} className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-2 uppercase">Nome da Turma</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Técnico em Informática B"
                        value={newClassroomName}
                        onChange={(e) => setNewClassroomName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 outline-none focus:border-neon-blue/50 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-2 uppercase">Professor Responsável</label>
                      <select
                        required
                        value={selectedTeacherId}
                        onChange={(e) => setSelectedTeacherId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-dark-card border border-white/5 outline-none focus:border-neon-blue/50 text-white text-sm"
                      >
                        <option value="">Selecione um Professor...</option>
                        {users.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Criar Turma
                    </button>
                  </form>
                </div>

                {/* Listagem */}
                <div className="col-span-1 lg:col-span-2 glass p-6 rounded-2xl border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-6">Turmas Ativas</h3>
                  <div className="space-y-4">
                    {classrooms.map((c) => (
                      <div key={c.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-base font-bold text-white">{c.name}</span>
                          <div className="flex gap-4 text-xs text-slate-400 mt-2 font-mono">
                            <span>Código: <span className="text-neon-blue font-bold">{c.code}</span></span>
                            <span>Alunos: {c.students_count}</span>
                            <span>Prof: {c.teacher ? c.teacher.name : 'Nenhum'}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteClassroom(c.id)}
                          className="p-2 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-400 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'subjects' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Cadastro */}
                <div className="glass p-6 rounded-2xl border border-white/5 h-fit">
                  <h3 className="text-lg font-bold text-white mb-6">Criar Nova Disciplina</h3>
                  <form onSubmit={handleCreateSubject} className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-2 uppercase">Nome da Disciplina</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Banco de Dados II"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 outline-none focus:border-neon-blue/50 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-2 uppercase">Descrição</label>
                      <textarea
                        placeholder="Ex: Introdução a queries SQL..."
                        value={newSubjectDesc}
                        onChange={(e) => setNewSubjectDesc(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 outline-none focus:border-neon-blue/50 text-white text-sm h-24 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Criar Disciplina
                    </button>
                  </form>
                </div>

                {/* Listagem */}
                <div className="col-span-1 lg:col-span-2 glass p-6 rounded-2xl border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-6">Disciplinas Ativas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subjects.map((s) => (
                      <div key={s.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                        <div>
                          <span className="text-base font-bold text-white">{s.name}</span>
                          <p className="text-xs text-slate-400 mt-2 line-clamp-2">{s.description || 'Sem descrição cadastrada.'}</p>
                        </div>
                        <div className="flex justify-end mt-4">
                          <button
                            onClick={() => handleDeleteSubject(s.id)}
                            className="p-2 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-400 transition-all text-xs font-bold flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" /> Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="glass p-6 rounded-2xl border border-white/5 overflow-hidden">
                <h3 className="text-lg font-bold text-white mb-6">Logs de Atividade Centralizados</h3>
                <div className="overflow-x-auto max-h-[600px]">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 font-semibold font-mono text-xs">
                        <th className="pb-4">Timestamp</th>
                        <th className="pb-4">Usuário</th>
                        <th className="pb-4">Ação</th>
                        <th className="pb-4">Endereço IP</th>
                        <th className="pb-4">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-xs text-slate-300">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/5">
                          <td className="py-3 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="py-3 font-bold text-white">
                            {log.user ? `${log.user.name} (${log.user.role})` : 'Visitante / Visitante'}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.action.includes('INFRACAO') || log.action.includes('EXCLUIR') ? 'bg-red-500/20 text-red-400' :
                              log.action.includes('CRIAR') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neon-blue/20 text-neon-blue'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 text-slate-500">{log.ip_address}</td>
                          <td className="py-3 max-w-sm truncate text-slate-400" title={log.details}>
                            {log.details}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
