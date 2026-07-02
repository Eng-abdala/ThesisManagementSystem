using Microsoft.EntityFrameworkCore;
using ThesisManagementAPI.Models;

namespace ThesisManagementAPI.Data
{
    public class ThesisDbContext : DbContext
    {
        public DbSet<DepartmentModel> Departments { get; set; }
        public DbSet<StudentModel> Students { get; set; }
        public DbSet<SupervisorModel> Supervisors { get; set; }
        public DbSet<ThesisModel> Theses { get; set; }
        public DbSet<EvaluationModel> Evaluations { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(
                "Server=DESKTOP-943T8HJ\\SQLEXPRESS;Database=ThesisManagementSystem;Trusted_Connection=True;TrustServerCertificate=True;"
            );
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<StudentModel>().HasIndex(s => s.Email).IsUnique();
            modelBuilder.Entity<SupervisorModel>().HasIndex(s => s.Email).IsUnique();
            modelBuilder.Entity<ThesisModel>().HasIndex(t => t.Student_ID).IsUnique(); 

            modelBuilder.Entity<DepartmentModel>().HasData(
                new DepartmentModel { Department_ID = 1, Department_Name = "Computer Application", Department_Head = "Eng.Mohamed Abduulahi" },
                new DepartmentModel { Department_ID = 2, Department_Name = "Information Technology", Department_Head = "Eng. Abdullahi Salad" },
                new DepartmentModel { Department_ID = 3, Department_Name = "Software Engineering", Department_Head = "Eng.Yahye Ali" }
            );
        }
    }
}
