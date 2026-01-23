const listEl = document.getElementById("projectsList");
const formEl = document.getElementById("projectForm");
const nameEl = document.getElementById("projectName");
const msgEl = document.getElementById("message");
const refreshBtn = document.getElementById("refreshBtn");

function setMessage(text, type = "info") {
  msgEl.className = "message";
  if (type === "ok") msgEl.classList.add("message--ok");
  if (type === "err") msgEl.classList.add("message--err");
  msgEl.textContent = text || "";
}

function formatDate(iso) {
  if (!iso) return "";
  return iso.replace("T", " ").slice(0, 16);
}

function renderProjects(projects) {
  if (!projects || projects.length === 0) {
    listEl.innerHTML = `<div class="item">
      <div class="item__left">
        <p class="item__title">Brak projektów</p>
        <p class="item__meta">Dodaj pierwszy projekt powyżej.</p>
      </div>
    </div>`;
    return;
  }

  listEl.innerHTML = projects
    .map(
      (p) => `
      <div class="item">
        <div class="item__left">
          <p class="item__title">
            <a class="link" href="/project.html?id=${p.id}">${escapeHtml(p.name)}</a>
          </p>
          <p class="item__meta">Utworzono: ${formatDate(p.created_at)}</p>
        </div>
        <div class="item__actions">
          <a class="btn btn--ghost" href="/project.html?id=${p.id}">Zadania</a>
          <button class="btn btn--danger" data-del="${p.id}">Usuń</button>
        </div>
      </div>
    `
    )
    .join("");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadProjects() {
  setMessage("");
  try {
    const projects = await apiFetch("/api/projects");
    renderProjects(projects);
  } catch (e) {
    console.error(e);
    setMessage("Nie udało się pobrać projektów.", "err");
  }
}

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMessage("");

  const name = nameEl.value.trim();
  if (name.length < 2) {
    setMessage("Nazwa musi mieć min. 2 znaki.", "err");
    return;
  }

  try {
    await apiFetch("/api/projects", {
      method: "POST",
      body: JSON.stringify({ name }),
    });

    nameEl.value = "";
    setMessage("Projekt dodany ✅", "ok");
    await loadProjects();
  } catch (e) {
    console.error(e);
    const msg =
      e?.data?.errors?.[0]?.msg ||
      e?.data?.error ||
      "Nie udało się dodać projektu.";
    setMessage(msg, "err");
  }
});

listEl.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-del]");
  if (!btn) return;

  const id = btn.getAttribute("data-del");
  if (!confirm(`Usunąć projekt ID=${id}? (usunie też zadania)`)) return;

  try {
    await apiFetch(`/api/projects/${id}`, { method: "DELETE" });
    setMessage("Projekt usunięty ✅", "ok");
    await loadProjects();
  } catch (e) {
    console.error(e);
    const msg = e?.data?.error || "Nie udało się usunąć projektu.";
    setMessage(msg, "err");
  }
});

refreshBtn.addEventListener("click", loadProjects);

// start
loadProjects();
