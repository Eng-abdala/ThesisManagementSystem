using ThesisManagementAPI.Data;
using ThesisManagementAPI.Models;

namespace ThesisManagementAPI.DataAccess
{
    public class ThesisData
    {
        private static readonly string[] ValidStatuses = { "In Progress", "Submitted", "Approved", "Rejected" };

        public List<ThesisModel> getData()
        {
            using var db = new ThesisDbContext();
            return db.Theses.ToList();
        }

        public ThesisModel? getById(int id)
        {
            using var db = new ThesisDbContext();
            return db.Theses.Find(id);
        }

        public void InsertData(ThesisModel thesis)
        {
            using var db = new ThesisDbContext();

            bool studentExists = db.Students.Any(s => s.Student_ID == thesis.Student_ID);
            if (!studentExists)
                throw new InvalidOperationException($"Student_ID {thesis.Student_ID} does not exist.");

            bool supervisorExists = db.Supervisors.Any(s => s.Supervisor_ID == thesis.Supervisor_ID);
            if (!supervisorExists)
                throw new InvalidOperationException($"Supervisor_ID {thesis.Supervisor_ID} does not exist.");

            bool alreadyHasThesis = db.Theses.Any(t => t.Student_ID == thesis.Student_ID);
            if (alreadyHasThesis)
                throw new InvalidOperationException($"Student_ID {thesis.Student_ID} already has a thesis assigned.");

            if (string.IsNullOrWhiteSpace(thesis.Status))
                thesis.Status = "In Progress";

            if (!ValidStatuses.Contains(thesis.Status))
                throw new InvalidOperationException($"Invalid status '{thesis.Status}'. Allowed: {string.Join(", ", ValidStatuses)}.");

            db.Theses.Add(thesis);
            db.SaveChanges();
        }

        public void UpdateData(ThesisModel thesis)
        {
            using var db = new ThesisDbContext();
            var existing = db.Theses.Find(thesis.Thesis_ID);
            if (existing == null)
                throw new KeyNotFoundException($"Thesis with ID {thesis.Thesis_ID} not found.");

            bool studentExists = db.Students.Any(s => s.Student_ID == thesis.Student_ID);
            if (!studentExists)
                throw new InvalidOperationException($"Student_ID {thesis.Student_ID} does not exist.");

            bool supervisorExists = db.Supervisors.Any(s => s.Supervisor_ID == thesis.Supervisor_ID);
            if (!supervisorExists)
                throw new InvalidOperationException($"Supervisor_ID {thesis.Supervisor_ID} does not exist.");

            bool belongsToAnother = db.Theses.Any(t => t.Student_ID == thesis.Student_ID && t.Thesis_ID != thesis.Thesis_ID);
            if (belongsToAnother)
                throw new InvalidOperationException($"Student_ID {thesis.Student_ID} already has a different thesis assigned.");

            if (!ValidStatuses.Contains(thesis.Status))
                throw new InvalidOperationException($"Invalid status '{thesis.Status}'. Allowed: {string.Join(", ", ValidStatuses)}.");

            // business rule: can't go back to "In Progress" once it has moved forward
            if (thesis.Status == "In Progress" && existing.Status != "In Progress")
                throw new InvalidOperationException("Cannot revert a thesis back to 'In Progress' once it has been submitted.");

            // business rule: must be Submitted before Approved/Rejected
            if ((thesis.Status == "Approved" || thesis.Status == "Rejected") && existing.Status == "In Progress")
                throw new InvalidOperationException("Thesis must be 'Submitted' before it can be Approved or Rejected.");

            existing.Title = thesis.Title;
            existing.Student_ID = thesis.Student_ID;
            existing.Supervisor_ID = thesis.Supervisor_ID;
            existing.Status = thesis.Status;
            existing.Submission_Date = thesis.Submission_Date;
            db.SaveChanges();
        }

        public void DeleteData(int id)
        {
            using var db = new ThesisDbContext();
            var existing = db.Theses.Find(id);
            if (existing == null)
                throw new KeyNotFoundException($"Thesis with ID {id} not found.");

            bool hasEvaluations = db.Evaluations.Any(e => e.Thesis_ID == id);
            if (hasEvaluations)
                throw new InvalidOperationException("Cannot delete thesis: evaluations exist for this thesis. Delete evaluations first.");

            db.Theses.Remove(existing);
            db.SaveChanges();
        }
    }
}
