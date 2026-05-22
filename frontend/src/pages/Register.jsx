import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Lock, Mail, ArrowRight, ShieldAlert, User, ShieldCheck, HelpCircle } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student', 'professor', 'admin'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await api.register(name, email, password, role);
      setSuccess(data.status_message || 'Cadastro realizado com sucesso!');
      
      // Limpa formulário
      setName('');
      setEmail('');
      setPassword('');
      
      // Se for aluno ou admin, já redireciona para login em 3 segundos. Se professor, dá o feedback da aprovação do admin
      setTimeout(() => {
        navigate('/login');
      }, 4000);
    } catch (err) {
      setError(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex items-center justify-center p-6 relative selection:bg-neon-purple/30">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-neon-blue/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass p-8 rounded-3xl border border-white/5 relative z-10 shadow-2xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] mb-3 text-lg">
            ET
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            CRIAR <span className="text-gradient">CONTA</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">Junte-se à EdTech futurista de exames</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-3 items-start mb-6">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex gap-3 items-start mb-6">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Sucesso!</p>
              <p className="text-xs text-slate-300 mt-1">{success}</p>
              <p className="text-[11px] text-neon-blue mt-2 animate-pulse">Redirecionando para tela de acesso...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                required
                placeholder="Ex: Jean Lucas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 focus:border-neon-blue/50 focus:bg-white/10 outline-none text-white transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                placeholder="Ex: aluno@examtech.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 focus:border-neon-blue/50 focus:bg-white/10 outline-none text-white transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 focus:border-neon-blue/50 focus:bg-white/10 outline-none text-white transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Eu sou um(a)</label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                  role === 'student'
                    ? 'border-neon-blue bg-neon-blue/10 text-white'
                    : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Estudante / Aluno
              </button>
              <button
                type="button"
                onClick={() => setRole('professor')}
                className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                  role === 'professor'
                    ? 'border-neon-purple bg-neon-purple/10 text-white'
                    : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Professor(a)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple hover:scale-[1.01] active:scale-[0.99] text-white font-bold tracking-wide transition-all shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Cadastrar-se <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Já possui uma conta?{' '}
          <Link to="/login" className="text-neon-blue font-bold hover:underline">
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
}
