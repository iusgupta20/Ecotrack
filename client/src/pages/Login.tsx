import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Leaf, Lock, Mail, User, Eye, EyeOff, Zap, AlertTriangle, BarChart3, Trophy, Sparkles, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, register, loginAsGuest } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Name is required');
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setGuestLoading(true);
    try {
      await loginAsGuest();
    } catch (err: any) {
      setError(err?.message || 'Failed to start demo session. Please try again.');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{
        background: 'radial-gradient(circle at 15% 20%, rgba(16, 185, 129, 0.18), transparent 35%), radial-gradient(circle at 85% 10%, rgba(59, 130, 246, 0.16), transparent 30%), linear-gradient(120deg, #071a2c 0%, #0a2440 55%, #08142b 100%)'
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 shadow-[0_30px_90px_rgba(2,6,23,0.5)] md:min-h-[680px]">
        <section className="relative hidden w-[58%] p-10 text-white md:block" style={{ background: 'linear-gradient(180deg, rgba(8, 56, 82, 0.65), rgba(12, 31, 67, 0.8))' }}>
          <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl"></div>
          <div className="absolute -bottom-10 right-10 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl"></div>

          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1.5 text-sm font-semibold text-emerald-300">
              <Leaf size={15} /> EcoTrack
            </div>

            <h1 className="max-w-md text-4xl font-black leading-tight tracking-tight">
              Track Your
              <span className="block bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Carbon Footprint
              </span>
              Build a Greener Future.
            </h1>

            <p className="mt-4 max-w-lg text-sm text-slate-200/85">
              Join thousands of people discovering their environmental impact and turning daily habits into measurable climate action.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-emerald-200">12k+ users</span>
              <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-cyan-200">450t CO2 saved</span>
              <span className="rounded-full border border-blue-300/30 bg-blue-400/10 px-3 py-1 text-blue-200">98k actions done</span>
            </div>

            <div className="mt-8 space-y-3">
              {[
                { icon: <BarChart3 size={16} />, title: 'Personal Carbon Calculator', subtitle: 'Know your exact footprint in minutes' },
                { icon: <Sparkles size={16} />, title: 'AI Sustainability Assistant', subtitle: 'Get personalized eco advice 24/7' },
                { icon: <Trophy size={16} />, title: 'Eco Challenges & Rewards', subtitle: 'Earn badges and climb the leaderboard' }
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-200">{item.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-slate-300">{item.subtitle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full p-6 md:w-[42%] md:p-10" style={{ background: 'linear-gradient(180deg, rgba(12, 24, 48, 0.96), rgba(10, 20, 42, 0.98))' }}>
          <div className="mx-auto w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900/75 p-6 shadow-[0_18px_42px_rgba(2,6,23,0.55)] backdrop-blur-md">
            <div className="mb-5 rounded-xl border border-white/10 bg-slate-800/60 p-1">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError('');
                  }}
                  className="rounded-lg px-2 py-2 text-xs font-semibold transition-all"
                  style={isRegister ? { color: '#94a3b8' } : { background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#022c22' }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setError('');
                  }}
                  className="rounded-lg px-2 py-2 text-xs font-semibold transition-all"
                  style={isRegister ? { background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#022c22' } : { color: '#94a3b8' }}
                >
                  Create Account
                </button>
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-white">{isRegister ? 'Create your account' : 'Welcome back'}</h2>
            <p className="mt-1 text-xs text-slate-400">
              {isRegister ? 'Start your eco journey today.' : 'Sign in to continue your eco journey.'}
            </p>

            {error && (
              <div
                className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-xs text-red-200"
                role="alert"
              >
                <span className="flex items-center gap-2"><AlertTriangle size={14} /> {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              {isRegister && (
                <div>
                  <label htmlFor="name-input" className="mb-1.5 block text-[11px] font-bold tracking-wide text-slate-400">
                    FULL NAME
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-500"><User size={15} /></span>
                    <input
                      id="name-input"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/90 py-2.5 pl-9 pr-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email-input" className="mb-1.5 block text-[11px] font-bold tracking-wide text-slate-400">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-500"><Mail size={15} /></span>
                  <input
                    id="email-input"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/90 py-2.5 pl-9 pr-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password-input" className="mb-1.5 block text-[11px] font-bold tracking-wide text-slate-400">
                  PASSWORD
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-500"><Lock size={15} /></span>
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/90 py-2.5 pl-9 pr-10 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 transition hover:text-slate-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-400 py-2.5 text-sm font-extrabold text-emerald-950 transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
                <ArrowRight size={15} />
              </button>
            </form>

            <div className="my-3 text-center text-xs text-slate-500">or</div>

            <button
              onClick={handleGuestLogin}
              disabled={guestLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-400/10 py-2.5 text-xs font-bold text-emerald-200 transition hover:bg-emerald-400/15 disabled:opacity-60"
            >
              <Zap size={14} />
              {guestLoading ? 'Setting up demo...' : 'Continue as Guest'}
            </button>

            <p className="mt-3 flex items-center justify-center gap-1 text-[10px] text-slate-500">
              <AlertTriangle size={10} /> Demo session data is temporary.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
