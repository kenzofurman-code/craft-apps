#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APPS_DIR="$SCRIPT_DIR/../public/apps"

mkdir -p "$APPS_DIR"

declare -A REPOS=(
  ["cadcraft"]="storytold/cadcraft|v0.20.1|cadcraft-web-0.20.1.zip"
  ["solidcraft"]="tangency-labs/solidcraft|v0.40.1|solidcraft-web-0.40.1.zip"
  ["gridcraft"]="storytold/gridcraft|v0.19.1|gridcraft-web-0.19.1.zip"
  ["craft-anything"]="storytold/craft-anything|v0.6.1|craft-anything-web-0.6.1.zip"
  ["photocraft"]="storytold/photocraft|v0.23.1|photocraft-web-0.23.1.zip"
  ["vectorcraft"]="storytold/vectorcraft|v0.24.1|vectorcraft-web-0.24.1.zip"
  ["designcraft"]="storytold/designcraft|v0.20.1|designcraft-web-0.20.1.zip"
  ["deckcraft"]="storytold/deckcraft|v0.18.1|deckcraft-web-0.18.1.zip"
  ["figcraft"]="storytold/figcraft|v0.18.1|figcraft-web-0.18.1.zip"
  ["filmcraft"]="storytold/filmcraft|v0.20.1|filmcraft-web-0.20.1.zip"
  ["effectcraft"]="storytold/effectcraft|v0.24.1|effectcraft-web-0.24.1.zip"
  ["wordcraft"]="storytold/wordcraft|v0.18.1|wordcraft-web-0.18.1.zip"
  ["soundcraft"]="storytold/soundcraft|v0.20.1|soundcraft-web-0.20.1.zip"
  ["lightcraft"]="storytold/lightcraft|v0.21.1|lightcraft-web-0.21.1.zip"
  ["pdfcraft"]="storytold/pdfcraft|v0.21.1|pdfcraft-web-0.21.1.zip"
  ["materialcraft"]="storytold/materialcraft|v0.4.1|materialcraft-web-0.4.1.zip"
  ["texturecraft"]="storytold/texturecraft|v0.6.1|texturecraft-web-0.6.1.zip"
)

echo "=========================================================="
echo "📦 Baixando e extraindo WebAssembly para Craft Apps (Linux/VPS)..."
echo "=========================================================="

for app in "${!REPOS[@]}"; do
  IFS='|' read -r repo tag asset <<< "${REPOS[$app]}"
  dest="$APPS_DIR/$app"
  
  if [ -f "$dest/index.html" ]; then
    echo "✔ [$app] já está instalado em $dest"
    continue
  fi

  echo "⬇ Baixando $asset ($repo)..."
  mkdir -p "$dest"
  temp_zip="/tmp/$app.zip"
  temp_dir="/tmp/${app}_extract"

  if command -v gh &> /dev/null; then
    gh release download "$tag" --repo "$repo" -p "$asset" -O "$temp_zip"
  else
    url="https://github.com/$repo/releases/download/$tag/$asset"
    curl -L -s -o "$temp_zip" "$url"
  fi

  mkdir -p "$temp_dir"
  unzip -q -o "$temp_zip" -d "$temp_dir"

  # If single root dir in zip, copy contents
  subdirs=("$temp_dir"/*)
  if [ "${#subdirs[@]}" -eq 1 ] && [ -d "${subdirs[0]}" ]; then
    cp -r "${subdirs[0]}"/* "$dest/"
  else
    cp -r "$temp_dir"/* "$dest/"
  fi

  rm -rf "$temp_dir" "$temp_zip"
  echo "✔ [$app] instalado com sucesso!"
done

echo "✨ Todas as aplicações foram baixadas e organizadas!"
