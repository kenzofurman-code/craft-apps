// Cross-platform Node.js downloader for Craft Apps WebAssembly builds
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const APPS_DIR = path.join(__dirname, "..", "public", "apps");
if (!fs.existsSync(APPS_DIR)) {
  fs.mkdirSync(APPS_DIR, { recursive: true });
}

const CATALOG = {
  "cadcraft": { repo: "storytold/cadcraft", tag: "v0.20.1", asset: "cadcraft-web-0.20.1.zip" },
  "solidcraft": { repo: "tangency-labs/solidcraft", tag: "v0.40.1", asset: "solidcraft-web-0.40.1.zip" },
  "gridcraft": { repo: "storytold/gridcraft", tag: "v0.19.1", asset: "gridcraft-web-0.19.1.zip" },
  "craft-anything": { repo: "storytold/craft-anything", tag: "v0.6.1", asset: "craft-anything-web-0.6.1.zip" },
  "photocraft": { repo: "storytold/photocraft", tag: "v0.23.1", asset: "photocraft-web-0.23.1.zip" },
  "vectorcraft": { repo: "storytold/vectorcraft", tag: "v0.24.1", asset: "vectorcraft-web-0.24.1.zip" },
  "designcraft": { repo: "storytold/designcraft", tag: "v0.20.1", asset: "designcraft-web-0.20.1.zip" },
  "deckcraft": { repo: "storytold/deckcraft", tag: "v0.18.1", asset: "deckcraft-web-0.18.1.zip" },
  "figcraft": { repo: "storytold/figcraft", tag: "v0.18.1", asset: "figcraft-web-0.18.1.zip" },
  "filmcraft": { repo: "storytold/filmcraft", tag: "v0.20.1", asset: "filmcraft-web-0.20.1.zip" },
  "effectcraft": { repo: "storytold/effectcraft", tag: "v0.24.1", asset: "effectcraft-web-0.24.1.zip" },
  "wordcraft": { repo: "storytold/wordcraft", tag: "v0.18.1", asset: "wordcraft-web-0.18.1.zip" },
  "soundcraft": { repo: "storytold/soundcraft", tag: "v0.20.1", asset: "soundcraft-web-0.20.1.zip" },
  "lightcraft": { repo: "storytold/lightcraft", tag: "v0.21.1", asset: "lightcraft-web-0.21.1.zip" },
  "pdfcraft": { repo: "storytold/pdfcraft", tag: "v0.21.1", asset: "pdfcraft-web-0.21.1.zip" },
  "materialcraft": { repo: "storytold/materialcraft", tag: "v0.4.1", asset: "materialcraft-web-0.4.1.zip" },
  "texturecraft": { repo: "storytold/texturecraft", tag: "v0.6.1", asset: "texturecraft-web-0.6.1.zip" }
};

console.log("🎨 Craft Apps Downloader (WebAssembly Builds)");
console.log("=============================================");

for (const [appId, info] of Object.entries(CATALOG)) {
  const dest = path.join(APPS_DIR, appId);
  if (fs.existsSync(path.join(dest, "index.html"))) {
    console.log(`✔ [${appId}] já está baixado e pronto em ${dest}`);
    continue;
  }

  console.log(`⬇ Baixando ${appId} (${info.asset} de ${info.repo})...`);
  const zipPath = path.join(APPS_DIR, `${appId}.zip`);
  const tempExtract = path.join(APPS_DIR, `${appId}_temp`);

  try {
    execSync(`gh release download ${info.tag} --repo ${info.repo} -p "${info.asset}" -O "${zipPath}"`, { stdio: "inherit" });

    if (process.platform === "win32") {
      execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${tempExtract}' -Force"`, { stdio: "inherit" });
    } else {
      execSync(`unzip -q -o "${zipPath}" -d "${tempExtract}"`, { stdio: "inherit" });
    }

    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

    // Copy files
    const entries = fs.readdirSync(tempExtract);
    let sourceDir = tempExtract;
    if (entries.length === 1 && fs.statSync(path.join(tempExtract, entries[0])).isDirectory()) {
      sourceDir = path.join(tempExtract, entries[0]);
    }

    if (process.platform === "win32") {
      execSync(`powershell -Command "Copy-Item -Path '${sourceDir}\\*' -Destination '${dest}' -Recurse -Force"`);
      execSync(`powershell -Command "Remove-Item -Recurse -Force '${tempExtract}'; Remove-Item -Force '${zipPath}'"`);
    } else {
      execSync(`cp -r "${sourceDir}"/* "${dest}/"`);
      execSync(`rm -rf "${tempExtract}" "${zipPath}"`);
    }

    console.log(`✔ [${appId}] instalado com sucesso!`);
  } catch (err) {
    console.error(`❌ Erro ao baixar ${appId}:`, err.message);
  }
}

console.log("\n✨ Todos os aplicativos foram verificados!");
