using ThesisManagementAPI.Data;
using ThesisManagementAPI.Models;

namespace ThesisManagementAPI.DataAccess
{
    public class DepartmentData
    {
        public List<DepartmentModel> getData()
        {
            using var db = new ThesisDbContext();
            return db.Departments.ToList();
        }

        public DepartmentModel? getById(int id)
        {
            using var db = new ThesisDbContext();
            return db.Departments.Find(id);
        }

        public void InsertData(DepartmentModel dept)
        {
            using var db = new ThesisDbContext();
            db.Departments.Add(dept);
            db.SaveChanges();
        }

        public void UpdateData(DepartmentModel dept)
        {
            using var db = new ThesisDbContext();
            var existing = db.Departments.Find(dept.Department_ID);
            if (existing == null)
                throw new KeyNotFoundException($"Department with ID {dept.Department_ID} not found.");

            existing.Department_Name = dept.Department_Name;
            existing.Department_Head = dept.Department_Head;
            db.SaveChanges();
        }

        public void DeleteData(int id)
        {
            using var db = new ThesisDbContext();
            var existing = db.Departments.Find(id);
            if (existing == null)
                throw new KeyNotFoundException($"Department with ID {id} not found.");

            bool inUse = db.Students.Any(s => s.Department_ID == id) || db.Supervisors.Any(s => s.Department_ID == id);
            if (inUse)
                throw new InvalidOperationException("Cannot delete department: students or supervisors are still assigned to it.");

            db.Departments.Remove(existing);
            db.SaveChanges();
        }
    }
}
