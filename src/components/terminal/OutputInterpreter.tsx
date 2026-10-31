import { CheckCircle, AlertCircle, Info, AlertTriangle, ExternalLink } from 'lucide-react';

interface Interpretation {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  detail?: string;
  action?: 'settings';
}

export function interpretOutput(output: string): Interpretation | null {
  const o = output.toLowerCase();

  // Push réussi : ligne "To <url>" (« Vers » en français) puis "main -> main".
  // Sans la ligne To/Vers, "(HEAD -> main)" d'un git log déclencherait ce message à tort.
  const pushTarget = /^\s*(to|vers) (https?:\/\/|ssh:\/\/|git@)/m.test(o);
  if (pushTarget && o.includes('->') && (o.includes(' main') || o.includes(' master')) && !o.includes('error') && !o.includes('rejected')) {
    return { type: 'success', message: 'Vos fichiers ont bien été envoyés sur GitHub !' };
  }
  // Already up to date
  if (o.includes('already up to date') || o.includes('déjà à jour')) {
    return { type: 'info', message: 'Tout est déjà à jour — rien à faire.' };
  }
  // Erreur d'auth
  if (o.includes('authentication failed') || o.includes('403') || o.includes('permission denied (publickey') || o.includes('could not read username')) {
    return { type: 'error', message: 'GitHub n\'a pas reconnu vos identifiants.', detail: 'Vérifiez votre token d\'accès dans les Paramètres de l\'app.', action: 'settings' };
  }
  // Branche divergée
  if (o.includes('have diverged') || o.includes('diverged')) {
    return { type: 'warning', message: 'Votre branche locale et GitHub ont divergé.', detail: 'Faites d\'abord un git pull pour récupérer les changements distants, puis résolvez les conflits éventuels.' };
  }
  // Push rejeté
  if (o.includes('rejected') && o.includes('push')) {
    return { type: 'warning', message: 'GitHub a refusé votre Push.', detail: 'Quelqu\'un d\'autre a pushé entre-temps. Faites d\'abord git pull, puis git push.' };
  }
  // Conflits de merge
  if (o.includes('conflict') || o.includes('automatic merge failed')) {
    return { type: 'error', message: 'Des conflits ont été détectés.', detail: 'Ouvrez les fichiers marqués avec <<<<<<<, choisissez quelle version garder, puis faites git add . et git commit.' };
  }
  // Nothing to commit
  if (o.includes('nothing to commit') || o.includes('nothing added to commit')) {
    return { type: 'info', message: 'Rien à committer : tous vos fichiers sont déjà sauvegardés.' };
  }
  // Commit créé (ex: [main abc1234])
  if (/\[[^\]]+\s+[a-f0-9]{7,}\]/.test(o)) {
    return { type: 'success', message: 'Commit créé avec succès ! Pensez à faire un Push pour l\'envoyer sur GitHub.' };
  }
  // Init réussi
  if (o.includes('initialized empty git repository') || o.includes('initialized git repository')) {
    return { type: 'success', message: 'Dépôt Git initialisé ! Vous pouvez maintenant faire git add . et git commit.' };
  }
  // Clone réussi
  if (o.includes('receiving objects') && o.includes('100%')) {
    return { type: 'success', message: 'Dépôt cloné avec succès sur votre ordinateur !' };
  }
  // Repo introuvable
  if (o.includes('repository not found') || o.includes('does not exist') || o.includes('not found')) {
    return { type: 'error', message: 'Dépôt introuvable.', detail: 'Vérifiez l\'URL du dépôt et que vous y avez bien accès.' };
  }
  // Pas de remote
  if (o.includes('no configured push destination') || (o.includes('no remote') && o.includes('origin'))) {
    return { type: 'warning', message: 'Aucun dépôt distant configuré.', detail: 'Utilisez git remote add origin <url> pour connecter ce projet à GitHub.' };
  }
  return null;
}

interface OutputInterpreterProps {
  output: string;
  onNavigate?: (page: string) => void;
}

export function OutputInterpreter({ output, onNavigate }: OutputInterpreterProps) {
  const interpretation = interpretOutput(output);
  if (!interpretation) return null;

  const icons = {
    success: <CheckCircle size={14} style={{ color: '#4ade80' }} />,
    error: <AlertCircle size={14} style={{ color: '#f87171' }} />,
    warning: <AlertTriangle size={14} style={{ color: '#fbbf24' }} />,
    info: <Info size={14} style={{ color: '#60a5fa' }} />,
  };

  const colors = {
    success: { bg: '#052e16', border: '#166534', text: '#4ade80' },
    error:   { bg: '#2d0a0a', border: '#991b1b', text: '#f87171' },
    warning: { bg: '#2d1a00', border: '#92400e', text: '#fbbf24' },
    info:    { bg: '#0c1a2e', border: '#1e3a5f', text: '#60a5fa' },
  };

  const c = colors[interpretation.type];

  return (
    <div
      className="mx-4 mb-3 px-3 py-2.5 rounded-lg flex items-start gap-2.5"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <span className="shrink-0 mt-0.5">{icons[interpretation.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold" style={{ color: c.text }}>{interpretation.message}</p>
        {interpretation.detail && (
          <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{interpretation.detail}</p>
        )}
        {interpretation.action === 'settings' && onNavigate && (
          <button
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-1 mt-1.5 text-xs hover:underline"
            style={{ color: c.text }}
            type="button"
          >
            <ExternalLink size={11} />
            Aller aux Paramètres
          </button>
        )}
      </div>
    </div>
  );
}
