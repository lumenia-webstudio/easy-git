import { useState } from 'react';
import { Search, Copy, Check, ChevronDown, ChevronRight, Terminal } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { useApp } from '../../context/AppContext';

interface Command {
  cmd: string;
  desc: string;
  descFr: string;
  example?: string;
}

interface Section {
  id: string;
  title: string;
  titleFr: string;
  icon: string;
  color: string;
  commands: Command[];
}

const sections: Section[] = [
  {
    id: 'setup',
    title: 'Setup & Config',
    titleFr: 'Configuration',
    icon: '⚙',
    color: '#64748b',
    commands: [
      { cmd: 'git config --global user.name "Name"', desc: 'Set your global username', descFr: 'Définir votre nom d\'utilisateur global', example: 'git config --global user.name "Alice Dupont"' },
      { cmd: 'git config --global user.email "email"', desc: 'Set your global email', descFr: 'Définir votre adresse e-mail globale', example: 'git config --global user.email "alice@example.com"' },
      { cmd: 'git config --list', desc: 'Show all configuration settings', descFr: 'Afficher tous les paramètres de configuration' },
      { cmd: 'git config --global core.editor "code"', desc: 'Set VS Code as default editor', descFr: 'Choisir VS Code comme éditeur par défaut' },
      { cmd: 'git config --global init.defaultBranch main', desc: 'Set default branch name to main', descFr: 'Nommer « main » la branche par défaut' },
    ],
  },
  {
    id: 'init',
    title: 'Init & Clone',
    titleFr: 'Initialiser & Cloner',
    icon: '🗂',
    color: '#0ea5e9',
    commands: [
      { cmd: 'git init', desc: 'Initialize a new local repository in the current directory', descFr: 'Créer un dépôt local dans le dossier courant' },
      { cmd: 'git init <directory>', desc: 'Create a new repository in a specific directory', descFr: 'Créer un dépôt dans un dossier précis', example: 'git init my-project' },
      { cmd: 'git clone <url>', desc: 'Clone a remote repository locally', descFr: 'Copier un dépôt distant sur votre ordinateur', example: 'git clone https://github.com/user/repo.git' },
      { cmd: 'git clone <url> <folder>', desc: 'Clone into a specific folder name', descFr: 'Cloner dans un dossier au nom choisi', example: 'git clone https://github.com/user/repo.git my-folder' },
      { cmd: 'git clone --depth 1 <url>', desc: 'Shallow clone — only the latest snapshot (faster)', descFr: 'Clone léger : seulement la dernière version (plus rapide)' },
    ],
  },
  {
    id: 'staging',
    title: 'Stage & Snapshot',
    titleFr: 'Staging & Snapshot',
    icon: '📸',
    color: '#f0b429',
    commands: [
      { cmd: 'git status', desc: 'Show the state of the working directory and staging area', descFr: 'Afficher l\'état des fichiers : modifiés, préparés, non suivis' },
      { cmd: 'git add <file>', desc: 'Stage a specific file for the next commit', descFr: 'Préparer un fichier pour le prochain commit', example: 'git add index.html' },
      { cmd: 'git add .', desc: 'Stage all changes in the current directory', descFr: 'Préparer toutes les modifications du dossier courant' },
      { cmd: 'git add -p', desc: 'Interactively choose which changes to stage (by hunk)', descFr: 'Choisir morceau par morceau les modifications à préparer' },
      { cmd: 'git diff', desc: 'Show unstaged changes', descFr: 'Afficher les modifications non préparées' },
      { cmd: 'git diff --staged', desc: 'Show staged changes (ready to commit)', descFr: 'Afficher les modifications préparées (prêtes à committer)' },
      { cmd: 'git reset HEAD <file>', desc: 'Unstage a file without losing its changes', descFr: 'Retirer un fichier de la préparation sans perdre ses modifications', example: 'git reset HEAD README.md' },
      { cmd: 'git restore <file>', desc: 'Discard unstaged changes in a file', descFr: 'Annuler les modifications non préparées d\'un fichier', example: 'git restore src/app.js' },
      { cmd: 'git clean -fd', desc: 'Remove untracked files and directories', descFr: 'Supprimer les fichiers et dossiers non suivis' },
    ],
  },
  {
    id: 'commit',
    title: 'Commit',
    titleFr: 'Commit',
    icon: '💾',
    color: '#34d399',
    commands: [
      { cmd: 'git commit -m "message"', desc: 'Commit staged changes with a message', descFr: 'Enregistrer les modifications préparées avec un message', example: 'git commit -m "feat: add login page"' },
      { cmd: 'git commit -am "message"', desc: 'Stage tracked files and commit in one step', descFr: 'Préparer les fichiers suivis et committer en une étape' },
      { cmd: 'git commit --amend', desc: 'Modify the last commit (message or content)', descFr: 'Modifier le dernier commit (message ou contenu)' },
      { cmd: 'git commit --amend --no-edit', desc: 'Add staged changes to the last commit without changing the message', descFr: 'Ajouter les modifications préparées au dernier commit sans changer son message' },
      { cmd: 'git log', desc: 'Show the commit history', descFr: 'Afficher l\'historique des commits' },
      { cmd: 'git log --oneline --graph', desc: 'Show compact commit history as a graph', descFr: 'Afficher l\'historique compact sous forme de graphe' },
      { cmd: 'git log --author="name"', desc: 'Filter commits by author', descFr: 'Filtrer les commits par auteur', example: 'git log --author="Alice"' },
      { cmd: 'git show <sha>', desc: 'Show details of a specific commit', descFr: 'Afficher le détail d\'un commit', example: 'git show a1b2c3d' },
    ],
  },
  {
    id: 'branch',
    title: 'Branch & Merge',
    titleFr: 'Branches & Fusion',
    icon: '🌿',
    color: '#a78bfa',
    commands: [
      { cmd: 'git branch', desc: 'List all local branches', descFr: 'Lister les branches locales' },
      { cmd: 'git branch -a', desc: 'List all branches (local + remote)', descFr: 'Lister toutes les branches (locales et distantes)' },
      { cmd: 'git branch <name>', desc: 'Create a new branch', descFr: 'Créer une branche', example: 'git branch feature/login' },
      { cmd: 'git checkout <branch>', desc: 'Switch to an existing branch', descFr: 'Passer sur une branche existante', example: 'git checkout main' },
      { cmd: 'git checkout -b <branch>', desc: 'Create and switch to a new branch', descFr: 'Créer une branche et passer dessus', example: 'git checkout -b feature/signup' },
      { cmd: 'git switch <branch>', desc: 'Modern way to switch branches', descFr: 'Changer de branche (commande moderne)' },
      { cmd: 'git switch -c <branch>', desc: 'Modern way to create and switch', descFr: 'Créer une branche et passer dessus (commande moderne)' },
      { cmd: 'git merge <branch>', desc: 'Merge a branch into the current one', descFr: 'Fusionner une branche dans la branche courante', example: 'git merge feature/login' },
      { cmd: 'git merge --no-ff <branch>', desc: 'Merge with a merge commit (preserves history)', descFr: 'Fusionner avec un commit de fusion (garde l\'historique)' },
      { cmd: 'git branch -d <branch>', desc: 'Delete a merged branch', descFr: 'Supprimer une branche déjà fusionnée', example: 'git branch -d feature/login' },
      { cmd: 'git branch -D <branch>', desc: 'Force-delete a branch (even unmerged)', descFr: 'Forcer la suppression d\'une branche (même non fusionnée)' },
    ],
  },
  {
    id: 'remote',
    title: 'Remote',
    titleFr: 'Dépôt distant',
    icon: '🌐',
    color: '#f97316',
    commands: [
      { cmd: 'git remote -v', desc: 'List remote connections with URLs', descFr: 'Lister les dépôts distants et leurs adresses' },
      { cmd: 'git remote add origin <url>', desc: 'Add a remote named "origin"', descFr: 'Ajouter un dépôt distant nommé « origin »', example: 'git remote add origin https://github.com/user/repo.git' },
      { cmd: 'git remote remove <name>', desc: 'Remove a remote connection', descFr: 'Retirer un dépôt distant', example: 'git remote remove origin' },
      { cmd: 'git fetch', desc: 'Download changes from remote without merging', descFr: 'Télécharger les nouveautés du dépôt distant sans fusionner' },
      { cmd: 'git fetch --prune', desc: 'Fetch and remove stale remote-tracking branches', descFr: 'Télécharger et nettoyer les branches distantes disparues' },
      { cmd: 'git pull', desc: 'Fetch and merge remote changes into current branch', descFr: 'Récupérer et fusionner les nouveautés dans la branche courante' },
      { cmd: 'git pull --rebase', desc: 'Fetch and rebase instead of merge', descFr: 'Récupérer en rebasant au lieu de fusionner' },
      { cmd: 'git push origin <branch>', desc: 'Push branch to remote', descFr: 'Envoyer la branche sur le dépôt distant', example: 'git push origin main' },
      { cmd: 'git push -u origin <branch>', desc: 'Push and set upstream tracking', descFr: 'Envoyer la branche et la relier à sa branche distante', example: 'git push -u origin feature/login' },
      { cmd: 'git push --force-with-lease', desc: 'Force push safely (fails if remote was updated by someone else)', descFr: 'Forcer l\'envoi sans risque (échoue si quelqu\'un a envoyé entre-temps)' },
      { cmd: 'git push origin --delete <branch>', desc: 'Delete a remote branch', descFr: 'Supprimer une branche distante', example: 'git push origin --delete old-feature' },
    ],
  },
  {
    id: 'rebase',
    title: 'Rebase & History',
    titleFr: 'Rebase & Historique',
    icon: '🔀',
    color: '#ec4899',
    commands: [
      { cmd: 'git rebase <branch>', desc: 'Rebase current branch onto another', descFr: 'Rebaser la branche courante sur une autre', example: 'git rebase main' },
      { cmd: 'git rebase -i HEAD~<n>', desc: 'Interactive rebase: rewrite last N commits', descFr: 'Rebase interactif : réécrire les N derniers commits', example: 'git rebase -i HEAD~3' },
      { cmd: 'git rebase --continue', desc: 'Continue a rebase after resolving conflicts', descFr: 'Reprendre un rebase après résolution des conflits' },
      { cmd: 'git rebase --abort', desc: 'Abort and return to original state', descFr: 'Abandonner et revenir à l\'état de départ' },
      { cmd: 'git cherry-pick <sha>', desc: 'Apply a specific commit from another branch', descFr: 'Appliquer un commit précis venant d\'une autre branche', example: 'git cherry-pick a1b2c3d' },
      { cmd: 'git revert <sha>', desc: 'Create a new commit that undoes a previous one', descFr: 'Créer un commit qui annule un commit précédent', example: 'git revert HEAD' },
      { cmd: 'git reset --soft HEAD~1', desc: 'Undo last commit, keep changes staged', descFr: 'Annuler le dernier commit, modifications gardées et préparées' },
      { cmd: 'git reset --mixed HEAD~1', desc: 'Undo last commit, keep changes unstaged', descFr: 'Annuler le dernier commit, modifications gardées mais non préparées' },
      { cmd: 'git reset --hard HEAD~1', desc: 'Undo last commit, discard all changes', descFr: 'Annuler le dernier commit et effacer ses modifications' },
      { cmd: 'git reflog', desc: 'Show history of HEAD positions — useful to recover lost commits', descFr: 'Afficher les positions successives de HEAD : utile pour retrouver un commit perdu' },
    ],
  },
  {
    id: 'stash',
    title: 'Stash',
    titleFr: 'Remisage (Stash)',
    icon: '📦',
    color: '#14b8a6',
    commands: [
      { cmd: 'git stash', desc: 'Temporarily save uncommitted changes', descFr: 'Mettre de côté les modifications non committées' },
      { cmd: 'git stash push -m "label"', desc: 'Stash with a descriptive label', descFr: 'Mettre de côté avec un nom explicite', example: 'git stash push -m "WIP: new form"' },
      { cmd: 'git stash list', desc: 'List all stashed changes', descFr: 'Lister les modifications mises de côté' },
      { cmd: 'git stash pop', desc: 'Apply most recent stash and remove it from the list', descFr: 'Réappliquer la dernière mise de côté et la retirer de la liste' },
      { cmd: 'git stash apply stash@{n}', desc: 'Apply a specific stash without removing it', descFr: 'Réappliquer une mise de côté précise sans la retirer', example: 'git stash apply stash@{2}' },
      { cmd: 'git stash drop stash@{n}', desc: 'Delete a specific stash', descFr: 'Supprimer une mise de côté précise' },
      { cmd: 'git stash clear', desc: 'Remove all stashed entries', descFr: 'Supprimer toutes les mises de côté' },
    ],
  },
  {
    id: 'tag',
    title: 'Tags',
    titleFr: 'Tags & Versions',
    icon: '🏷',
    color: '#f0b429',
    commands: [
      { cmd: 'git tag', desc: 'List all tags', descFr: 'Lister les tags' },
      { cmd: 'git tag <name>', desc: 'Create a lightweight tag on current commit', descFr: 'Créer un tag simple sur le commit courant', example: 'git tag v1.0.0' },
      { cmd: 'git tag -a <name> -m "msg"', desc: 'Create an annotated tag with a message', descFr: 'Créer un tag annoté avec un message', example: 'git tag -a v1.0.0 -m "First stable release"' },
      { cmd: 'git push origin <tag>', desc: 'Push a specific tag to remote', descFr: 'Envoyer un tag précis sur le dépôt distant', example: 'git push origin v1.0.0' },
      { cmd: 'git push origin --tags', desc: 'Push all tags to remote', descFr: 'Envoyer tous les tags sur le dépôt distant' },
      { cmd: 'git tag -d <name>', desc: 'Delete a local tag', descFr: 'Supprimer un tag local', example: 'git tag -d v1.0.0' },
      { cmd: 'git push origin --delete <tag>', desc: 'Delete a remote tag', descFr: 'Supprimer un tag distant', example: 'git push origin --delete v1.0.0' },
    ],
  },
  {
    id: 'search',
    title: 'Search & Debug',
    titleFr: 'Recherche & Debug',
    icon: '🔍',
    color: '#6366f1',
    commands: [
      { cmd: 'git grep "pattern"', desc: 'Search for a pattern in tracked files', descFr: 'Rechercher un texte dans les fichiers suivis', example: 'git grep "TODO"' },
      { cmd: 'git log -S "text"', desc: 'Find commits that added or removed a specific string', descFr: 'Trouver les commits qui ont ajouté ou retiré un texte précis', example: 'git log -S "apiKey"' },
      { cmd: 'git blame <file>', desc: 'Show who changed each line of a file', descFr: 'Voir qui a modifié chaque ligne d\'un fichier', example: 'git blame src/app.js' },
      { cmd: 'git bisect start', desc: 'Start a binary search to find which commit introduced a bug', descFr: 'Lancer une recherche par dichotomie pour trouver le commit qui a introduit un bug' },
      { cmd: 'git bisect good <sha>', desc: 'Mark a commit as good (no bug)', descFr: 'Marquer un commit comme bon (sans bug)' },
      { cmd: 'git bisect bad <sha>', desc: 'Mark a commit as bad (has bug)', descFr: 'Marquer un commit comme mauvais (avec bug)' },
      { cmd: 'git bisect reset', desc: 'End bisect session and return to HEAD', descFr: 'Terminer la recherche et revenir à HEAD' },
      { cmd: 'git shortlog -sn', desc: 'Show commit count per author', descFr: 'Afficher le nombre de commits par auteur' },
    ],
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-all p-1 rounded"
      style={{ color: copied ? 'var(--gold)' : 'var(--text-muted)' }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

function CommandRow({ cmd }: { cmd: Command }) {
  const { language } = useApp();
  const [exOpen, setExOpen] = useState(false);

  return (
    <div
      className="group px-4 py-3 transition-colors"
      style={{ borderBottom: '1px solid var(--border-section)' }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '')}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <code
              className="text-xs font-mono px-2 py-0.5 rounded select-all"
              style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', letterSpacing: '0.01em' }}
            >
              {cmd.cmd}
            </code>
            <CopyButton text={cmd.cmd} />
          </div>
          <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{language === 'fr' ? cmd.descFr : cmd.desc}</p>
          {cmd.example && (
            <button
              onClick={() => setExOpen(!exOpen)}
              className="flex items-center gap-1 mt-1 text-[10px] transition-colors"
              style={{ color: 'var(--gold-faint)' }}
            >
              {exOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
              Exemple
            </button>
          )}
          {exOpen && cmd.example && (
            <div
              className="mt-1.5 flex items-center gap-2 px-2.5 py-1.5 rounded-lg animate-in fade-in duration-150"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}
            >
              <code className="text-xs font-mono flex-1" style={{ color: 'var(--gold)' }}>{cmd.example}</code>
              <CopyButton text={cmd.example} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function GitReferencePage() {
  const { language } = useApp();
  const [search, setSearch] = useState('');
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['init', 'staging', 'commit']));

  const q = search.toLowerCase().trim();

  const filtered = sections.map(s => ({
    ...s,
    commands: q
      ? s.commands.filter(c =>
          c.cmd.toLowerCase().includes(q) ||
          c.desc.toLowerCase().includes(q) ||
          c.descFr.toLowerCase().includes(q) ||
          (c.example?.toLowerCase().includes(q))
        )
      : s.commands,
  })).filter(s => s.commands.length > 0);

  const toggle = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setOpenSections(new Set(sections.map(s => s.id)));
  const collapseAll = () => setOpenSections(new Set());

  const totalCommands = sections.reduce((acc, s) => acc + s.commands.length, 0);

  return (
    <div className="flex flex-col">
      <Header
        title={language === 'fr' ? 'Référence Git' : 'Git Reference'}
        subtitle={language === 'fr' ? `${totalCommands} commandes essentielles` : `${totalCommands} essential commands`}
      />

      <div className="p-6 space-y-4 max-w-3xl">
        <div
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', backdropFilter: 'blur(16px)' }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border)' }}
          >
            <Terminal size={18} style={{ color: 'var(--gold)' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {language === 'fr' ? 'Guide de référence Git' : 'Git Command Reference'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {language === 'fr'
                ? 'Toutes les commandes essentielles avec exemples. Cliquez sur une commande pour la copier.'
                : 'All essential commands with examples. Click any command to copy it.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-input)', backdropFilter: 'blur(12px)' }}
          >
            <Search size={14} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={language === 'fr' ? 'Rechercher une commande...' : 'Search commands...'}
              className="flex-1 text-sm bg-transparent focus:outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ color: 'var(--text-muted)' }} className="hover:text-red-400 transition-colors">
                ×
              </button>
            )}
          </div>
          {!q && (
            <div className="flex gap-1.5">
              <button
                onClick={expandAll}
                className="px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                style={{ color: 'var(--gold-dim)', border: '1px solid var(--gold-border)', background: 'var(--gold-bg)' }}
              >
                {language === 'fr' ? 'Tout ouvrir' : 'Expand all'}
              </button>
              <button
                onClick={collapseAll}
                className="px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}
              >
                {language === 'fr' ? 'Tout fermer' : 'Collapse all'}
              </button>
            </div>
          )}
        </div>

        {q && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {filtered.reduce((acc, s) => acc + s.commands.length, 0)}{' '}
            {language === 'fr' ? 'résultat(s) pour' : 'result(s) for'}{' '}
            <span style={{ color: 'var(--gold)' }}>"{search}"</span>
          </p>
        )}

        <div className="space-y-2">
          {filtered.map(section => {
            const isOpen = q ? true : openSections.has(section.id);
            const title = language === 'fr' ? section.titleFr : section.title;

            return (
              <div
                key={section.id}
                className="rounded-xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', backdropFilter: 'blur(16px)' }}
              >
                <button
                  className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left"
                  style={{ borderBottom: isOpen ? '1px solid var(--border-section)' : undefined }}
                  onClick={() => !q && toggle(section.id)}
                  onMouseEnter={e => !q && ((e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '')}
                >
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0"
                    style={{ background: `${section.color}15`, border: `1px solid ${section.color}30` }}
                  >
                    {section.icon}
                  </span>
                  <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                    {section.commands.length}
                  </span>
                  {!q && (
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${isOpen ? '' : '-rotate-90'}`}
                      style={{ color: 'var(--text-muted)' }}
                    />
                  )}
                </button>

                {isOpen && (
                  <div>
                    {section.commands.map((cmd, i) => (
                      <CommandRow key={i} cmd={cmd} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
              <Terminal size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{language === 'fr' ? 'Aucune commande trouvée' : 'No commands found'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
