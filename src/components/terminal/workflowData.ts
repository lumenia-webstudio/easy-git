export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  command: string;
  hint?: string;
  /** Patterns regex sur la sortie terminal pour auto-valider l'étape */
  successPatterns?: RegExp[];
}

export interface Workflow {
  id: string;
  title: string;
  emoji: string;
  description: string;
  level: 'beginner' | 'intermediate';
  steps: WorkflowStep[];
  completionMessage: string;
  nextWorkflowId?: string;
}

export const WORKFLOWS: Workflow[] = [
  {
    id: 'first-commit',
    title: 'Mon premier commit',
    emoji: '🎯',
    description: 'Créez un dépôt Git, sauvegardez votre code et publiez-le sur GitHub.',
    level: 'beginner',
    completionMessage: 'Félicitations ! Vous venez de créer votre premier commit et de le publier sur GitHub. Continuez avec le "Workflow quotidien" pour vous entraîner.',
    nextWorkflowId: 'daily-workflow',
    steps: [
      {
        id: 'init',
        title: 'Initialiser le dépôt',
        description: 'Créez un dépôt Git vide dans le dossier courant. À faire une seule fois, au début de chaque projet.',
        command: 'git init',
        hint: 'Assurez-vous d\'être dans le bon dossier avant d\'exécuter cette commande.',
        successPatterns: [/initialized empty git repository/i, /initialized git repository/i],
      },
      {
        id: 'add',
        title: 'Préparer les fichiers',
        description: 'Sélectionnez tous vos fichiers pour les inclure dans le prochain commit.',
        command: 'git add .',
        hint: 'Le point "." signifie "tous les fichiers". Vous pouvez aussi indiquer un fichier précis.',
      },
      {
        id: 'commit',
        title: 'Créer le commit',
        description: 'Sauvegardez un instantané de votre projet avec un message descriptif.',
        command: 'git commit -m "feat: premier commit"',
        hint: 'Le message entre guillemets décrit ce que vous avez fait. Soyez précis !',
        successPatterns: [/\[.+\s+[a-f0-9]{6,}\]/],
      },
      {
        id: 'remote',
        title: 'Connecter GitHub',
        description: 'Reliez votre dépôt local au dépôt GitHub que vous avez créé.',
        command: 'git remote add origin https://github.com/VOTRE-COMPTE/VOTRE-DEPOT.git',
        hint: 'Remplacez VOTRE-COMPTE et VOTRE-DEPOT par vos vraies valeurs GitHub. Créez d\'abord le dépôt sur github.com.',
      },
      {
        id: 'push',
        title: 'Envoyer sur GitHub',
        description: 'Publiez vos commits sur GitHub pour les rendre accessibles en ligne.',
        command: 'git push -u origin main',
        hint: 'Le "-u origin main" configure le suivi. Ensuite, "git push" tout seul suffira.',
      },
    ],
  },
  {
    id: 'daily-workflow',
    title: 'Workflow quotidien',
    emoji: '🔄',
    description: 'Le cycle à répéter chaque fois que vous travaillez sur un projet existant.',
    level: 'beginner',
    completionMessage: 'Excellent ! Vous maîtrisez le workflow quotidien. C\'est le cycle que vous répéterez à chaque session de travail.',
    steps: [
      {
        id: 'pull',
        title: 'Récupérer les changements',
        description: 'Téléchargez les derniers commits depuis GitHub avant de commencer à travailler.',
        command: 'git pull',
        hint: 'Commencez toujours par là si vous travaillez en équipe ou depuis plusieurs ordinateurs.',
      },
      {
        id: 'status',
        title: 'Vérifier l\'état',
        description: 'Voyez quels fichiers ont été modifiés depuis le dernier commit.',
        command: 'git status',
        hint: 'Exécutez git status souvent : c\'est votre boussole Git.',
      },
      {
        id: 'add',
        title: 'Préparer les fichiers',
        description: 'Sélectionnez tous les fichiers modifiés pour le prochain commit.',
        command: 'git add .',
        hint: 'Vous pouvez aussi faire "git add nom-fichier.txt" pour un seul fichier.',
      },
      {
        id: 'commit',
        title: 'Créer le commit',
        description: 'Sauvegardez vos modifications avec un message qui décrit le travail effectué.',
        command: 'git commit -m "feat: décrire ce que vous avez fait"',
        hint: 'Utilisez des préfixes : feat: (nouveauté), fix: (bug), docs: (documentation)',
        successPatterns: [/\[.+\s+[a-f0-9]{6,}\]/],
      },
      {
        id: 'push',
        title: 'Envoyer sur GitHub',
        description: 'Publiez vos commits pour les sauvegarder en ligne et les partager.',
        command: 'git push',
        hint: 'Après le premier push avec -u, "git push" tout seul suffit.',
      },
    ],
  },
];

export function getWorkflowById(id: string): Workflow | undefined {
  return WORKFLOWS.find(w => w.id === id);
}
