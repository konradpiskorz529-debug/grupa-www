# Projekt 2 — Task Manager (Frontend + Backend + SQLite)

Prosta aplikacja webowa typu **Task Manager** z relacją **Projekty (1) → (N) Zadania**.  
Frontend: **HTML + CSS + JavaScript (fetch)**, backend: **Node.js + Express**, baza: **SQLite**.

## Funkcje
- Projekty: lista, dodawanie, usuwanie
- Zadania: lista w projekcie, dodawanie, edycja (PUT), usuwanie
- Statystyki: liczba zadań (todo/doing/done) globalnie i per projekt
- Walidacja danych wejściowych + obsługa błędów

---

## Wymagania
- Node.js (LTS)
- npm
- (opcjonalnie) Thunder Client / Postman do testów API

---

## Instalacja i uruchomienie

### 1) Instalacja zależności
W folderze projektu:
```bash
npm install
```

### 2) Konfiguracja środowiska (.env)
Utwórz plik `.env` w głównym folderze projektu:
```env
PORT=3000
DB_PATH=./database.sqlite
```

### 3) Start aplikacji (tryb dev)
```bash
npm run dev
```

Serwer uruchomi się domyślnie pod:
- http://localhost:3000

### 4) Widoki (frontend)
- Projekty: http://localhost:3000/index.html  
- Zadania projektu: http://localhost:3000/project.html?id=1  
- Statystyki: http://localhost:3000/stats.html  

---

## Struktura projektu

```text
project/
  src/
    app.js
    db/
      index.js
    routes/
      projects.routes.js
      tasks.routes.js
  public/
    index.html
    project.html
    stats.html
    css/
      style.css
    js/
      api.js
      projects.js
      tasks.js
      stats.js
  views/               
  .env
  package.json
  README.md
```

- `public/` – frontend (HTML/CSS/JS)
- `src/` – backend (Express + SQLite)
- `src/db/index.js` – inicjalizacja bazy i tworzenie tabel
- `src/routes/` – routing REST API

---

## Baza danych (SQLite)
Aplikacja tworzy plik bazy automatycznie (domyślnie `database.sqlite`).

Tabele:
- `projects`
- `tasks` (FK `project_id` → `projects.id`, `ON DELETE CASCADE`)

Relacja:
- **Project 1 — N Tasks**

---

## API (REST)

### Healthcheck
**GET** `/api/health`  
Odpowiedź:
```json
{ "ok": true }
```

### Projekty

**GET** `/api/projects`  
Zwraca listę projektów.

**POST** `/api/projects`  
Body:
```json
{ "name": "Szkola" }
```

**DELETE** `/api/projects/:id`  
Usuwa projekt (i jego zadania dzięki `ON DELETE CASCADE`).

---

### Zadania

**GET** `/api/tasks?projectId=1`  
Zwraca listę zadań dla projektu.

**POST** `/api/tasks`  
Body:
```json
{
  "project_id": 1,
  "title": "Zrobic backend",
  "description": "Express + SQLite",
  "status": "todo",
  "due_date": "2026-01-21"
}
```

**PUT** `/api/tasks/:id`  
Body:
```json
{
  "title": "Zrobic backend (updated)",
  "description": "Dziala",
  "status": "doing",
  "due_date": "2026-01-22"
}
```

**DELETE** `/api/tasks/:id`  
Usuwa zadanie.

---

## Walidacja i błędy
- Walidacja wejścia: `express-validator`
- Obsługa błędów: `try/catch` + middleware error handler
- Błędy walidacji: status `400` + lista `errors`

---

## Testowanie (Thunder Client)
Przykładowa kolejność testów:
1. GET `/api/health`
2. POST `/api/projects` → zapamiętaj `id`
3. POST `/api/tasks` z `project_id`
4. GET `/api/tasks?projectId=...`
5. PUT `/api/tasks/:id`
6. DELETE `/api/tasks/:id`

---

## Spełnione wymagania (checklista)

### FRONT
- HTML + CSS: `public/*.html`, `public/css/style.css`
- JS komunikacja z backendem (fetch): `public/js/*.js`
- Min. 3 widoki: `index.html`, `project.html`, `stats.html` (+ modal edycji)
- Formularze: dodawanie i edycja danych (modal)
- Wyświetlanie danych z bazy: listy projektów i zadań
- Responsywny i czytelny design (media query w CSS)

### BACKEND
- Node.js + Express: `src/app.js`
- REST API (GET/POST/PUT/DELETE): `/api/projects`, `/api/tasks`
- Baza danych SQLite: `src/db/index.js`
- 2 tabele + relacja: `projects` ↔ `tasks`
- Walidacja danych: `express-validator`
- Obsługa błędów: try/catch + middleware error handler

### DODATKOWE
- Podział na foldery: `routes`, `db`, `public`, `views`
- `package.json` z zależnościami i skryptami
- `.env` do konfiguracji
- `README.md` z instrukcją uruchomienia i opisem API
