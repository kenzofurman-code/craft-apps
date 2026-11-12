# 🎨 Craft Apps Suite — WebAssembly Portal & Multi-App Switcher

<p align="center">
  <b>Portal Web unificado com seletor interativo para a suíte completa de aplicativos ArtCraft / Storytold em WebAssembly puro.</b><br>
  CADCraft, SolidCraft, GridCraft, PhotoCraft, VectorCraft, DesignCraft, FigCraft, FilmCraft, DeckCraft, WordCraft e muito mais rodando 100% no navegador via Rust + WebAssembly (Wasm) + WebGPU / WebGL2.
</p>

---

## 📸 Interface Fiel ao ArtCraft Launcher

O portal reproduz pixel por pixel a interface original do **ArtCraft Launcher**:
- **Design System Autêntico**: Tipografias *Archivo*, *Inter* e *Geist Mono*, paleta claro/escuro nativa, bordas precisas e badges de status.
- **Seção Instalados vs Disponíveis**: Exibição prioritária de aplicativos instalados localmente no servidor e catálogo completo para uso web.
- **Seletor de Aplicativos (Multi-App Switcher)**: Ao abrir qualquer aplicação, uma barra superior elegante permite alternar instantaneamente entre CADCraft, SolidCraft, GridCraft, FigCraft, etc., sem perder o contexto e sem recarregar o portal.
- **Filtros e Busca**: Busca em tempo real por nome, categoria ou aplicativo comercial equivalente, além de ordenação por nome e atualização.
- **Modos de Exibição**: Alternância entre visualização em Grade (*Grid*) e Tabela (*Table/List*).

---

## 🚀 Arquitetura & Como Funciona o WebAssembly

Cada aplicativo da suíte Storytold / ArtCraft é desenvolvido em **100% Rust puro**:
1. **Frontend & Interface**: Construído sobre `egui` (Immediate Mode GUI em Rust) e compilado para o navegador através de `wasm-bindgen` e `Trunk / eframe`.
2. **Motor Gráfico**: Utiliza `wgpu` para renderização acelerada por hardware via **WebGPU** moderna, com fallback transparente para **WebGL2**.
3. **Execução 100% Client-Side**: O arquivo `.wasm` é baixado pelo navegador do usuário e executado diretamente pelo processador e GPU locais. **O servidor/VPS tem custo de CPU e memória praticamente zero**, servindo apenas os arquivos estáticos!
4. **Privacidade Total**: Desenhos CAD, planilhas, modelos 3D e fotos são processados na memória do navegador do visitante, sem serem enviados para nenhum backend.

---

## 📂 Os 17 Aplicativos da Suíte Craft

