const qs = new URLSearchParams(location.search);
const projectId = Number(qs.get("id"));

const projectInfo = document.getElementById("projectInfo");
const tasksList = document.getElementById("tasksList");
const msgEl = document.getElementById("message");
const refreshBtn = document.getElementById("refreshBtn");
const backBtn = document.getElementById("backBtn");

const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDesc = document.getElementById("taskDesc");
const taskStatus = document.getElementById("taskStatus");
const taskDue = document.getElementById("taskDue");

// modal
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editId = document.getElementById("editId");
const editTaskTitle = document.getElementById("editTaskTitle");
const editTaskDesc = document.getElementById("editTaskDesc");
const editTaskStatus = document.getElementById("editTaskStatus");
const editTaskDue = document.getElementById("editTaskDue");

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

function openModal() {
  editModal.setAttribute("aria-hidden", "false");
}
function closeModal() {
  editModal.setAttribute("aria-hidden", "true");
}
editModal.addEventListener("click", (e) => {
  if (e.target.closest("[data-close]")) closeModal();
});

backBtn.addEventListener("click", () => {
  location.href = "/index.html";
});

async function loadProjectName() {
  if (!Number.isFinite(projectId)) {
    projectInfo.textContent = "Brak id projektu w URL (project.html?id=1)";
    projectInfo.className = "message message--err";
    return;
  }
  const projects = await apiFetch("/api/projects");
  const p = projects.find((x) => x.id === projectId);
  projectInfo.textContent = p ? `Projekt: ${p.name}` : `Projekt`;

}

function badge(status) {
  const cls =
    status === "done" ? "badge badge--done" :
    status === "doing" ? "badge badge--doing" :
    "badge badge--todo";

  return `<span class="${cls}">${status}</span>`;
}


function renderTasks(tasks) {
  if (!tasks || tasks.length === 0) {
    tasksList.innerHTML = `<div class="item">
      <div class="item__left">
        <p class="item__title">Brak zadań</p>
        <p class="item__meta">Dodaj pierwsze zadanie powyżej.</p>
      </div>
    </div>`;
    return;
  }

  tasksList.innerHTML = tasks
    .map(
      (t) => `
      <div class="item ${t.status === "done" ? "task--done" : ""}">
        <div class="item__left">
          <p class="item__title">${escapeHtml(t.title)} ${badge(t.status)}</p>
          <p class="item__meta">
            ${t.due_date ? `Termin: ${escapeHtml(t.due_date)}` : ""}
            ${t.description ? ` • ${escapeHtml(t.description)}` : ""}
          </p>
        </div>
        <div class="item__actions">
          <button class="btn btn--ghost" data-edit="${t.id}">Edytuj</button>
          <button class="btn btn--danger" data-del="${t.id}">Usuń</button>
        </div>
      </div>
    `
    )
    .join("");
}

async function loadTasks() {
  setMessage("");
  try {
    const tasks = await apiFetch(`/api/tasks?projectId=${projectId}`);
    renderTasks(tasks);
  } catch (e) {
    console.error(e);
    setMessage("Nie udało się pobrać zadań.", "err");
  }
}

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMessage("");

  const title = taskTitle.value.trim();
  if (title.length < 2) {
    setMessage("Tytuł min. 2 znaki.", "err");
    return;
  }

  try {
    await apiFetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        project_id: projectId,
        title,
        description: taskDesc.value.trim(),
        status: taskStatus.value,
        due_date: taskDue.value || null,
      }),
    });

    taskTitle.value = "";
    taskDesc.value = "";
    taskStatus.value = "todo";
    taskDue.value = "";

    setMessage("Zadanie dodane ✅", "ok");
    await loadTasks();
  } catch (e2) {
    console.error(e2);
    const msg =
      e2?.data?.errors?.[0]?.msg || e2?.data?.error || "Nie udało się dodać zadania.";
    setMessage(msg, "err");
  }
});

tasksList.addEventListener("click", async (e) => {
  const delBtn = e.target.closest("button[data-del]");
  const editBtn = e.target.closest("button[data-edit]");

  if (delBtn) {
    const id = delBtn.getAttribute("data-del");
    if (!confirm(`Usunąć zadanie?`)) return;

    try {
      await apiFetch(`/api/tasks/${id}`, { method: "DELETE" });
      setMessage("Zadanie usunięte ✅", "ok");
      await loadTasks();
    } catch (e2) {
      console.error(e2);
      setMessage(e2?.data?.error || "Nie udało się usunąć zadania.", "err");
    }
  }

  if (editBtn) {
    const id = editBtn.getAttribute("data-edit");

    // pobierz aktualne zadania i znajdź po id 
    const tasks = await apiFetch(`/api/tasks?projectId=${projectId}`);
    const t = tasks.find((x) => x.id === Number(id));
    if (!t) return setMessage("Nie znaleziono zadania.", "err");

    editId.value = t.id;
    editTaskTitle.value = t.title || "";
    editTaskDesc.value = t.description || "";
    editTaskStatus.value = t.status || "todo";
    editTaskDue.value = t.due_date || "";

    openModal();
  }
});

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = editId.value;
  const title = editTaskTitle.value.trim();
  if (title.length < 2) {
    alert("Tytuł min. 2 znaki.");
    return;
  }

  try {
    await apiFetch(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        title,
        description: editTaskDesc.value.trim(),
        status: editTaskStatus.value,
        due_date: editTaskDue.value || null,
      }),
    });

    closeModal();
    setMessage("Zadanie zaktualizowane ✅", "ok");
    await loadTasks();
  } catch (e2) {
    console.error(e2);
    const msg =
      e2?.data?.errors?.[0]?.msg || e2?.data?.error || "Nie udało się zapisać zmian.";
    alert(msg);
  }
});

refreshBtn.addEventListener("click", loadTasks);

// start
(async function init() {
  try {
    await loadProjectName();
    await loadTasks();
  } catch (e) {
    console.error(e);
    setMessage("Błąd inicjalizacji widoku.", "err");
  }
})();
