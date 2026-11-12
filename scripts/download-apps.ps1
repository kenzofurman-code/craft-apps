# PowerShell Downloader for all Craft Apps WebAssembly builds
param (
    [string[]]$Apps = @(
        "cadcraft",
        "solidcraft",
        "gridcraft",
        "craft-anything",
        "photocraft",
        "vectorcraft",
        "designcraft",
        "deckcraft",
        "figcraft",
        "filmcraft",
        "effectcraft",
        "wordcraft",
        "soundcraft",
        "lightcraft",
        "pdfcraft",
        "materialcraft",
        "texturecraft"
    )
)

$baseDir = Split-Path -Parent $PSScriptRoot
$appsDir = Join-Path $baseDir "public\apps"

if (-not (Test-Path $appsDir)) {
    New-Item -ItemType Directory -Path $appsDir -Force | Out-Null
}

$catalog = @{
    "cadcraft"        = @{ repo = "storytold/cadcraft"; tag = "v0.20.1"; asset = "cadcraft-web-0.20.1.zip" }
    "solidcraft"      = @{ repo = "tangency-labs/solidcraft"; tag = "v0.40.1"; asset = "solidcraft-web-0.40.1.zip" }
    "gridcraft"       = @{ repo = "storytold/gridcraft"; tag = "v0.19.1"; asset = "gridcraft-web-0.19.1.zip" }
    "craft-anything"  = @{ repo = "storytold/craft-anything"; tag = "v0.6.1"; asset = "craft-anything-web-0.6.1.zip" }
    "photocraft"      = @{ repo = "storytold/photocraft"; tag = "v0.23.1"; asset = "photocraft-web-0.23.1.zip" }
    "vectorcraft"     = @{ repo = "storytold/vectorcraft"; tag = "v0.24.1"; asset = "vectorcraft-web-0.24.1.zip" }
    "designcraft"     = @{ repo = "storytold/designcraft"; tag = "v0.20.1"; asset = "designcraft-web-0.20.1.zip" }
    "deckcraft"       = @{ repo = "storytold/deckcraft"; tag = "v0.18.1"; asset = "deckcraft-web-0.18.1.zip" }
    "figcraft"        = @{ repo = "storytold/figcraft"; tag = "v0.18.1"; asset = "figcraft-web-0.18.1.zip" }
    "filmcraft"       = @{ repo = "storytold/filmcraft"; tag = "v0.20.1"; asset = "filmcraft-web-0.20.1.zip" }
    "effectcraft"     = @{ repo = "storytold/effectcraft"; tag = "v0.24.1"; asset = "effectcraft-web-0.24.1.zip" }
    "wordcraft"       = @{ repo = "storytold/wordcraft"; tag = "v0.18.1"; asset = "wordcraft-web-0.18.1.zip" }
    "soundcraft"      = @{ repo = "storytold/soundcraft"; tag = "v0.20.1"; asset = "soundcraft-web-0.20.1.zip" }
    "lightcraft"      = @{ repo = "storytold/lightcraft"; tag = "v0.21.1"; asset = "lightcraft-web-0.21.1.zip" }
    "pdfcraft"        = @{ repo = "storytold/pdfcraft"; tag = "v0.21.1"; asset = "pdfcraft-web-0.21.1.zip" }
    "materialcraft"   = @{ repo = "storytold/materialcraft"; tag = "v0.4.1"; asset = "materialcraft-web-0.4.1.zip" }
    "texturecraft"    = @{ repo = "storytold/texturecraft"; tag = "v0.6.1"; asset = "texturecraft-web-0.6.1.zip" }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "📦 Baixando e extraindo WebAssembly das Craft Apps..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

foreach ($appId in $Apps) {
    if (-not $catalog.ContainsKey($appId)) {
        Write-Warning "App '$appId' não encontrado no catálogo."
        continue
    }

    $info = $catalog[$appId]
    $destFolder = Join-Path $appsDir $appId
    $zipDest = Join-Path $appsDir "$appId.zip"
    $tempExtract = Join-Path $appsDir "${appId}_temp"

    if ((Test-Path (Join-Path $destFolder "index.html"))) {
        Write-Host "✔ [$appId] já está instalado em $destFolder" -ForegroundColor Green
        continue
    }

    Write-Host "⬇ Baixando $($info.asset) de $($info.repo)..." -ForegroundColor Yellow
    try {
        gh release download $info.tag --repo $info.repo -p $info.asset -O $zipDest
        if (Test-Path $zipDest) {
            Write-Host "📂 Extraindo $appId..." -ForegroundColor Gray
            New-Item -ItemType Directory -Path $tempExtract -Force | Out-Null
            Expand-Archive -Path $zipDest -DestinationPath $tempExtract -Force

            New-Item -ItemType Directory -Path $destFolder -Force | Out-Null
            # Check if there is an inner subfolder or files directly
            $innerDirs = Get-ChildItem -Directory $tempExtract
            if ($innerDirs.Count -eq 1) {
                Copy-Item -Path "$($innerDirs[0].FullName)\*" -Destination $destFolder -Recurse -Force
            } else {
                Copy-Item -Path "$tempExtract\*" -Destination $destFolder -Recurse -Force
            }

            Remove-Item -Recurse -Force $tempExtract -ErrorAction SilentlyContinue
            Remove-Item -Force $zipDest -ErrorAction SilentlyContinue
            Write-Host "✔ [$appId] instalado com sucesso!" -ForegroundColor Green
        }
    } catch {
        Write-Error "❌ Falha ao baixar ${appId}: $_"
    }
}

Write-Host "`n✨ Concluído! Todas as aplicações web solicitadas foram configuradas." -ForegroundColor Cyan
