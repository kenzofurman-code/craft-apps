import { APPS_CATALOG } from "./catalog.js";

// State
let currentApps = [...APPS_CATALOG];
let viewMode = localStorage.getItem("craft_view_mode") || "grid";
let currentSort = "name_asc";
let searchQuery = "";
let currentAppId = null;

// DOM Elements
const installedGridEl = document.getElementById("installed-grid");
const notInstalledGridEl = document.getElementById("not-installed-grid");
const tableContainerEl = document.getElementById("table-container");
const searchInputEl = document.getElementById("search-input");
const sortSelectEl = document.getElementById("sort-select");
const viewGridBtnEl = document.getElementById("view-grid-btn");
const viewTableBtnEl = document.getElementById("view-table-btn");
const themeToggleBtnEl = document.getElementById("theme-toggle-btn");
const updateBannerEl = document.getElementById("update-banner");
const dismissBannerBtnEl = document.getElementById("dismiss-banner-btn");
const btnUpdateAllEl = document.getElementById("btn-update-all");
const btnUpdateRestartEl = document.getElementById("btn-update-restart");
const btnRefreshSuiteEl = document.getElementById("btn-refresh-suite");

// Restore saved updates from localStorage
function initPersistedState() {
  const updatedApps = JSON.parse(localStorage.getItem("craft_updated_apps") || "[]");
  currentApps = currentApps.map((app) => {
    if (updatedApps.includes(app.id)) {
      return {
        ...app,
        installed: true,
        installedVersion: app.latestVersion,
        updateAvailable: false
      };
    }
    return app;
  });

  const bannerDismissed = localStorage.getItem("craft_banner_updated") === "true";
  if (bannerDismissed && updateBannerEl) {
    updateBannerEl.style.display = "none";
  }
}

// Switcher Elements
const viewportContainerEl = document.getElementById("app-viewport-container");
const btnBackCatalogEl = document.getElementById("btn-back-catalog");
const switcherAppIconEl = document.getElementById("switcher-app-icon");
const switcherAppNameEl = document.getElementById("switcher-app-name");
const appSelectorSelectEl = document.getElementById("app-selector-select");
const appIframeEl = document.getElementById("app-iframe");
const appLoadingScreenEl = document.getElementById("app-loading-screen");
const loadingAppTitleEl = document.getElementById("loading-app-title");
const btnFullscreenEl = document.getElementById("btn-fullscreen");
const btnReloadEl = document.getElementById("btn-reload");
const btnNewTabEl = document.getElementById("btn-new-tab");

// Theme init
function initTheme() {
  const saved = localStorage.getItem("craft_theme") || "light";
  document.documentElement.dataset.theme = saved;
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = current;
  localStorage.setItem("craft_theme", current);
  updateThemeIcon(current);
}

function updateThemeIcon(theme) {
  if (themeToggleBtnEl) {
    themeToggleBtnEl.innerHTML = theme === "dark" ? "☀️" : "🌙";
    themeToggleBtnEl.title = theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro";
  }
}

// Sorting & Filtering
function sortApps(apps, sortType) {
  const list = [...apps];
  switch (sortType) {
    case "name_asc":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case "name_desc":
      return list.sort((a, b) => b.name.localeCompare(a.name));
    case "category":
      return list.sort((a, b) => a.category.localeCompare(b.category));
    case "updated":
      return list.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
    default:
      return list;
  }
}

function filterApps(apps, query) {
  if (!query) return apps;
  const q = query.toLowerCase();
  return apps.filter(
    (app) =>
      app.name.toLowerCase().includes(q) ||
      app.subtitle.toLowerCase().includes(q) ||
      app.description.toLowerCase().includes(q) ||
      app.category.toLowerCase().includes(q) ||
      (app.inspiredBy && app.inspiredBy.toLowerCase().includes(q))
  );
}

