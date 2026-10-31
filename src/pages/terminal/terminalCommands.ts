export interface TerminalCommand {
  cmd: string;
  desc: string;
  descFr: string;
  category: string;
  categoryFr: string;
  output?: string;
}

export const TERMINAL_COMMANDS: TerminalCommand[] = [
  { cmd: 'git status', desc: 'Show working tree status', descFr: 'Afficher l\'état du dépôt', category: 'Status', categoryFr: 'Statut', output: 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nnothing to commit, working tree clean' },
  { cmd: 'git log --oneline --graph', desc: 'Compact commit history graph', descFr: 'Historique compact en graphe', category: 'History', categoryFr: 'Historique', output: '* a3f2c1d (HEAD -> main, origin/main) feat: update README\n* 8b1e9f2 fix: resolve merge conflict\n* 3c7d4a1 chore: update dependencies' },
  { cmd: 'git log --oneline', desc: 'Show commit history (one line)', descFr: 'Historique des commits (une ligne)', category: 'History', categoryFr: 'Historique', output: 'a3f2c1d feat: update README\n8b1e9f2 fix: resolve merge conflict\n3c7d4a1 chore: update dependencies\n1f9a2b3 feat: add login page' },
  { cmd: 'git branch', desc: 'List local branches', descFr: 'Lister les branches locales', category: 'Branches', categoryFr: 'Branches', output: '  develop\n* main\n  feature/auth' },
  { cmd: 'git branch -a', desc: 'List all branches (local + remote)', descFr: 'Lister toutes les branches', category: 'Branches', categoryFr: 'Branches', output: '  develop\n* main\n  feature/auth\n  remotes/origin/HEAD -> origin/main\n  remotes/origin/develop\n  remotes/origin/main' },
  { cmd: 'git remote -v', desc: 'List remote connections with URLs', descFr: 'Lister les dépôts distants', category: 'Remote', categoryFr: 'Dépôt distant', output: 'origin\thttps://github.com/user/repo.git (fetch)\norigin\thttps://github.com/user/repo.git (push)' },
  { cmd: 'git diff', desc: 'Show unstaged changes', descFr: 'Voir les changements non stagés', category: 'Status', categoryFr: 'Statut', output: 'diff --git a/src/app.js b/src/app.js\nindex 83db48f..f735c31 100644\n--- a/src/app.js\n+++ b/src/app.js\n@@ -1,4 +1,5 @@\n const app = express();\n+app.use(express.json());' },
  { cmd: 'git diff --staged', desc: 'Show staged changes ready to commit', descFr: 'Voir les changements en staging', category: 'Status', categoryFr: 'Statut', output: 'diff --git a/README.md b/README.md\nindex 9daeafb..1e95a5c 100644\n--- a/README.md\n+++ b/README.md\n@@ -1 +1,3 @@\n # My Project\n+\n+Updated description.' },
  { cmd: 'git stash list', desc: 'List all stashed changes', descFr: 'Lister les remisages', category: 'Stash', categoryFr: 'Remisage', output: 'stash@{0}: WIP on main: a3f2c1d feat: update README\nstash@{1}: On develop: WIP: new form component' },
  { cmd: 'git tag', desc: 'List all tags', descFr: 'Lister tous les tags', category: 'Tags', categoryFr: 'Tags', output: 'v0.1.0\nv0.2.0\nv1.0.0\nv1.1.0' },
  { cmd: 'git config --list', desc: 'Show all configuration settings', descFr: 'Afficher la configuration', category: 'Config', categoryFr: 'Configuration', output: 'core.repositoryformatversion=0\ncore.filemode=true\ncore.bare=false\ncore.logallrefupdates=true\nuser.name=Alice Dupont\nuser.email=alice@example.com\nbranch.main.remote=origin\nbranch.main.merge=refs/heads/main' },
  { cmd: 'git shortlog -sn', desc: 'Show commit count per author', descFr: 'Nombre de commits par auteur', category: 'History', categoryFr: 'Historique', output: '    42\tAlice Dupont\n    18\tBob Martin\n     7\tCharlie Durand' },
  { cmd: 'git fetch --prune', desc: 'Fetch and clean stale branches', descFr: 'Récupérer et nettoyer les branches obsolètes', category: 'Remote', categoryFr: 'Dépôt distant', output: 'From https://github.com/user/repo\n - [deleted]         (none)     -> origin/old-feature\n   a3f2c1d..8b1e9f2  main       -> origin/main' },
  { cmd: 'git reflog', desc: 'Show history of HEAD positions', descFr: 'Historique des positions de HEAD', category: 'History', categoryFr: 'Historique', output: 'a3f2c1d (HEAD -> main) HEAD@{0}: commit: feat: update README\n8b1e9f2 HEAD@{1}: checkout: moving from develop to main\n3c7d4a1 HEAD@{2}: commit: chore: update dependencies' },
  { cmd: 'git init', desc: 'Initialize a new local repository', descFr: 'Initialiser un nouveau dépôt local', category: 'Init', categoryFr: 'Initialisation', output: 'Initialized empty Git repository in /path/to/project/.git/' },
  { cmd: 'git stash', desc: 'Temporarily save uncommitted changes', descFr: 'Sauvegarder temporairement les changements', category: 'Stash', categoryFr: 'Remisage', output: 'Saved working directory and index state WIP on main: a3f2c1d feat: update README' },
  { cmd: 'git stash pop', desc: 'Apply most recent stash', descFr: 'Appliquer le dernier remisage', category: 'Stash', categoryFr: 'Remisage', output: 'On branch main\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n\n\tmodified:   src/app.js\n\nDropped refs/stash@{0}' },
  { cmd: 'git add .', desc: 'Stage all changes', descFr: 'Stager tous les changements', category: 'Staging', categoryFr: 'Staging', output: '' },
  { cmd: 'git commit -m "feat: your message"', desc: 'Commit staged changes with a message', descFr: 'Committer avec un message', category: 'Commit', categoryFr: 'Commit', output: '[main a3f2c1d] feat: your message\n 1 file changed, 5 insertions(+)' },
  { cmd: 'git push origin main', desc: 'Push main branch to remote', descFr: 'Pousser la branche main', category: 'Remote', categoryFr: 'Dépôt distant', output: 'Enumerating objects: 5, done.\nCounting objects: 100% (5/5), done.\nWriting objects: 100% (3/3), 312 bytes | 312.00 KiB/s, done.\nTo https://github.com/user/repo.git\n   8b1e9f2..a3f2c1d  main -> main' },
  { cmd: 'git pull', desc: 'Fetch and merge remote changes', descFr: 'Récupérer et fusionner les changements distants', category: 'Remote', categoryFr: 'Dépôt distant', output: 'Already up to date.' },
  { cmd: 'git checkout -b feature/new-feature', desc: 'Create and switch to a new branch', descFr: 'Créer et switcher sur une nouvelle branche', category: 'Branches', categoryFr: 'Branches', output: 'Switched to a new branch \'feature/new-feature\'' },
  { cmd: 'git merge develop', desc: 'Merge develop into current branch', descFr: 'Fusionner develop dans la branche courante', category: 'Branches', categoryFr: 'Branches', output: 'Updating 8b1e9f2..a3f2c1d\nFast-forward\n src/app.js | 3 +++\n 1 file changed, 3 insertions(+)' },
  { cmd: 'git reset --soft HEAD~1', desc: 'Undo last commit, keep changes staged', descFr: 'Annuler le dernier commit, garder les changements stagés', category: 'History', categoryFr: 'Historique', output: '' },
  { cmd: 'git rebase -i HEAD~3', desc: 'Interactive rebase last 3 commits', descFr: 'Rebase interactif des 3 derniers commits', category: 'History', categoryFr: 'Historique', output: 'hint: Waiting for your editor to close the file...' },
  { cmd: 'git cherry-pick a1b2c3d', desc: 'Apply a specific commit to current branch', descFr: 'Appliquer un commit spécifique', category: 'History', categoryFr: 'Historique', output: '[main 9f1c3b2] feat: cherry-picked commit\n Date: Mon Jan 1 10:00:00 2024 +0000\n 1 file changed, 2 insertions(+)' },
  { cmd: 'git revert HEAD', desc: 'Create a commit that undoes the last one', descFr: 'Créer un commit qui annule le dernier', category: 'History', categoryFr: 'Historique', output: '[main 2c4d5e6] Revert "feat: update README"\n 1 file changed, 1 deletion(-)' },
  { cmd: 'git clone https://github.com/user/repo.git', desc: 'Clone a remote repository', descFr: 'Cloner un dépôt distant', category: 'Init', categoryFr: 'Initialisation', output: 'Cloning into \'repo\'...\nremote: Enumerating objects: 142, done.\nremote: Counting objects: 100% (142/142), done.\nReceiving objects: 100% (142/142), 48.23 KiB | 2.41 MiB/s, done.' },
  { cmd: 'git tag -a v1.0.0 -m "First stable release"', desc: 'Create an annotated tag', descFr: 'Créer un tag annoté', category: 'Tags', categoryFr: 'Tags', output: '' },
  { cmd: 'git push origin --tags', desc: 'Push all tags to remote', descFr: 'Pousser tous les tags', category: 'Tags', categoryFr: 'Tags', output: 'Enumerating objects: 1, done.\nTo https://github.com/user/repo.git\n * [new tag]         v1.0.0 -> v1.0.0' },
  { cmd: 'git blame src/app.js', desc: 'Show who changed each line', descFr: 'Voir qui a modifié chaque ligne', category: 'Debug', categoryFr: 'Debug', output: '^a3f2c1d (Alice Dupont  2024-01-15 10:23:04 +0100 1) const app = express();\n^8b1e9f2 (Bob Martin    2024-01-16 14:11:32 +0100 2) app.use(express.json());' },
  { cmd: 'git log -S "apiKey"', desc: 'Find commits that changed "apiKey"', descFr: 'Trouver les commits ayant modifié "apiKey"', category: 'Debug', categoryFr: 'Debug', output: 'commit 1f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c\nAuthor: Alice Dupont <alice@example.com>\nDate:   Mon Jan 8 09:15:00 2024 +0100\n\n    feat: add API key configuration' },
  { cmd: 'git grep "TODO"', desc: 'Search for TODO in tracked files', descFr: 'Rechercher TODO dans les fichiers suivis', category: 'Debug', categoryFr: 'Debug', output: 'src/app.js:// TODO: add authentication middleware\nsrc/utils.js:// TODO: optimize this function' },
  { cmd: 'git clean -fd', desc: 'Remove untracked files and directories', descFr: 'Supprimer les fichiers non suivis', category: 'Staging', categoryFr: 'Staging', output: 'Removing node_modules/\nRemoving .cache/' },
  { cmd: 'git fetch', desc: 'Download changes from remote', descFr: 'Télécharger les changements distants', category: 'Remote', categoryFr: 'Dépôt distant', output: 'From https://github.com/user/repo\n   8b1e9f2..a3f2c1d  main     -> origin/main' },
];

export const CATEGORIES = Array.from(
  new Set(TERMINAL_COMMANDS.map(c => c.category))
);
