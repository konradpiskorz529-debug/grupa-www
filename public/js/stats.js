const refreshBtn = document.getElementById("refreshBtn");
const msgEl = document.getElementById("message");
const summaryEl = document.getElementById("summary");

const allCountEl = document.getElementById("allCount");
const todoCountEl = document.getElementById("todoCount");
const doingCountEl = document.getElementById("doingCount");
const doneCountEl = document.getElementById("doneCount");

const perProjectEl = document.getElementById("perProject");

function setMessage(text, type = "info") {
  msgEl.className = "message";
  if (type === "ok") msgEl.classList.add("message--ok");
  if (type === "err") msgEl.classList.add("message--err");
  msgEl.textContent = text || "";
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function countStatuses(tasks) {
  const c = { all: 0, todo: 0, doing: 0, done: 0 };
  for (const t of tasks) {
    c.all += 1;
    if (t.status === "todo") c.todo += 1;
    else if (t.status === "doing") c.doing += 1;
    else if (t.status === "done") c.done += 1;
  }
  return c;
}

function renderGlobal(global) {
  allCountEl.textContent = global.all;
  todoCountEl.textContent = global.todo;
  doingCountEl.textContent = global.doing;
  doneCountEl.textContent = global.done;
}

function renderPerProject(items) {
  if (items.length === 0) {
    perProjectEl.innerHTML = `<div class="item">
      <div class="item__left">
        <p class="item__title">Brak projektów</p>
        <p class="item__meta">Dodaj projekt na stronie “Projekty”.</p>
      </div>
    </div>`;
    return;
  }

  perProjectEl.innerHTML = items
    .map((it) => {
      const p = it.project;
      const c = it.counts;
      return `
      <div class="item">
        <div class="item__left">
          <p class="item__title">
            <a class="link" href="/project.html?id=${p.id}">${escapeHtml(p.name)}</a>
          </p>
          <p class="item__meta">
            Wszystkie: ${c.all} • todo: ${c.todo} • doing: ${c.doing} • done: ${c.done}
          </p>
        </div>
        <div class="item__actions">
          <a class="btn btn--ghost" href="/project.html?id=${p.id}">Otwórz</a>
        </div>
      </div>
    `;
    })
    .join("");
}

async function loadStats() {
  setMessage("");
  summaryEl.textContent = "Ładowanie...";

  try {
    const projects = await apiFetch("/api/projects");

    // pobierz tasks dla każdego projektu 
    const results = await Promise.all(
      projects.map(async (p) => {
        const tasks = await apiFetch(`/api/tasks?projectId=${p.id}`);
        return { project: p, tasks };
      })
    );

    // global
    let global = { all: 0, todo: 0, doing: 0, done: 0 };
    const perProject = results.map((r) => {
      const counts = countStatuses(r.tasks);
      global.all += counts.all;
      global.todo += counts.todo;
      global.doing += counts.doing;
      global.done += counts.done;
      return { project: r.project, counts };
    });

    renderGlobal(global);
    renderPerProject(perProject);

    summaryEl.textContent = `Projekty: ${projects.length} • Zadania: ${global.all}`;
    setMessage("Statystyki zaktualizowane ✅", "ok");
  } catch (e) {
    console.error(e);
    setMessage("Nie udało się wczytać statystyk.", "err");
    summaryEl.textContent = "Błąd ładowania.";
  }
}

refreshBtn.addEventListener("click", loadStats);
loadStats();
