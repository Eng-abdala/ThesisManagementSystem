# Thesis Management System — React Frontend (Phase 3)

React + Tailwind CSS frontend for the Thesis Management System, connecting to your
Phase 2 ASP.NET Core Web API.

## Stack
- React 18 (Vite)
- Tailwind CSS v4
- React Router v6
- Axios

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. **Set your API URL** — open the `.env` file and update it to match the port
   your ASP.NET Core API runs on. Run the API in Visual Studio, check the
   address Swagger opens at (e.g. `https://localhost:7001`), and set:
   ```
   VITE_API_BASE_URL=https://localhost:7001/api
   ```

3. Run the dev server:
   ```
   npm run dev
   ```
   Opens at http://localhost:5173

## Notes

- Make sure your API's `Program.cs` already has the `AllowAll` CORS policy
  applied (it does, from Phase 2) — otherwise the browser will block requests.
- If your API uses HTTPS with a self-signed dev certificate, your browser may
  block requests until you visit the API's Swagger URL directly once and
  accept the certificate warning.
- Run the API and the React app at the same time (two separate terminals/IDE
  windows) for everything to work.

## Structure

```
src/
  api/              Axios client + one service file per entity (Department,
                     Student, Supervisor, Thesis, Evaluation) — each with
                     getAll / getById / create / update / remove, matching
                     your controllers' GET/POST/PUT/DELETE endpoints exactly.
  components/       Layout (sidebar nav), Modal, ConfirmDialog
  pages/            Dashboard, Departments, Students, Supervisors, Theses,
                     Evaluations — each a self-contained page with its own
                     state, table, add/edit modal, and delete confirmation.
```

## Pages

- **Dashboard** — counts for all 5 entities + a thesis status breakdown.
- **Departments** — list, add, edit, delete.
- **Students** — list, add, edit, delete; Department shown as a dropdown.
- **Supervisors** — list, add, edit, delete; Department shown as a dropdown.
- **Theses** — list, add, edit, delete; Student & Supervisor dropdowns,
  status badge, submission date.
- **Evaluations** — list, add, edit, delete; Thesis dropdown, score, comments.

Error messages from the API (e.g. "Department with ID X not found", FK
conflicts on delete) are shown directly in each page, matching the messages
your Phase 2 controllers return.
