#!/usr/bin/env node
// site/scripts/generate-hero.mjs
// Image de header de la landing Easy Git (easy-git.lumeniawebstudio.com).
// kie.ai — GPT Image 2, text-to-image 16:9 en 2K (10 crédits l'image), puis WebP ≤ 200 Ko par PIL.
//
// Versionné et non laissé en scratchpad : l'image devra être régénérée un jour (variante mobile,
// nouvelle version), et le gabarit ci-dessous est la seule garantie de garder la même facture.
// La clé du manifeste est le nom du fichier de sortie : c'est aussi celle du journal tasks.jsonl.
//
// Usage (la clé KIEAI_API_KEY vit dans un .env hors dépôt, jamais copiée ni lue ici) :
//   node --env-file=<chemin>/.env site/scripts/generate-hero.mjs --creer [clé…]   → poste les tâches
//   node --env-file=<chemin>/.env site/scripts/generate-hero.mjs --recolter        → télécharge ce qui est prêt
//
// Bruts et candidats dans ~/Images/easy-git/hero/ ; rien n'est écrit dans site/ avant validation.
// ⚠️ `fetch failed` ne signifie PAS que la génération a échoué : tout appel réseau a un timeout et un retry,
// et le journal fait foi. --recolter ne crée jamais de tâche.

import fs from 'fs'
import os from 'os'
import path from 'path'
import { execFileSync } from 'child_process'

const OUT = path.join(os.homedir(), 'Images', 'easy-git', 'hero')
const JOURNAL = path.join(OUT, 'tasks.jsonl')

// Deux pistes distinctes pour le premier choix ; seul {SCENE} varie.
const IMAGES = {
  'hero-test-a-vallee': 'An aerial view at night over a dark, misty valley. Rivers of warm golden light flow from the right side of the frame, split into several branches that run in parallel for a while, then merge back into one bright stream. Where branches split or meet, a small round point of light glows, like a beacon. Faint cool blue mist and distant hills.',
  'hero-test-b-lumiere': 'An abstract long-exposure light painting in a deep navy blue space. Thin glowing golden lines enter from the right, split into parallel paths with smooth curves, then rejoin into a single line. Small luminous orbs sit exactly where the lines split or join. Soft depth of field, a few faint cool blue light streaks far in the background.',
}

// Variante portrait (mobile) : image-to-image depuis la version retenue, pour garder la même scène.
// Une variante portrait se génère, elle ne se recadre pas : en portrait, cover ne garderait que le centre vide.
// Les fonds de page (bg-*) passent derrière le texte : centre sombre, lumière rangée sur les côtés.
const VARIANTS = {
  'hero-mobile-a-vallee': { source: 'hero-test-a-vallee', ratio: '9:16', size: [1080, 1920], prompt: () => variantPrompt },
  'bg-test-1-aval': { source: 'hero-test-a-vallee', ratio: '16:9', size: [1920, 1080], prompt: () => bgPrompt('Further down the same valley: the golden rivers have spread apart and now run far away along the left and right edges of the frame, thin and distant, with a few small glowing points; between them, the centre of the valley is wide, dark and empty, with only faint mist and forest.') },
  'bg-test-2-cretes': { source: 'hero-test-a-vallee', ratio: '16:9', size: [1920, 1080], prompt: () => bgPrompt('Look up from the same valley: dark mountain ridges along the very bottom of the frame, with a faint golden glow of the rivers behind them; above, a vast calm night sky with sparse small stars, a few slightly golden, gathered towards the left and right edges; the centre of the sky stays dark and empty.') },
}
const bgPrompt = (scene) => `Use this image only for its style, colours and mood, and paint a new scene in the same world. ${scene}
Purpose: a website background displayed at low opacity behind text, so: very low overall contrast, no bright area in the central 50% of the frame, nothing that catches the eye in the middle.
Palette: deep night navy blue (#060d1a), warm gold (#f0b429) only in small distant lights, rare soft blue (#5b9cf0).
Constraints: no words, no letters, no digits, no logos, no watermarks, no people, no frame, no vignette border. One single finished image.`
const variantPrompt = `Recompose this exact scene as a vertical 9:16 image: same night valley, same mist, same golden rivers of light that split into branches and merge back, same small glowing points where they meet, same colours and mood.
Composition: the upper 40% of the frame is dark calm night sky and distant hills, nearly empty, so a title can be placed over it; the golden branching rivers rise from the bottom of the frame and occupy the lower 60%, centred horizontally.
Constraints: no words, no letters, no digits, no logos, no watermarks, no people. One single finished image.`

const prompt = (scene) => `Cinematic wide header image for the website of Easy Git, a calm and friendly desktop app that helps beginners use Git and GitHub.
Scene: ${scene}
Meaning: the image quietly evokes a version history graph, branches that separate and come back together, without any interface, diagram or symbol.
Composition: horizontal 16:9, all the light and detail sits in the right 55% of the frame; the left 45% stays dark, calm and nearly empty so a title can be placed over it.
Palette: deep night navy blue (#060d1a), warm gold (#f0b429) light, rare touches of soft blue (#5b9cf0); no other colours.
Mood: serene, hopeful, premium, quiet; low overall contrast except the golden light.
Constraints: no words, no letters, no digits, no logos, no watermarks, no people, no screens, no computers, no circuit boards, no neon, no sci-fi spaceships. One single finished image.`

