# Thesis Management System — Phase 2 (ASP.NET Core Web API)

Simple CRUD API for the 5 Phase 1 entities, using EF Core Code First with your connection string baked into `ThesisDbContext.cs` (matching your usual project style — no DI/appsettings juggling needed).

## Structure
- **Models/** — `DepartmentModel`, `StudentModel`, `SupervisorModel`, `ThesisModel`, `EvaluationModel`
- **Data/ThesisDbContext.cs** — DbContext with your connection string (`DESKTOP-O8R933V\SQLEXPRESS`) hardcoded in `OnConfiguring`
- **Data/[Entity]Data.cs** — one data-access class per entity, each with `getData()`, `getById()`, `InsertData()`, `UpdateData()`, `DeleteData()` — same pattern as your `DepartmentData` example
- **Controllers/[Entity]Controller.cs** — thin controllers, same try/catch pattern you used

## How to run (Visual Studio 2022)
1. Open `ThesisManagementAPI.sln`
2. Restore NuGet packages (automatic, or right-click solution → Restore NuGet Packages)
3. **Package Manager Console**:
   ```powershell
   Add-Migration InitialCreate
   Update-Database
   ```
4. Press F5 — Swagger UI opens automatically

## Business rules enforced (in the Data classes, thrown as exceptions, caught in controllers)
- One thesis per student (`InvalidOperationException` → 409 Conflict)
- Thesis status restricted to: In Progress / Submitted / Approved / Rejected
- Can't revert thesis to "In Progress" once it has moved forward
- Must be "Submitted" before "Approved"/"Rejected"
- Can't evaluate a thesis still "In Progress"
- Score must be 0–100
- Can't delete a Department/Supervisor/Student/Thesis that's still referenced elsewhere (avoids the FK errors you hit in Phase 1)

## Connecting React later (Phase 3)
CORS is already enabled (`AllowAll` policy in `Program.cs`), so your React dev server can call `https://localhost:PORT/api/Department`, `/api/Student`, etc. directly via `fetch`/`axios` once it's running.

## If your SQL Server instance name is different
Edit the connection string directly in `Data/ThesisDbContext.cs`:
```csharp
optionsBuilder.UseSqlServer("Server=YOUR_SERVER_NAME;Database=ThesisManagementSystem;Trusted_Connection=True;TrustServerCertificate=True;");
```
