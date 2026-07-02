using ThesisManagementAPI.Data;
using ThesisManagementAPI.Models;

namespace ThesisManagementAPI.DataAccess
{
    public class SupervisorData
    {
        public List<SupervisorModel> getData()
        {
            using var db = new ThesisDbContext();
            return db.Supervisors.ToList();
        }

        public SupervisorModel? getById(int id)
        {
            using var db = new ThesisDbContext();
            return db.Supervisors.Find(id);
        }

        public void InsertData(SupervisorModel sup)
        {
            using var db = new ThesisDbContext();

            bool deptExists = db.Departments.Any(d => d.Department_ID == sup.Department_ID);
            if (!deptExists)
                throw new InvalidOperationException($"Department_ID {sup.Department_ID} does not exist.");

            bool emailTaken = db.Supervisors.Any(s => s.Email == sup.Email);
            if (emailTaken)
                throw new InvalidOperationException($"A supervisor with email '{sup.Email}' already exists.");

            db.Supervisors.Add(sup);
            db.SaveChanges();
        }

        public void UpdateData(SupervisorModel sup)
        {
            using var db = new ThesisDbContext();
            var existing = db.Supervisors.Find(sup.Supervisor_ID);
            if (existing == null)
                throw new KeyNotFoundException($"Supervisor with ID {sup.Supervisor_ID} not found.");

            bool deptExists = db.Departments.Any(d => d.Department_ID == sup.Department_ID);
            if (!deptExists)
                throw new InvalidOperationException($"Department_ID {sup.Department_ID} does not exist.");

            bool emailTaken = db.Supervisors.Any(s => s.Email == sup.Email && s.Supervisor_ID != sup.Supervisor_ID);
            if (emailTaken)
                throw new InvalidOperationException($"A supervisor with email '{sup.Email}' already exists.");

            existing.Full_Name = sup.Full_Name;
            existing.Email = sup.Email;
            existing.Specialization = sup.Specialization;
            existing.Department_ID = sup.Department_ID;
            db.SaveChanges();
        }

        public void DeleteData(int id)
        {
            using var db = new ThesisDbContext();
            var existing = db.Supervisors.Find(id);
            if (existing == null)
                throw new KeyNotFoundException($"Supervisor with ID {id} not found.");

            bool hasTheses = db.Theses.Any(t => t.Supervisor_ID == id);
            if (hasTheses)
                throw new InvalidOperationException("Cannot delete supervisor: theses are still assigned to this supervisor.");

            db.Supervisors.Remove(existing);
            db.SaveChanges();
        }
    }
}