| Aplicativo | Categoria | Equivalente Comercial | Repositório Oficial | Versão Wasm |
| :--- | :--- | :--- | :--- | :--- |
| **CADCraft** | CAD 2D/3D & Desenho Técnico | AutoCAD / Civil 3D | [storytold/cadcraft](https://github.com/storytold/cadcraft) | `v0.20.1` |
| **SolidCraft** | CAD 3D Paramétrico | SolidWorks / Fusion 360 | [tangency-labs/solidcraft](https://github.com/tangency-labs/solidcraft) | `v0.40.1` |
| **GridCraft** | Planilhas e Dados | Microsoft Excel | [storytold/gridcraft](https://github.com/storytold/gridcraft) | `v0.19.1` |
| **FigCraft** | UI/UX & Prototipagem | Figma | [storytold/figcraft](https://github.com/storytold/figcraft) | `v0.18.1` |
| **PhotoCraft** | Editor de Fotos & Pintura | Adobe Photoshop | [storytold/photocraft](https://github.com/storytold/photocraft) | `v0.23.1` |
| **VectorCraft** | Ilustração Vetorial | Adobe Illustrator | [storytold/vectorcraft](https://github.com/storytold/vectorcraft) | `v0.24.1` |
| **DesignCraft** | Diagramação & Editoração | Adobe InDesign | [storytold/designcraft](https://github.com/storytold/designcraft) | `v0.20.1` |
| **DeckCraft** | Apresentações e Slides | Microsoft PowerPoint | [storytold/deckcraft](https://github.com/storytold/deckcraft) | `v0.18.1` |
| **WordCraft** | Processador de Texto | Microsoft Word | [storytold/wordcraft](https://github.com/storytold/wordcraft) | `v0.18.1` |
| **FilmCraft** | Edição de Vídeo Não-Linear | Adobe Premiere Pro | [storytold/filmcraft](https://github.com/storytold/filmcraft) | `v0.20.1` |
| **EffectCraft** | Motion Graphics & Efeitos VFX | Adobe After Effects | [storytold/effectcraft](https://github.com/storytold/effectcraft) | `v0.24.1` |
| **LightCraft** | Revelação RAW & Catálogo | Adobe Lightroom | [storytold/lightcraft](https://github.com/storytold/lightcraft) | `v0.21.1` |
| **PdfCraft** | Visualizador e Editor de PDF | Adobe Acrobat Pro | [storytold/pdfcraft](https://github.com/storytold/pdfcraft) | `v0.21.1` |
| **SoundCraft** | Estação de Áudio Digital (DAW) | Pro Tools / Audition | [storytold/soundcraft](https://github.com/storytold/soundcraft) | `v0.20.1` |
| **TextureCraft** | Pintura de Texturas 3D | Substance 3D Painter | [storytold/texturecraft](https://github.com/storytold/texturecraft) | `v0.6.1` |
| **MaterialCraft** | Materiais Procedurais por Nós | Substance 3D Designer | [storytold/materialcraft](https://github.com/storytold/materialcraft) | `v0.4.1` |
| **Craft Anything** | Engenharia Reversa de Software | Ghidra / Web Inspector | [storytold/craft-anything](https://github.com/storytold/craft-anything) | `v0.6.1` |

---

## 🛠️ Como Executar Localmente

Você pode iniciar o portal instantaneamente em seu computador:

```bash
# 1. Entre no diretório do projeto
cd c:/Users/HomePC/Documents/GITHUBS/craft-apps

# 2. Inicie o servidor estático (requer apenas Node.js instalado)
npm start
# ou: node server.js
```

Abra em seu navegador: **`http://localhost:8080`**

---

## 📦 Como Baixar Todos os Aplicativos Web (Download dos Wasm)

O portal já vem com as versões web funcionais de **CADCraft**, **SolidCraft**, **GridCraft** e **Craft Anything**.

Para baixar automaticamente todas as 17 aplicações da suíte diretamente das releases do GitHub para o seu portal:

### No Windows (PowerShell):
```powershell
.\scripts\download-apps.ps1
```

### No Linux / Mac / VPS (Bash):
```bash
bash scripts/download-apps.sh
```

### Ou via Node.js (Cross-Platform):
```bash
npm run download:all
```

Os arquivos serão descompactados organizadamente dentro de `public/apps/<id>/`.

---

## 🌐 Implantação na VPS (Deploy em 1 Minuto com Docker)

O projeto está configurado com `Dockerfile` e `docker-compose.yml` otimizados para Nginx:
- Suporte a MIME Type `application/wasm` nativo (obrigatório para compilação em streaming nos navegadores modernos).
- Compressão gzip e Brotli para carregar os binários `.wasm` em alta velocidade.
- Headers de segurança e Cross-Origin Isolation para habilitar **WebGPU** e aceleração de canvas.

### Passo a passo para rodar na sua VPS:

```bash
# 1. Clone seu repositório na VPS
git clone https://github.com/kenzofurman-code/craft-apps.git
cd craft-apps

# 2. (Opcional) Baixe todos os pacotes Wasm
bash scripts/download-apps.sh

# 3. Suba o container com Docker Compose
docker compose up -d --build
```

Acesse via IP da sua VPS ou conecte o seu domínio (com Nginx Proxy Manager, Traefik ou Cloudflare) apontando para a porta `8080`!

---

## 🔄 Publicação no GitHub

Para publicar no seu GitHub (`kenzofurman-code/craft-apps`):

```bash
cd c:/Users/HomePC/Documents/GITHUBS/craft-apps
git init
git add .
git commit -m "feat: ArtCraft / Storytold WebAssembly portal with multi-app switcher"
gh repo create kenzofurman-code/craft-apps --public --source=. --remote=origin --push
```

---

## 📜 Licença e Créditos

- Portal e orquestrador desenvolvidos sob licença MIT.
- Os aplicativos da suíte Craft são desenvolvidos pela equipe **ArtCraft / Storytold** e **Tangency Labs**, sob licenças MIT / Apache-2.0.
- Ícones oficiais fornecidos pelos respectivos repositórios.
