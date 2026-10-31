import type { ArgModalConfig } from './ArgModal';

export interface QuickAction {
  id: string;
  label: string;
  sublabel: string;
  tooltip: string;
  iconName: string; // nom de l'icône Lucide
  command?: string; // commande directe sans arguments
  modal?: Omit<ArgModalConfig, 'icon'>; // config modal sans l'icône (ajoutée au runtime)
  helpSection?: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'init',
    label: 'Init',
    sublabel: 'Créer un repo',
    tooltip: 'Initialise un nouveau dépôt Git dans le dossier courant. À faire en premier sur un nouveau projet.',
    iconName: 'FolderPlus',
    command: 'git init',
    helpSection: 'cmd-init',
  },
  {
    id: 'clone',
    label: 'Clone',
    sublabel: 'Copier un repo',
    tooltip: 'Télécharge une copie complète d\'un dépôt GitHub sur votre ordinateur.',
    iconName: 'Download',
    helpSection: 'cmd-clone',
    modal: {
      title: 'Cloner un dépôt',
      description: 'Télécharge une copie du dépôt sur votre ordinateur',
      fields: [{
        name: 'URL du dépôt GitHub',
        placeholder: 'https://github.com/utilisateur/mon-projet.git',
        hint: 'Copiez l\'URL depuis le bouton vert "Code" sur GitHub',
        validate: (v: string) => (v.startsWith('http') || v.startsWith('git@')) ? null : 'L\'URL doit commencer par https:// ou git@',
      }],
      buildCommand: ([url]: string[]) => `git clone ${url}`,
      example: 'https://github.com/torvalds/linux.git',
    },
  },
  {
    id: 'status',
    label: 'Status',
    sublabel: 'État du repo',
    tooltip: 'Affiche quels fichiers ont été modifiés, ajoutés ou supprimés depuis le dernier commit.',
    iconName: 'Activity',
    command: 'git status',
    helpSection: 'cmd-status',
  },
  {
    id: 'add',
    label: 'Add All',
    sublabel: 'Préparer tout',
    tooltip: 'Sélectionne tous les fichiers modifiés pour les inclure dans le prochain commit. Étape obligatoire avant Commit.',
    iconName: 'Plus',
    command: 'git add .',
    helpSection: 'cmd-add',
  },
  {
    id: 'commit',
    label: 'Commit',
    sublabel: 'Sauvegarder',
    tooltip: 'Crée un point de sauvegarde avec tous les fichiers préparés par Add, avec un message descriptif.',
    iconName: 'Save',
    helpSection: 'cmd-commit',
    modal: {
      title: 'Créer un commit',
      description: 'Sauvegarde un instantané de vos modifications',
      fields: [{
        name: 'Message du commit',
        placeholder: 'feat: ajouter la page de connexion',
        hint: 'Décrivez ce que vous avez fait, de manière courte et claire',
        validate: (v: string) => v.trim().length >= 3 ? null : 'Le message doit faire au moins 3 caractères',
        suggestions: ['feat:', 'fix:', 'chore:', 'docs:', 'refactor:'],
      }],
      buildCommand: ([msg]: string[]) => `git commit -m "${msg}"`,
      example: 'feat: ajouter la page de connexion',
    },
  },
  {
    id: 'push',
    label: 'Push',
    sublabel: 'Envoyer',
    tooltip: 'Envoie vos commits locaux vers GitHub. Les autres pourront voir vos changements.',
    iconName: 'Upload',
    command: 'git push',
    helpSection: 'cmd-push',
  },
  {
    id: 'pull',
    label: 'Pull',
    sublabel: 'Récupérer',
    tooltip: 'Télécharge et intègre les derniers changements depuis GitHub. À faire avant de commencer à travailler.',
    iconName: 'ArrowDown',
    command: 'git pull',
    helpSection: 'cmd-pull',
  },
  {
    id: 'checkout',
    label: 'Checkout',
    sublabel: 'Changer branche',
    tooltip: 'Crée et bascule vers une nouvelle branche. Utile pour travailler sur une fonctionnalité sans toucher au code principal.',
    iconName: 'GitBranch',
    helpSection: 'cmd-checkout',
    modal: {
      title: 'Créer une nouvelle branche',
      description: 'Démarre une ligne de développement isolée',
      fields: [{
        name: 'Nom de la branche',
        placeholder: 'feature/ma-nouvelle-fonctionnalite',
        hint: 'Utilisez des tirets, pas d\'espaces. Ex: feature/login, fix/bug-affichage',
        validate: (v: string) => /^[a-zA-Z0-9/_-]+$/.test(v) ? null : 'Pas d\'espaces ni caractères spéciaux',
      }],
      buildCommand: ([branch]: string[]) => `git checkout -b ${branch}`,
      example: 'feature/page-contact',
    },
  },
  {
    id: 'merge',
    label: 'Merge',
    sublabel: 'Fusionner',
    tooltip: 'Fusionne les changements d\'une autre branche dans la branche courante.',
    iconName: 'GitMerge',
    helpSection: 'cmd-merge',
    modal: {
      title: 'Fusionner une branche',
      description: 'Intègre les changements d\'une autre branche',
      fields: [{
        name: 'Branche à fusionner',
        placeholder: 'feature/ma-fonctionnalite',
        hint: 'Tapez git branch pour voir la liste des branches disponibles',
        validate: (v: string) => v.trim().length > 0 ? null : 'Requis',
      }],
      buildCommand: ([branch]: string[]) => `git merge ${branch}`,
      example: 'feature/page-contact',
    },
  },
  {
    id: 'log',
    label: 'Log',
    sublabel: 'Historique',
    tooltip: 'Affiche l\'historique des commits sous forme de graphe. Voir qui a fait quoi et quand.',
    iconName: 'GitCommit',
    command: 'git log --oneline --graph --all',
    helpSection: 'cmd-log',
  },
];
