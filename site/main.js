// Easy Git — landing : liens vers la dernière version publiée, et boutons « Copier ».
// Sans réseau ou si l'API GitHub refuse, les liens v1.0.0 du HTML restent valables.

const REPO = 'lumenia-webstudio/easy-git';

async function latestRelease() {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return;
    const release = await res.json();
    const find = (re) => release.assets?.find((a) => re.test(a.name));
    const deb = find(/\.deb$/);
    const appimage = find(/\.AppImage$/);
    if (!deb || !appimage) return;

    const version = release.tag_name.replace(/^v/, '');
    document.querySelectorAll('[data-version]').forEach((el) => { el.textContent = `Version ${version}`; });
    document.querySelector('[data-asset="deb"]').href = deb.browser_download_url;
    document.querySelector('[data-asset="appimage"]').href = appimage.browser_download_url;
    document.querySelector('[data-cmd="deb"]').textContent = `cd ~/Téléchargements && sudo apt install ./${deb.name}`;
    document.querySelector('[data-cmd="appimage"]').textContent = `chmod +x ${appimage.name} && ./${appimage.name}`;
    document.querySelector('[data-release]').href = release.html_url;
  } catch {
    // Les liens du HTML suffisent.
  }
}

document.querySelectorAll('.copy').forEach((button) => {
  button.addEventListener('click', async () => {
    const text = button.previousElementSibling.textContent;
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = 'Copié';
    } catch {
      button.textContent = 'Sélectionnez le texte';
    }
    setTimeout(() => { button.textContent = 'Copier'; }, 2000);
  });
});

// Captures : un clic les ouvre en grand ; Échap, la croix ou un clic sur l'image referment.
const lightbox = document.querySelector('.lightbox');
const lightboxImg = lightbox.querySelector('img');
document.querySelectorAll('.zoom').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (!lightbox.showModal) return; // navigateur sans <dialog> : le lien ouvre l'image
    event.preventDefault();
    const thumb = link.querySelector('img');
    lightboxImg.src = link.href;
    lightboxImg.alt = thumb.alt;
    lightbox.showModal();
  });
});
lightbox.addEventListener('click', (event) => {
  if (event.target === lightboxImg || event.target === lightbox || event.target.closest('.lightbox-close')) lightbox.close();
});
lightbox.addEventListener('close', () => { lightboxImg.removeAttribute('src'); });

latestRelease();
