export type HelpBlockType =
  | { type: 'text'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'tip'; text: string }
  | { type: 'warning'; text: string }
  | { type: 'code'; lang: string; code: string }
  | { type: 'steps'; steps: Array<{ label: string; desc: string }> }
  | { type: 'glossary'; items: Array<{ term: string; def: string }> };

export interface HelpSection {
  id: string;
  title: string;
  emoji: string;
  level: 'beginner' | 'intermediate';
  keywords: string[];
  content: HelpBlockType[];
}

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'concepts-git',
    title: "C'est quoi Git ?",
    emoji: '🧠',
    level: 'beginner',
    keywords: ['git', 'version', 'historique', 'sauvegarde', 'versionning', 'intro'],
    content: [
      { type: 'text', text: "Git est un outil qui sauvegarde l'historique complet de votre code. Imaginez un super \"Ctrl+Z\" infini, avec la possibilité de revenir à n'importe quel état de votre projet, même des semaines plus tard." },
      { type: 'tip', text: "Git fonctionne en local sur votre ordinateur. GitHub est un service en ligne qui stocke une copie de votre dépôt sur Internet pour le partager ou le sauvegarder." },
      { type: 'heading', text: 'Les 3 zones de Git' },
      { type: 'steps', steps: [
        { label: '📁 Working Directory', desc: "Vos fichiers tels que vous les voyez dans votre éditeur. C'est là que vous codez." },
        { label: '📋 Staging Area (Index)', desc: "Une \"salle d'attente\" où vous préparez les fichiers que vous voulez sauvegarder. git add . envoie les fichiers ici." },
        { label: "💾 Repository (Commits)", desc: "L'historique permanent. git commit prend tout ce qui est en staging et crée un point de sauvegarde définitif." },
      ]},
    ],
  },
  {
    id: 'concepts-repo',
    title: "Qu'est-ce qu'un repo ?",
    emoji: '📁',
    level: 'beginner',
    keywords: ['repo', 'dépôt', 'repository', 'projet', 'dossier', 'git'],
    content: [
      { type: 'text', text: "Un \"repo\" (dépôt) est simplement un dossier de projet suivi par Git. Il contient tout votre code + un dossier caché \".git\" où Git stocke l'historique." },
      { type: 'tip', text: "Vous créez un dépôt avec git init (nouveau projet) ou git clone <url> (projet existant sur GitHub)." },
    ],
  },
  {
    id: 'concepts-commit',
    title: "Qu'est-ce qu'un commit ?",
    emoji: '💾',
    level: 'beginner',
    keywords: ['commit', 'sauvegarde', 'snapshot', 'point de restauration', 'message'],
    content: [
      { type: 'text', text: "Un commit est une photo instantanée de votre projet à un moment donné. Chaque commit a un identifiant unique, un auteur, une date, et un message qui décrit ce qui a changé." },
      { type: 'tip', text: "Bonne pratique : faites des petits commits fréquents plutôt qu'un gros commit à la fin de la journée. C'est plus facile à comprendre et à annuler si besoin." },
      { type: 'code', lang: 'bash', code: '# Exemples de bons messages de commit\ngit commit -m "feat: ajouter la page de contact"\ngit commit -m "fix: corriger le bug d\'affichage sur mobile"\ngit commit -m "docs: mettre à jour le README"' },
    ],
  },
  {
    id: 'concepts-branch',
    title: "Qu'est-ce qu'une branche ?",
    emoji: '🌿',
    level: 'beginner',
    keywords: ['branche', 'branch', 'main', 'master', 'feature', 'parallèle', 'isolation'],
    content: [
      { type: 'text', text: "Une branche est une ligne de développement indépendante. Par défaut, vous travaillez sur la branche \"main\". Créer une nouvelle branche vous permet de travailler sur une fonctionnalité sans toucher au code principal." },
      { type: 'steps', steps: [
        { label: '1. Créer une branche', desc: "git checkout -b feature/ma-fonction : vous travaillez maintenant dans un espace isolé." },
        { label: '2. Travailler', desc: "Codez et faites vos commits normalement." },
        { label: '3. Fusionner', desc: "git checkout main puis git merge feature/ma-fonction : vos changements rejoignent la branche principale." },
      ]},
    ],
  },
  {
    id: 'concepts-remote',
    title: "C'est quoi un \"remote\" ?",
    emoji: '☁️',
    level: 'beginner',
    keywords: ['remote', 'origin', 'github', 'distant', 'cloud', 'serveur', 'push', 'pull'],
    content: [
      { type: 'text', text: "Un \"remote\" est une copie de votre dépôt stockée ailleurs (généralement sur GitHub). Par convention, il s'appelle \"origin\"." },
      { type: 'tip', text: "Push = envoyer vos commits locaux vers GitHub. Pull = récupérer les commits de GitHub vers votre ordinateur." },
    ],
  },
  {
    id: 'cmd-init',
    title: 'git init',
    emoji: '🚀',
    level: 'beginner',
    keywords: ['init', 'initialiser', 'créer', 'nouveau', 'démarrer', 'commencer', 'projet'],
    content: [
      { type: 'text', text: "Initialise un nouveau dépôt Git dans le dossier courant. À utiliser une seule fois au début d'un nouveau projet." },
      { type: 'code', lang: 'bash', code: 'cd mon-projet\ngit init\n# Résultat :\n# Initialized empty Git repository in .git/' },
      { type: 'tip', text: "Pour connecter ce projet à GitHub, allez sur github.com, créez un nouveau dépôt vide, puis utilisez git remote add origin <url>." },
      { type: 'warning', text: "N'exécutez pas git init dans un dossier qui contient déjà un .git : vous risqueriez d'écraser l'historique existant." },
    ],
  },
  {
    id: 'cmd-clone',
    title: 'git clone',
    emoji: '📥',
    level: 'beginner',
    keywords: ['clone', 'cloner', 'télécharger', 'copier', 'récupérer', 'url', 'github'],
    content: [
      { type: 'text', text: "Télécharge une copie complète d'un repo existant (avec tout son historique) depuis GitHub." },
      { type: 'code', lang: 'bash', code: 'git clone https://github.com/utilisateur/mon-projet.git\n# Crée un dossier "mon-projet" avec tout le code dedans' },
      { type: 'steps', steps: [
        { label: "Trouver l'URL", desc: 'Sur GitHub, cliquez sur le bouton vert "Code", puis copiez l\'URL HTTPS.' },
        { label: "Choisir l'emplacement", desc: 'Dans le terminal, allez dans le dossier où vous voulez mettre le projet (cd ~/projets).' },
        { label: 'Cloner', desc: 'git clone <url>' },
      ]},
    ],
  },
  {
    id: 'cmd-status',
    title: 'git status',
    emoji: '📊',
    level: 'beginner',
    keywords: ['status', 'état', 'voir', 'modifications', 'changements', 'fichiers'],
    content: [
      { type: 'text', text: "Affiche l'état de votre dépôt : quels fichiers ont été modifiés, quels sont en staging, s'il y a des fichiers non suivis." },
      { type: 'tip', text: "C'est la commande à utiliser le plus souvent ! Exécutez-la avant et après chaque opération." },
      { type: 'code', lang: 'bash', code: 'git status\n\n# Exemple de sortie :\n# On branch main\n# Changes to be committed:       ← en staging (prêts)\n#   modified: src/App.tsx\n# Changes not staged for commit:  ← modifiés mais pas stagés\n#   modified: README.md\n# Untracked files:                ← nouveaux fichiers\n#   src/NewComponent.tsx' },
    ],
  },
  {
    id: 'cmd-add',
    title: 'git add',
    emoji: '➕',
    level: 'beginner',
    keywords: ['add', 'ajouter', 'staging', 'préparer', 'indexer', 'sélectionner'],
    content: [
      { type: 'text', text: "Ajoute des fichiers à la \"staging area\" — la zone de préparation avant de committer." },
      { type: 'code', lang: 'bash', code: 'git add .           # Ajouter TOUS les fichiers modifiés\ngit add src/App.tsx  # Ajouter UN fichier spécifique\ngit add src/         # Ajouter tout un dossier' },
      { type: 'tip', text: "Le bouton \"Add All\" dans l'app exécute git add . qui sélectionne automatiquement tous les fichiers modifiés." },
    ],
  },
  {
    id: 'cmd-commit',
    title: 'git commit',
    emoji: '💾',
    level: 'beginner',
    keywords: ['commit', 'sauvegarder', 'message', 'valider', 'enregistrer', 'snapshot'],
    content: [
      { type: 'text', text: "Crée un point de sauvegarde avec tous les fichiers en staging. Le message décrit ce qui a changé." },
      { type: 'code', lang: 'bash', code: 'git commit -m "feat: ajouter la page de contact"\n\n# Convention recommandée :\n# feat:     nouvelle fonctionnalité\n# fix:      correction de bug\n# docs:     documentation\n# chore:    maintenance\n# refactor: restructuration' },
      { type: 'warning', text: "Il faut avoir fait git add avant ! Sinon Git vous répondra \"nothing to commit\"." },
    ],
  },
  {
    id: 'cmd-push',
    title: 'git push',
    emoji: '⬆️',
    level: 'beginner',
    keywords: ['push', 'envoyer', 'publier', 'upload', 'github', 'remote', 'origin'],
    content: [
      { type: 'text', text: "Envoie vos commits locaux vers GitHub. Après un push, vos collaborateurs peuvent voir vos changements." },
      { type: 'code', lang: 'bash', code: 'git push              # Envoyer la branche courante\ngit push origin main  # Explicitement vers origin, branche main\ngit push -u origin main  # Premier push (configure le tracking)' },
      { type: 'warning', text: "Si GitHub refuse avec \"rejected\", quelqu'un d'autre a pushé entre-temps. Faites d'abord git pull." },
    ],
  },
  {
    id: 'cmd-pull',
    title: 'git pull',
    emoji: '⬇️',
    level: 'beginner',
    keywords: ['pull', 'récupérer', 'télécharger', 'mettre à jour', 'synchroniser', 'fetch'],
    content: [
      { type: 'text', text: "Récupère les derniers commits depuis GitHub et les intègre dans votre branche locale. C'est fetch + merge en une seule commande." },
      { type: 'tip', text: "Bonne habitude : faites toujours un git pull au début de votre session de travail pour avoir le code le plus récent." },
      { type: 'code', lang: 'bash', code: 'git pull\n# ou explicitement :\ngit pull origin main' },
    ],
  },
  {
    id: 'cmd-checkout',
    title: 'git checkout -b',
    emoji: '🌿',
    level: 'intermediate',
    keywords: ['checkout', 'branche', 'créer', 'changer', 'switch', 'nouvelle branche', 'feature'],
    content: [
      { type: 'text', text: "Crée une nouvelle branche et bascule immédiatement dessus. Utile pour travailler sur une fonctionnalité sans affecter la branche principale." },
      { type: 'code', lang: 'bash', code: 'git checkout -b feature/page-contact\n# Crée et bascule sur "feature/page-contact"\n\ngit checkout main\n# Revenir sur main (sans -b, ne crée pas de branche)\n\ngit branch\n# Lister les branches (* = branche courante)' },
    ],
  },
  {
    id: 'cmd-merge',
    title: 'git merge',
    emoji: '🔀',
    level: 'intermediate',
    keywords: ['merge', 'fusionner', 'intégrer', 'combiner', 'branches', 'fusion'],
    content: [
      { type: 'text', text: "Fusionne les commits d'une branche dans la branche courante." },
      { type: 'steps', steps: [
        { label: 'Revenir sur main', desc: 'git checkout main' },
        { label: 'Fusionner la feature', desc: 'git merge feature/page-contact' },
        { label: 'Résoudre les conflits si besoin', desc: "Si Git signale des conflits, ouvrez les fichiers, résolvez les marqueurs <<<<<<<, puis git add . et git commit." },
      ]},
      { type: 'warning', text: "En cas de conflit, ne laissez jamais les marqueurs <<<<<<< dans votre code : l'application ne fonctionnera plus." },
    ],
  },
  {
    id: 'cmd-log',
    title: 'git log',
    emoji: '📜',
    level: 'beginner',
    keywords: ['log', 'historique', 'commits', 'histoire', 'qui', 'quand', 'graphe'],
    content: [
      { type: 'text', text: "Affiche l'historique des commits. Le bouton \"Log\" utilise --oneline --graph pour un affichage compact et visuel." },
      { type: 'code', lang: 'bash', code: 'git log --oneline --graph --all\n# Exemple :\n# * a3f2c1d (HEAD -> main) feat: ajouter contact\n# * 8b1e9f2 fix: corriger header mobile\n# * 3c7d4a1 feat: page accueil' },
      { type: 'tip', text: "Les 7 premiers caractères (ex: a3f2c1d) sont le hash du commit : vous pouvez l'utiliser pour revenir à cet état avec git checkout <hash>." },
    ],
  },
  {
    id: 'guide-premier-repo',
    title: 'Mon premier repo GitHub',
    emoji: '🎯',
    level: 'beginner',
    keywords: ['premier', 'débutant', 'commencer', 'démarrer', 'guide', 'tuto', 'github'],
    content: [
      { type: 'text', text: "Voici les étapes complètes pour créer votre premier projet suivi par Git et le publier sur GitHub." },
      { type: 'steps', steps: [
        { label: '1. Créez un dossier projet', desc: 'mkdir mon-projet && cd mon-projet' },
        { label: '2. Initialisez Git', desc: 'git init : Git surveille maintenant ce dossier' },
        { label: '3. Créez vos premiers fichiers', desc: 'Créez un fichier index.html ou README.md dans le dossier' },
        { label: '4. Préparez les fichiers', desc: 'git add . : sélectionne tout' },
        { label: '5. Premier commit', desc: 'git commit -m "feat: initialisation du projet"' },
        { label: '6. Créez un dépôt sur GitHub', desc: 'github.com → "+" → "New repository" → donnez un nom → NE cochez PAS "Initialize this repository"' },
        { label: '7. Connectez GitHub', desc: 'Copiez la commande git remote add origin <url> depuis GitHub et exécutez-la dans le terminal' },
        { label: '8. Envoyez sur GitHub', desc: 'git push -u origin main : votre code est maintenant visible sur GitHub !' },
      ]},
    ],
  },
  {
    id: 'guide-workflow-quotidien',
    title: 'Workflow quotidien',
    emoji: '🔄',
    level: 'beginner',
    keywords: ['workflow', 'quotidien', 'habitude', 'routine', 'tous les jours', 'cycle'],
    content: [
      { type: 'text', text: "Voici le cycle à répéter chaque fois que vous travaillez sur un projet." },
      { type: 'steps', steps: [
        { label: '1. Récupérer les derniers changements', desc: 'git pull : toujours commencer par là si vous travaillez en équipe' },
        { label: '2. Coder', desc: 'Modifiez vos fichiers, ajoutez des fonctionnalités, corrigez des bugs' },
        { label: '3. Vérifier l\'état', desc: 'git status : voir ce qui a changé' },
        { label: '4. Préparer', desc: 'git add . : sélectionner tout ce que vous voulez sauvegarder' },
        { label: '5. Committer', desc: 'git commit -m "description de ce que vous avez fait"' },
        { label: '6. Envoyer sur GitHub', desc: 'git push : partager vos changements' },
      ]},
      { type: 'tip', text: "Faites plusieurs petits commits plutôt qu'un seul gros à la fin. C'est plus facile à comprendre et à annuler si besoin." },
    ],
  },
  {
    id: 'guide-conflits',
    title: 'Résoudre un conflit',
    emoji: '⚔️',
    level: 'intermediate',
    keywords: ['conflit', 'conflict', 'merge conflict', 'résoudre', 'marqueurs', 'fusionner'],
    content: [
      { type: 'text', text: "Un conflit se produit quand deux personnes ont modifié la même partie d'un fichier. Git ne sait pas quelle version choisir et vous demande de trancher." },
      { type: 'steps', steps: [
        { label: '1. Identifier les fichiers en conflit', desc: 'git status montre les fichiers avec "both modified"' },
        { label: '2. Ouvrir le fichier', desc: 'Dans votre éditeur, cherchez les marqueurs <<<<<<< HEAD' },
        { label: '3. Comprendre les marqueurs', desc: '<<<<<<< HEAD = VOTRE version, >>>>>>> branche = LEUR version, ======= = séparateur' },
        { label: '4. Choisir', desc: 'Gardez ce que vous voulez (votre version, la leur, ou une combinaison), et supprimez TOUS les marqueurs <<< === >>>' },
        { label: '5. Valider', desc: 'git add . puis git commit : Git crée automatiquement un "merge commit"' },
      ]},
      { type: 'warning', text: "Ne laissez jamais les marqueurs <<<<<<< dans votre code ! Votre application ne fonctionnera plus." },
    ],
  },
  {
    id: 'glossaire',
    title: 'Glossaire Git',
    emoji: '📖',
    level: 'beginner',
    keywords: ['glossaire', 'définition', 'vocabulaire', 'termes', 'mots', 'lexique'],
    content: [
      { type: 'glossary', items: [
        { term: 'Repository (Repo)', def: "Dossier de projet géré par Git, contenant tout le code et l'historique" },
        { term: 'Commit', def: 'Point de sauvegarde instantané du projet avec un message descriptif' },
        { term: 'Branch (Branche)', def: "Ligne de développement indépendante, permet de travailler en parallèle" },
        { term: 'Main / Master', def: "Branche principale du projet, celle qui contient le code stable" },
        { term: 'Remote (Dépôt distant)', def: "Copie du repo stockée en ligne (sur GitHub, GitLab, etc.)" },
        { term: 'Origin', def: "Nom par convention du remote principal (souvent GitHub)" },
        { term: 'Push', def: "Envoyer les commits locaux vers le remote (GitHub)" },
        { term: 'Pull', def: "Récupérer les commits du remote et les intégrer localement" },
        { term: 'Fetch', def: "Télécharger les changements du remote sans les intégrer (plus prudent que pull)" },
        { term: 'Merge', def: "Fusionner les commits d'une branche dans une autre" },
        { term: 'Staging Area', def: "Zone de préparation entre vos fichiers et un commit (remplie par git add)" },
        { term: 'Clone', def: "Copier un dépôt existant depuis GitHub vers votre ordinateur" },
        { term: 'HEAD', def: "Pointeur vers le commit actuellement actif" },
        { term: 'Hash / SHA', def: "Identifiant unique d'un commit (ex: a3f2c1d)" },
        { term: 'Stash', def: "Mise de côté temporaire de modifications en cours sans les committer" },
        { term: 'Tag', def: "Étiquette permanente sur un commit, souvent pour les versions (v1.0.0)" },
        { term: 'Fork', def: "Copie personnelle d'un repo GitHub d'un autre utilisateur" },
        { term: 'Pull Request (PR)', def: "Demande de fusion de votre branche vers une autre, sur GitHub" },
      ]},
    ],
  },
  {
    id: 'faq',
    title: 'FAQ Débutants',
    emoji: '❓',
    level: 'beginner',
    keywords: ['faq', 'questions', 'différence', 'pourquoi', 'comment', 'aide', 'problème'],
    content: [
      { type: 'heading', text: 'Quelle différence entre git fetch et git pull ?' },
      { type: 'text', text: "fetch télécharge les changements sans les intégrer à votre branche. pull = fetch + merge en une seule étape. Pour les débutants, pull est plus simple au quotidien." },
      { type: 'heading', text: "J'ai fait une erreur, comment annuler ?" },
      { type: 'code', lang: 'bash', code: "# Annuler les modifications non commitées d'UN fichier\ngit checkout -- nom-fichier.tsx\n\n# Annuler le dernier commit en gardant les modifications\ngit reset --soft HEAD~1\n\n# Voir les dernières opérations (pour annuler quelque chose de plus ancien)\ngit reflog" },
      { type: 'heading', text: 'Git me demande un login/password, comment faire ?' },
      { type: 'text', text: "GitHub n'accepte plus les mots de passe depuis 2021. Vous devez utiliser un Personal Access Token (PAT). Allez sur GitHub → Settings → Developer settings → Personal access tokens → Generate new token, puis utilisez ce token à la place de votre mot de passe." },
      { type: 'heading', text: 'Mon push est refusé "non-fast-forward", pourquoi ?' },
      { type: 'text', text: "Quelqu'un d'autre a pushé après votre dernier pull. Faites git pull pour récupérer ses commits, puis git push à nouveau." },
      { type: 'heading', text: 'Quelle différence entre git reset et git revert ?' },
      { type: 'text', text: "reset réécrit l'historique (dangereux si déjà pushé). revert crée un nouveau commit qui annule le précédent (sûr à utiliser même après un push)." },
    ],
  },
];