// Render Cards
function createCardHtml(app) {
  const isInstalled = app.installed;
  const updateAvailable = app.updateAvailable;

  let statusBadgeHtml = "";
  if (updateAvailable) {
    statusBadgeHtml = `<span class="card-status-badge update">UPDATE AVAILABLE</span>`;
  } else if (isInstalled) {
    statusBadgeHtml = `<span class="card-status-badge installed">INSTALLED</span>`;
  } else {
    statusBadgeHtml = `<span class="card-status-badge available">AVAILABLE TO INSTALL</span>`;
  }

  let actionsHtml = "";
  if (isInstalled) {
    actionsHtml = `
      <button class="btn-open" data-open="${app.id}">
        <span>OPEN ${app.installedVersion || app.latestVersion}</span>
      </button>
      ${
        updateAvailable
          ? `<button class="btn-update" data-update="${app.id}">UPDATE TO ${app.latestVersion}</button>`
          : ""
      }
      <button class="btn-more" title="Mais opções">⋯</button>
    `;
  } else {
    actionsHtml = `
      <button class="btn-install" data-open="${app.id}">
        <span>INSTALL / ABRIR WEB</span>
      </button>
      <button class="btn-more" title="Mais opções">⋯</button>
    `;
  }

  const topMeta = `
    <div class="card-top-meta">
      <span>${app.latestVersion}</span>
      <a href="${app.repoUrl}" target="_blank" rel="noopener noreferrer">GITHUB ↗</a>
    </div>
  `;

  return `
    <div class="app-card" data-app-id="${app.id}">
      ${topMeta}
      <div class="card-header">
        <img class="app-icon" src="${app.icon}" alt="${app.name} icon" loading="lazy">
        <div class="app-identity">
          <div class="app-title-row">
            <h3 class="app-title">${app.name}</h3>
            <span class="app-author">BY ${app.by}</span>
          </div>
          <div class="app-subtitle">${app.subtitle}</div>
        </div>
      </div>
      ${statusBadgeHtml}
      <p class="app-desc">${app.description}</p>
      <div class="card-meta">
        <span>Last updated: ${app.lastUpdated}</span>
        ${app.inspiredBy ? `<span title="Equivalente">${app.inspiredBy}</span>` : ""}
      </div>
      <div class="card-actions">
        ${actionsHtml}
      </div>
    </div>
  `;
}