const api = async (url, opts = {}, tries = 4) => {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(60_000) })
      const j = await r.json()
      if (j.code === 429 && i < tries) { await new Promise(s => setTimeout(s, 5000 * i)); continue }
      return j
    } catch (e) { if (i >= tries) throw e; await new Promise(s => setTimeout(s, 3000 * i)) }
  }
}
const headers = () => ({ Authorization: `Bearer ${process.env.KIEAI_API_KEY}`, 'Content-Type': 'application/json' })
const journal = () => fs.existsSync(JOURNAL) ? fs.readFileSync(JOURNAL, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)) : []

async function creer(keys) {
  if (!process.env.KIEAI_API_KEY) throw new Error('KIEAI_API_KEY manquante')
  fs.mkdirSync(OUT, { recursive: true })
  const done = new Set(journal().map(t => t.key))
  for (const key of keys) {
    if (!IMAGES[key] && !VARIANTS[key]) throw new Error('clé inconnue : ' + key)
    if (done.has(key)) { console.log('déjà au journal :', key); continue }
    let body
    if (VARIANTS[key]) {
      const src = journal().find(t => t.key === VARIANTS[key].source)
      if (!src) throw new Error('source absente du journal : ' + VARIANTS[key].source)
      const info = await api(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${src.taskId}`, { headers: headers() })
      const url = JSON.parse(info.data.resultJson).resultUrls[0]
      body = { model: 'gpt-image-2-image-to-image', callBackUrl: '', input: { prompt: VARIANTS[key].prompt(), image_urls: [url], aspect_ratio: VARIANTS[key].ratio, resolution: '2K' } }
    } else {
      body = { model: 'gpt-image-2-text-to-image', callBackUrl: '', input: { prompt: prompt(IMAGES[key]), aspect_ratio: '16:9', resolution: '2K' } }
    }
    const j = await api('https://api.kie.ai/api/v1/jobs/createTask', { method: 'POST', headers: headers(), body: JSON.stringify(body) })
    if (j.code !== 200) { console.error('refus', key, j.code, j.msg); continue }
    fs.appendFileSync(JOURNAL, JSON.stringify({ key, taskId: j.data.taskId, at: new Date().toISOString() }) + '\n')
    console.log('posté', key, j.data.taskId)
    await new Promise(s => setTimeout(s, 2500))
  }
}

async function recolter() {
  if (!process.env.KIEAI_API_KEY) throw new Error('KIEAI_API_KEY manquante')
  for (const { key, taskId } of journal()) {
    const [w, h] = VARIANTS[key]?.size ?? [1920, 1080]
    const webp = path.join(OUT, key + '.webp')
    if (fs.existsSync(webp)) { console.log('ok', key); continue }
    let j
    try { j = await api(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, { headers: headers() }) } catch { console.log('poll en erreur réseau', key); continue }
    const state = j?.data?.state
    if (state !== 'success') { console.log(key, state || 'inconnu', state === 'fail' ? j.data.failMsg : ''); continue }
    const url = JSON.parse(j.data.resultJson).resultUrls[0]
    const png = path.join(OUT, key + '.png')
    for (let i = 1; i <= 6; i++) {
      try {
        const r = await fetch(url, { signal: AbortSignal.timeout(120_000) })
        const buf = Buffer.from(await r.arrayBuffer())
        if (buf.length < 50_000) throw new Error('fichier trop petit')
        fs.writeFileSync(png, buf); break
      } catch { if (i === 6) { console.log('téléchargement échoué', key); fs.rmSync(png, { force: true }) } else await new Promise(s => setTimeout(s, 2000 * i)) }
    }
    if (!fs.existsSync(png)) continue
    // Recadré au centre aux dimensions cibles, qualité dégressive par PIL (ImageMagick ignore -quality en WebP ici).
    execFileSync('python3', ['-I', '-c', `
import os, sys
from PIL import Image, ImageOps
src, out = sys.argv[1], sys.argv[2]
im = ImageOps.fit(Image.open(src).convert("RGB"), (int(sys.argv[3]), int(sys.argv[4])), Image.LANCZOS)
for q in (82, 76, 70, 64, 58, 52):
    im.save(out, "WEBP", quality=q, method=6)
    if os.path.getsize(out) <= 200_000: break
else: raise SystemExit(out + " reste au-dessus de 200 Ko")
print(out, im.size, os.path.getsize(out), "o")`, png, webp, String(w), String(h)], { stdio: 'inherit' })
  }
}

const [mode, ...rest] = process.argv.slice(2)
const keys = rest.length ? rest : Object.keys(IMAGES)  // les variantes se demandent par leur clé
if (mode === '--creer') await creer(keys)
else if (mode === '--recolter') await recolter()
else { console.error('usage : --creer [clé…] | --recolter'); process.exit(1) }
