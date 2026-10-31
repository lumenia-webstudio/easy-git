#!/usr/bin/env bash
# Publie la landing sur easy-git.lumeniawebstudio.com (o2switch socle), sur le modèle de LWS-Demos/publier.sh.
# Usage : site/publier.sh
# Prérequis : ~/.lws-cpanel.env (CPANEL_HOST, CPANEL_USER, CPANEL_TOKEN), jamais affiché.
# Étapes : archive des seuls fichiers publics, vidage de l'ancienne version (sauf cgi-bin et .well-known),
# dépôt, extraction, retrait de l'archive, contrôles HTTP.
set -euo pipefail
cd "$(dirname "$0")"
FICHIERS=(.htaccess index.html style.css main.js robots.txt sitemap.xml fonts img)

set -a; . ~/.lws-cpanel.env; set +a
AUTH=$(mktemp); TMP=$(mktemp -d); chmod 600 "$AUTH"
trap 'rm -f "$AUTH" "$TMP/site.zip"; rmdir "$TMP"' EXIT
printf 'header = "Authorization: cpanel %s:%s"\n' "$CPANEL_USER" "$CPANEL_TOKEN" > "$AUTH"
BASE="https://${CPANEL_HOST}:2083"
R="/home/${CPANEL_USER}/easy-git.lumeniawebstudio.com"
URL="https://easy-git.lumeniawebstudio.com/"

fileop() { # fileop <op> <sourcefiles> [destfiles] : affiche True si tout a réussi
  curl -s -m 180 -K "$AUTH" -G "$BASE/json-api/cpanel" \
    --data-urlencode cpanel_jsonapi_apiversion=2 --data-urlencode cpanel_jsonapi_module=Fileman \
    --data-urlencode cpanel_jsonapi_func=fileop --data-urlencode "op=$1" \
    --data-urlencode "sourcefiles=$2" ${3:+--data-urlencode "destfiles=$3"} --data-urlencode doubledecode=0 \
  | python3 -I -c "import json,sys;d=json.load(sys.stdin)['cpanelresult'];print(all(x.get('result')==1 for x in (d.get('data') or [{}])) and not d.get('error'))"
  sleep 2 # o2switch renvoie 429 sur les rafales
}

zip -qr "$TMP/site.zip" "${FICHIERS[@]}"
echo "archive : $(du -h "$TMP/site.zip" | cut -f1)"

anciens=$(curl -s -m 30 -K "$AUTH" -G "$BASE/execute/Fileman/list_files" --data-urlencode "dir=$R" --data-urlencode show_hidden=1 \
  | python3 -I -c "import json,sys;print(','.join('$R/'+f['file'] for f in (json.load(sys.stdin).get('data') or []) if f['file'] not in ('cgi-bin','.well-known','.','..')))")
sleep 2
if [ -n "$anciens" ]; then echo "ancienne version retirée : $(fileop unlink "$anciens")"; fi

echo "dépôt : $(curl -s -m 300 -K "$AUTH" -F "dir=$R" -F "file-1=@$TMP/site.zip" -F overwrite=1 "$BASE/execute/Fileman/upload_files" \
  | python3 -I -c "import json,sys;d=json.load(sys.stdin);print(d.get('status')==1 and not d.get('errors'))")"
sleep 2
echo "extraction : $(fileop extract "$R/site.zip" "$R")"
echo "archive retirée : $(fileop unlink "$R/site.zip")"

for chemin in "" style.css main.js img/hero.webp fonts/bricolage-grotesque-latin-800-normal.woff2; do
  echo "  $URL$chemin → $(curl -s -m 20 -o /dev/null -w '%{http_code}' "$URL$chemin")"
done
echo "  http → $(curl -s -m 20 -o /dev/null -w '%{http_code} %{redirect_url}' "http://easy-git.lumeniawebstudio.com/")"
