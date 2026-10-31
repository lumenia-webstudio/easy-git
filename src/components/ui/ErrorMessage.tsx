import { AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { GitHubAPIError } from '../../services/github/client';
import { useApp } from '../../context/AppContext';

interface ErrorMessageProps {
  error: unknown;
  onRetry?: () => void;
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  const { t } = useApp();

  let message = t('errors.unknown');

  if (error instanceof GitHubAPIError) {
    if (error.status === 401) message = t('errors.unauthorized');
    else if (error.status === 403) message = t('errors.forbidden');
    else if (error.status === 404) message = t('errors.notFound');
    else if (error.status === 429) message = t('errors.rateLimit');
    else if (error.status >= 500) message = t('errors.serverError');
    else message = error.message;
  } else if (error instanceof TypeError && error.message.includes('fetch')) {
    message = t('errors.network');
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <AlertCircle size={22} className="text-red-400" />
      </div>
      <p className="text-sm text-slate-400 max-w-xs">{message}</p>
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
