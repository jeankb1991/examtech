import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Lock, Mail, ArrowRight, ShieldAlert, CheckCircle2, User, KeyRound } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e, demoCreds = null) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const loginEmail = demoCreds ? demoCreds.email : email;
    const loginPassword = demoCreds ? demoCreds.password : password;

    try {
      const data = await api.login(loginEmail, loginPassword);
      localStorage.setItem('examtech_token', data.token);
      localStorage.setItem('examtech_user', JSON.stringify(data.user));
      
      // Redireciona conforme o cargo
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'professor') {
        navigate('/professor');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@examtech.com');
      setPassword('admin123');
      handleLogin(null, { email: 'admin@examtech.com', password: 'admin123' });
    } else if (role === 'professor') {
      setEmail('professor1@examtech.com');
      setPassword('admin123');
      handleLogin(null, { email: 'professor1@examtech.com', password: 'admin123' });
    } else if (role === 'student') {
      setEmail('aluno1@examtech.com');
      setPassword('admin123');
      handleLogin(null, { email: 'aluno1@examtech.com', password: 'admin123' });
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex items-center justify-center p-6 relative selection:bg-neon-purple/30">
      {/* Background glow blur */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-neon-purple/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass p-8 rounded-3xl border border-white/5 relative z-10 shadow-2xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] mb-3 text-lg">
            ET
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            EXAM<span className="text-gradient">TECH</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">Sua plataforma SaaS de Provas com IA</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-3 items-start mb-6">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={(e) => handleLogin(e)} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                placeholder="nome@escola.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/5 focus:border-neon-blue/50 focus:bg-white/10 outline-none text-white transition-all text-sm font-medium"
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
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/5 focus:border-neon-blue/50 focus:bg-white/10 outline-none text-white transition-all text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple hover:scale-[1.01] active:scale-[0.99] text-white font-bold tracking-wide transition-all shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Entrar no Sistema <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-neon-blue font-bold hover:underline">
            Cadastre-se grátis
          </Link>
        </div>

        {/* Demo fast-login tool */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block text-center mb-4 flex items-center justify-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-neon-blue" />
            Acesso Rápido para Demonstração (Demo)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => fillDemo('admin')}
              className="py-2.5 px-1.5 text-[11px] font-bold rounded-lg border border-white/5 bg-white/5 hover:bg-neon-blue/10 hover:border-neon-blue/30 text-slate-300 hover:text-neon-blue transition-all"
            >
              Diretora Admin
            </button>
            <button
              onClick={() => fillDemo('professor')}
              className="py-2.5 px-1.5 text-[11px] font-bold rounded-lg border border-white/5 bg-white/5 hover:bg-neon-purple/10 hover:border-neon-purple/30 text-slate-300 hover:text-neon-purple transition-all"
            >
              Prof. Carlos
            </button>
            <button
              onClick={() => fillDemo('student')}
              className="py-2.5 px-1.5 text-[11px] font-bold rounded-lg border border-white/5 bg-white/5 hover:bg-neon-pink/10 hover:border-neon-pink/30 text-slate-300 hover:text-neon-pink transition-all"
            >
              Aluno Jean
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