// Render Table
function renderTableView(apps) {
  let rows = apps
    .map(
      (app) => `
    <tr>
      <td>
        <div class="table-app-cell">
          <img class="table-app-icon" src="${app.icon}" alt="">
          <div>
            <strong>${app.name}</strong>
            <div style="font-size:11px;color:var(--muted)">BY ${app.by}</div>
          </div>
        </div>
      </td>
      <td>${app.subtitle}</td>
      <td><span class="app-author">${app.category}</span></td>
      <td><code>${app.latestVersion}</code></td>
      <td>${app.installed ? '<span style="color:var(--good);font-weight:600">Sim</span>' : '<span style="color:var(--muted)">Web</span>'}</td>
      <td>
        <button class="btn-open" style="height:26px;padding:0 10px;" data-open="${app.id}">
          ABRIR WEB
        </button>
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <table class="apps-table">
      <thead>
        <tr>
          <th>Aplicativo</th>
          <th>Função</th>
          <th>Categoria</th>
          <th>Versão</th>
          <th>Local</th>
          <th>Ação</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function updateToolbarBadge() {
  const pendingUpdates = currentApps.filter((a) => a.updateAvailable).length;
  if (btnUpdateAllEl) {
    if (pendingUpdates > 0) {
      btnUpdateAllEl.style.display = "flex";
      btnUpdateAllEl.textContent = `UPDATE ALL (${pendingUpdates})`;
    } else {
      btnUpdateAllEl.style.display = "none";
    }
  }
}

function performUpdate(appId) {
  const app = currentApps.find((a) => a.id === appId);
  if (!app) return;

  const btn = document.querySelector(`[data-update="${appId}"]`);
  if (btn) {
    btn.disabled = true;
    btn.textContent = "UPDATING...";
  }

  setTimeout(() => {
    app.installed = true;
    app.installedVersion = app.latestVersion;
    app.updateAvailable = false;

    // Persist
    const updatedApps = JSON.parse(localStorage.getItem("craft_updated_apps") || "[]");
    if (!updatedApps.includes(appId)) {
      updatedApps.push(appId);
      localStorage.setItem("craft_updated_apps", JSON.stringify(updatedApps));
    }

    render();
    updateToolbarBadge();
  }, 400);
}

function updateAllApps() {
  if (btnUpdateAllEl) {
    btnUpdateAllEl.disabled = true;
    btnUpdateAllEl.textContent = "UPDATING ALL...";
  }

  setTimeout(() => {
    const updatedApps = JSON.parse(localStorage.getItem("craft_updated_apps") || "[]");
    currentApps.forEach((app) => {
      if (app.updateAvailable) {
        app.installed = true;
        app.installedVersion = app.latestVersion;
        app.updateAvailable = false;
        if (!updatedApps.includes(app.id)) updatedApps.push(app.id);
      }
    });

    localStorage.setItem("craft_updated_apps", JSON.stringify(updatedApps));
    render();
    updateToolbarBadge();
  }, 600);
}

function render() {
  const filtered = filterApps(currentApps, searchQuery);
  const sorted = sortApps(filtered, currentSort);

  if (viewMode === "table") {
    installedGridEl.style.display = "none";
    notInstalledGridEl.style.display = "none";
    document.querySelectorAll(".section-title").forEach((el) => (el.style.display = "none"));
    tableContainerEl.style.display = "block";
    tableContainerEl.innerHTML = renderTableView(sorted);
  } else {
    tableContainerEl.style.display = "none";

    const installed = sorted.filter((a) => a.installed);
    const notInstalled = sorted.filter((a) => !a.installed);

    const installedTitleEl = document.getElementById("installed-title");
    const notInstalledTitleEl = document.getElementById("not-installed-title");

    if (installedTitleEl) {
      installedTitleEl.style.display = installed.length > 0 ? "block" : "none";
      installedTitleEl.textContent = notInstalled.length === 0 ? `INSTALLED (${installed.length})` : "INSTALLED";
    }

    if (notInstalledTitleEl) {
      notInstalledTitleEl.style.display = notInstalled.length > 0 ? "block" : "none";
    }

    installedGridEl.style.display = installed.length > 0 ? "grid" : "none";
    notInstalledGridEl.style.display = notInstalled.length > 0 ? "grid" : "none";

    installedGridEl.innerHTML = installed.map(createCardHtml).join("");
    notInstalledGridEl.innerHTML = notInstalled.map(createCardHtml).join("");
  }

  updateToolbarBadge();
  attachCardEvents();
}

function attachCardEvents() {
  document.querySelectorAll("[data-open]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-open");
      launchApp(id);
    };
  });

  document.querySelectorAll("[data-update]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-update");
      performUpdate(id);
    };
  });
}

// App Runner & Multi-App Switcher
function populateSwitcherDropdown() {
  appSelectorSelectEl.innerHTML = APPS_CATALOG.map(
    (app) => `
    <option value="${app.id}" ${app.id === currentAppId ? "selected" : ""}>
      ${app.name} (${app.category})
    </option>
  `
  ).join("");
}

export function launchApp(appId) {
  const app = APPS_CATALOG.find((a) => a.id === appId);
  if (!app) return;

  currentAppId = appId;
  populateSwitcherDropdown();

  switcherAppIconEl.src = app.icon;
  switcherAppNameEl.textContent = app.name;
  loadingAppTitleEl.textContent = `Iniciando ${app.name} (WebAssembly)...`;

  appLoadingScreenEl.classList.remove("hidden");
  viewportContainerEl.classList.add("active");

  // Determine path
  const targetUrl = app.webPath;
  appIframeEl.src = targetUrl;

  // Loading screen timeout fallback
  setTimeout(() => {
    appLoadingScreenEl.classList.add("hidden");
  }, 1200);

  // Update hash
  window.location.hash = `app=${appId}`;
}

export function closeApp() {
  viewportContainerEl.classList.remove("active");
  appIframeEl.src = "about:blank";
  currentAppId = null;
  history.replaceState(null, null, " ");
}

// Event Listeners
function setupEvents() {
  if (themeToggleBtnEl) {
    themeToggleBtnEl.onclick = toggleTheme;
  }

  if (dismissBannerBtnEl && updateBannerEl) {
    dismissBannerBtnEl.onclick = () => {
      updateBannerEl.style.display = "none";
    };
  }

  if (searchInputEl) {
    searchInputEl.oninput = (e) => {
      searchQuery = e.target.value;
      render();
    };
  }

  if (sortSelectEl) {
    sortSelectEl.onchange = (e) => {
      currentSort = e.target.value;
      render();
    };
  }

  if (viewGridBtnEl && viewTableBtnEl) {
    viewGridBtnEl.onclick = () => {
      viewMode = "grid";
      viewGridBtnEl.classList.add("active");
      viewTableBtnEl.classList.remove("active");
      localStorage.setItem("craft_view_mode", "grid");
      render();
    };
    viewTableBtnEl.onclick = () => {
      viewMode = "table";
      viewTableBtnEl.classList.add("active");
      viewGridBtnEl.classList.remove("active");
      localStorage.setItem("craft_view_mode", "table");
      render();
    };
  }

  // Switcher topbar events
  if (btnBackCatalogEl) {
    btnBackCatalogEl.onclick = closeApp;
  }

  if (appSelectorSelectEl) {
    appSelectorSelectEl.onchange = (e) => {
      launchApp(e.target.value);
    };
  }

  if (btnReloadEl) {
    btnReloadEl.onclick = () => {
      if (appIframeEl && appIframeEl.src) {
        appLoadingScreenEl.classList.remove("hidden");
        appIframeEl.src = appIframeEl.src;
        setTimeout(() => appLoadingScreenEl.classList.add("hidden"), 1000);
      }
    };
  }

  if (btnFullscreenEl) {
    btnFullscreenEl.onclick = () => {
      if (!document.fullscreenElement) {
        viewportContainerEl.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    };
  }

  if (btnNewTabEl) {
    btnNewTabEl.onclick = () => {
      if (currentAppId) {
        const app = APPS_CATALOG.find((a) => a.id === currentAppId);
        if (app) window.open(app.webPath, "_blank");
      }
    };
  }

  if (btnUpdateAllEl) {
    btnUpdateAllEl.onclick = updateAllApps;
  }

  if (btnUpdateRestartEl && updateBannerEl) {
    btnUpdateRestartEl.onclick = () => {
      btnUpdateRestartEl.disabled = true;
      btnUpdateRestartEl.textContent = "UPDATING...";
      setTimeout(() => {
        localStorage.setItem("craft_banner_updated", "true");
        updateBannerEl.style.display = "none";
      }, 500);
    };
  }

  if (btnRefreshSuiteEl) {
    btnRefreshSuiteEl.onclick = () => {
      btnRefreshSuiteEl.style.transform = "rotate(360deg)";
      btnRefreshSuiteEl.style.transition = "transform 0.5s ease";
      setTimeout(() => {
        btnRefreshSuiteEl.style.transform = "none";
        render();
      }, 500);
    };
  }

  // Handle URL hash on load (e.g. #app=cadcraft)
  window.addEventListener("hashchange", checkHash);
}

function checkHash() {
  const match = window.location.hash.match(/app=([a-z0-9-]+)/);
  if (match && match[1]) {
    launchApp(match[1]);
  }
}

// Init
initTheme();
initPersistedState();
setupEvents();
render();
checkHash();
