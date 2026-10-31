import { useEffect, useRef, useState } from 'react';
import { Github, Copy, Check, Loader2, X } from 'lucide-react';
import { requestDeviceCode, pollAccessToken } from '../../services/github/deviceFlow';
import type { DeviceCodeResponse } from '../../services/github/deviceFlow';

interface DeviceFlowModalProps {
  onSuccess: (token: string) => void;
  onClose: () => void;
  t: (key: string, vars?: Record<string, string>) => string;
}

type Status = 'loading' | 'waiting' | 'success' | 'expired' | 'denied' | 'error';

export function DeviceFlowModal({ onSuccess, onClose, t }: DeviceFlowModalProps) {
  const [status, setStatus] = useState<Status>('loading');
  const [deviceData, setDeviceData] = useState<DeviceCodeResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;

    const start = async () => {
      try {
        const data = await requestDeviceCode();
        if (!activeRef.current) return;
        setDeviceData(data);
        setStatus('waiting');
        window.open(data.verification_uri, '_blank', 'noopener,noreferrer');
        schedulePoll(data.device_code, Math.max(data.interval, 5) * 1000);
      } catch {
        if (activeRef.current) setStatus('error');
      }
    };

    start();

    return () => {
      activeRef.current = false;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
    // schedulePoll only captures refs (always current) — safe to omit from deps
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const schedulePoll = (deviceCode: string, intervalMs: number, networkErrors = 0) => {
    pollRef.current = setTimeout(async () => {
      if (!activeRef.current) return;

      const result = await pollAccessToken(deviceCode);

      if (!activeRef.current) return;

      if (typeof result === 'object' && result.access_token) {
        setStatus('success');
        // Délai pour que l'état success soit visible avant fermeture du modal
        setTimeout(() => onSuccess(result.access_token), 800);
        return;
      }

      switch (result) {
        case 'authorization_pending':
          schedulePoll(deviceCode, intervalMs);
          break;
        case 'slow_down':
          schedulePoll(deviceCode, intervalMs + 5000, networkErrors);
          break;
        case 'expired_token':
          setStatus('expired');
          break;
        case 'access_denied':
          setStatus('denied');
          break;
        default:
          if (networkErrors >= 3) {
            setStatus('error');
          } else {
            schedulePoll(deviceCode, intervalMs, networkErrors + 1);
          }
      }
    }, intervalMs);
  };

  const handleCopy = async () => {
    if (!deviceData) return;
    try {
      await navigator.clipboard.writeText(deviceData.user_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard non disponible — silencieux, l'utilisateur peut copier manuellement
    }
  };

  const handleOpenBrowser = () => {
    if (!deviceData) return;
    window.open(deviceData.verification_uri, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 relative"
        style={{
          background: 'rgba(8,13,26,0.95)',
          border: '1px solid rgba(240,180,41,0.2)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-600 hover:text-slate-300 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex justify-center mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.2)' }}
          >
            <Github size={28} style={{ color: '#f0b429' }} />
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-100 text-center mb-2">
          {t('auth.deviceTitle')}
        </h2>

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-3 mt-6">
            <Loader2 size={24} className="animate-spin" style={{ color: '#f0b429' }} />
            <p className="text-sm text-slate-400">{t('common.loading')}</p>
          </div>
        )}

        {status === 'waiting' && deviceData && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-slate-400 text-center">
              {t('auth.deviceInstruction')}
            </p>

            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: 'rgba(240,180,41,0.08)', border: '1px solid rgba(240,180,41,0.25)' }}
            >
              <span
                className="font-mono text-2xl font-bold tracking-widest"
                style={{ color: '#f0b429' }}
              >
                {deviceData.user_code}
              </span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: copied ? '#4ade80' : '#64748b' }}
                title={t('common.copy')}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            <button
              onClick={handleOpenBrowser}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, #f9cf47 0%, #f0b429 60%, #d4941a 100%)',
                color: '#0c1525',
              }}
            >
              <Github size={15} />
              {t('auth.deviceOpenBrowser')}
            </button>

            <div className="flex items-center justify-center gap-2 pt-1">
              <Loader2 size={13} className="animate-spin text-slate-600" />
              <p className="text-xs text-slate-600">{t('auth.deviceWaiting')}</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-3 mt-6">
            <Check size={24} style={{ color: '#4ade80' }} />
            <p className="text-sm text-slate-400">{t('auth.deviceSuccess')}</p>
          </div>
        )}

        {(status === 'expired' || status === 'denied' || status === 'error') && (
          <div className="mt-4 text-center space-y-4">
            <p className="text-sm text-red-400">
              {status === 'expired' ? t('auth.deviceExpired')
                : status === 'denied' ? t('auth.deviceDenied')
                : t('auth.deviceError')}
            </p>
            <button
              onClick={onClose}
              className="text-sm font-medium transition-colors"
              style={{ color: 'rgba(240,180,41,0.7)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f0b429')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,180,41,0.7)')}
            >
              {t('auth.deviceCancel')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
