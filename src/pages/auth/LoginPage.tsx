import { useState } from 'react';
import {
  Eye, EyeOff, ChevronDown, ChevronUp,
  FolderGit2, Bug, GitPullRequest, Tag, ArrowRight, Github,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { createGitHubAPI } from '../../services/github';
import type { Account } from '../../types';
import logoImg from '../../assets/easy-git-icon.svg';
import { DeviceFlowModal } from '../../components/auth/DeviceFlowModal';

export function LoginPage() {
  const { t, addAccount, navigate } = useApp();
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [guideOpen, setGuideOpen] = useState(false);
  const [deviceOpen, setDeviceOpen] = useState(false);
  const [showPat, setShowPat] = useState(false);

  const steps = [
    t('auth.tokenGuideStep1'),
    t('auth.tokenGuideStep2'),
    t('auth.tokenGuideStep3'),
    t('auth.tokenGuideStep4'),
    t('auth.tokenGuideStep5'),
    t('auth.tokenGuideStep6'),
    t('auth.tokenGuideStep7'),
    t('auth.tokenGuideStep8'),
  ];

  const features = [
    { icon: <FolderGit2 size={15} />, label: t('auth.features.repos') },
    { icon: <Bug size={15} />, label: t('auth.features.issues') },
    { icon: <GitPullRequest size={15} />, label: t('auth.features.pulls') },
    { icon: <Tag size={15} />, label: t('auth.features.releases') },
  ];

  const buildAndAddAccount = async (accessToken: string) => {
    const api = createGitHubAPI(accessToken);
    const user = await api.users.getAuthenticatedUser();
    const account: Account = {
      id: String(user.id),
      username: user.login,
      token: accessToken,
      avatarUrl: user.avatar_url,
      name: user.name,
      addedAt: new Date().toISOString(),
    };
    addAccount(account);
    navigate({ name: 'dashboard' });
  };

  const handleDeviceSuccess = async (token: string) => {
    setDeviceOpen(false);
    setError('');
    setLoading(true);
    try {
      await buildAndAddAccount(token);
    } catch {
      setError(t('auth.invalidToken'));
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    const trimmed = token.trim();
    if (!trimmed) return;
    setError('');
    setLoading(true);
    try {
      await buildAndAddAccount(trimmed);
    } catch {
      setError(t('auth.invalidToken'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-dark-scope min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
      <div className="app-bg absolute inset-0 z-0" />

      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative z-10">
        <div>
          <div className="flex items-center gap-3.5 mb-14">
            <div
              className="w-11 h-11 shrink-0"
            >
              <img src={logoImg} alt="Easy Git" className="w-full h-full" />
            </div>
            <div>
              <p className="text-sm font-black tracking-widest uppercase" style={{
                background: 'linear-gradient(135deg, #f9cf47 0%, #f0b429 50%, #d4941a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Easy Git
              </p>
              <p className="text-[10px] tracking-[0.25em] uppercase text-slate-500">{t('brand.tagline')}</p>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-slate-100 leading-tight mb-4">
            {t('auth.welcomeTitle')}
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-10">
            {t('auth.welcomeSubtitle')}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {features.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-3 p-3.5 rounded-xl transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(240,180,41,0.1)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(240,180,41,0.1)', color: '#f0b429' }}
                >
                  {f.icon}
                </div>
                <span className="text-sm text-slate-300">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          {t('brand.by')}{' '}
          <a href="https://lumeniawebstudio.com" target="_blank" rel="noreferrer" className="hover:text-slate-300 underline-offset-2 hover:underline">
            Lumenia Web Studio
          </a>
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div
          className="w-full max-w-md rounded-2xl p-8"
          style={{
            background: 'rgba(8,13,26,0.8)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(240,180,41,0.15)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(240,180,41,0.04)',
          }}
        >
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div
              className="w-9 h-9 shrink-0"
            >
              <img src={logoImg} alt="Easy Git" className="w-full h-full" />
            </div>
            <div>
              <p className="text-xs font-black tracking-widest uppercase" style={{
                background: 'linear-gradient(135deg, #f9cf47 0%, #f0b429 50%, #d4941a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Easy Git
              </p>
              <p className="text-[9px] tracking-[0.2em] uppercase text-slate-500">{t('brand.tagline')}</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-100 mb-1">{t('auth.connectTitle')}</h2>
          <p className="text-slate-500 text-sm mb-7">{t('auth.connectSubtitle')}</p>

          <div className="space-y-4">
            {/* Bouton Device Flow */}
            <button
              type="button"
              onClick={() => setDeviceOpen(true)}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(240,180,41,0.25)',
                color: '#e2e8f0',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240,180,41,0.5)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240,180,41,0.25)';
              }}
            >
              <Github size={17} />
              {t('auth.oauthBtn')}
            </button>

            {/* Séparateur */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <button
                type="button"
                onClick={() => setShowPat(p => !p)}
                className="text-xs transition-colors"
                style={{ color: 'rgba(240,180,41,0.5)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,180,41,0.8)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,180,41,0.5)')}
              >
                {t('auth.oauthAdvanced')}
              </button>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {showPat && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 tracking-wide uppercase">
                    {t('auth.tokenLabel')}
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={token}
                      onChange={(e) => { setToken(e.target.value); setError(''); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleConnect(); }}
                      placeholder={t('auth.tokenPlaceholder')}
                      className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-slate-100 placeholder-slate-600
                        focus:outline-none transition-all font-mono"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: error ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(240,180,41,0.15)',
                        boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.1)' : undefined,
                      }}
                      onFocus={e => {
                        if (!error) e.currentTarget.style.borderColor = 'rgba(240,180,41,0.4)';
                        if (!error) e.currentTarget.style.boxShadow = '0 0 0 3px rgba(240,180,41,0.08)';
                      }}
                      onBlur={e => {
                        if (!error) e.currentTarget.style.borderColor = 'rgba(240,180,41,0.15)';
                        if (!error) e.currentTarget.style.boxShadow = '';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
                    >
                      {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
                  <p className="text-xs text-slate-600 mt-2">{t('auth.tokenHelp')}</p>
                </div>

                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={!token.trim() || loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: loading || !token.trim() ? 'rgba(240,180,41,0.3)' : 'linear-gradient(135deg, #f9cf47 0%, #f0b429 60%, #d4941a 100%)',
                    color: '#0c1525',
                    boxShadow: token.trim() && !loading ? '0 4px 20px rgba(240,180,41,0.3)' : undefined,
                  }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t('auth.connecting')}
                    </span>
                  ) : (
                    <>
                      {t('auth.connectBtn')}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setGuideOpen(!guideOpen)}
              className="flex items-center gap-2 text-sm transition-colors"
              style={{ color: 'rgba(240,180,41,0.7)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f0b429')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,180,41,0.7)')}
            >
              {guideOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              {t('auth.createToken')}
            </button>

            {guideOpen && (
              <div
                className="mt-4 p-4 rounded-xl space-y-3 animate-in fade-in duration-150"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(240,180,41,0.1)' }}
              >
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{t('auth.tokenGuideTitle')}</h3>
                <ol className="space-y-2">
                  {steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span
                        className="w-5 h-5 rounded-full text-xs flex items-center justify-center shrink-0 mt-0.5 font-semibold"
                        style={{ background: 'rgba(240,180,41,0.15)', color: '#f0b429', border: '1px solid rgba(240,180,41,0.2)' }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-slate-500 text-xs leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(240,180,41,0.06)', border: '1px solid rgba(240,180,41,0.15)' }}>
                  <p className="text-xs" style={{ color: 'rgba(240,180,41,0.8)' }}>{t('auth.tokenGuideNote')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {deviceOpen && (
        <DeviceFlowModal
          onSuccess={handleDeviceSuccess}
          onClose={() => setDeviceOpen(false)}
          t={t}
        />
      )}
    </div>
  );
}
