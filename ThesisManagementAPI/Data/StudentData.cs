using ThesisManagementAPI.Data;
using ThesisManagementAPI.Models;

namespace ThesisManagementAPI.DataAccess
{
    public class StudentData
    {
        public List<StudentModel> getData()
        {
            using var db = new ThesisDbContext();
            return db.Students.ToList();
        }

        public StudentModel? getById(int id)
        {
            using var db = new ThesisDbContext();
            return db.Students.Find(id);
        }

        public void InsertData(StudentModel std)
        {
            using var db = new ThesisDbContext();

            bool deptExists = db.Departments.Any(d => d.Department_ID == std.Department_ID);
            if (!deptExists)
                throw new InvalidOperationException($"Department_ID {std.Department_ID} does not exist.");

            bool emailTaken = db.Students.Any(s => s.Email == std.Email);
            if (emailTaken)
                throw new InvalidOperationException($"A student with email '{std.Email}' already exists.");

            db.Students.Add(std);
            db.SaveChanges();
        }

        public void UpdateData(StudentModel std)
        {
            using var db = new ThesisDbContext();
            var existing = db.Students.Find(std.Student_ID);
            if (existing == null)
                throw new KeyNotFoundException($"Student with ID {std.Student_ID} not found.");

            bool deptExists = db.Departments.Any(d => d.Department_ID == std.Department_ID);
            if (!deptExists)
                throw new InvalidOperationException($"Department_ID {std.Department_ID} does not exist.");

            bool emailTaken = db.Students.Any(s => s.Email == std.Email && s.Student_ID != std.Student_ID);
            if (emailTaken)
                throw new InvalidOperationException($"A student with email '{std.Email}' already exists.");

            existing.Full_Name = std.Full_Name;
            existing.Email = std.Email;
            existing.Phone = std.Phone;
            existing.Department_ID = std.Department_ID;
            db.SaveChanges();
        }

        public void DeleteData(int id)
        {
            using var db = new ThesisDbContext();
            var existing = db.Students.Find(id);
            if (existing == null)
                throw new KeyNotFoundException($"Student with ID {id} not found.");

            bool hasThesis = db.Theses.Any(t => t.Student_ID == id);
            if (hasThesis)
                throw new InvalidOperationException("Cannot delete student: a thesis record is linked to this student.");

            db.Students.Remove(existing);
            db.SaveChanges();
        }
    }
}
