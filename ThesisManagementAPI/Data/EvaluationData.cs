using ThesisManagementAPI.Data;
using ThesisManagementAPI.Models;

namespace ThesisManagementAPI.DataAccess
{
    public class EvaluationData
    {
        public List<EvaluationModel> getData()
        {
            using var db = new ThesisDbContext();
            return db.Evaluations.ToList();
        }

        public EvaluationModel? getById(int id)
        {
            using var db = new ThesisDbContext();
            return db.Evaluations.Find(id);
        }

        public void InsertData(EvaluationModel eval)
        {
            using var db = new ThesisDbContext();

            var thesis = db.Theses.Find(eval.Thesis_ID);
            if (thesis == null)
                throw new InvalidOperationException($"Thesis_ID {eval.Thesis_ID} does not exist.");

            if (thesis.Status == "In Progress")
                throw new InvalidOperationException("Cannot evaluate a thesis that is still 'In Progress'. It must be Submitted first.");

            if (eval.Score < 0 || eval.Score > 100)
                throw new InvalidOperationException("Score must be between 0 and 100.");

            db.Evaluations.Add(eval);
            db.SaveChanges();
        }

        public void UpdateData(EvaluationModel eval)
        {
            using var db = new ThesisDbContext();
            var existing = db.Evaluations.Find(eval.Evaluation_ID);
            if (existing == null)
                throw new KeyNotFoundException($"Evaluation with ID {eval.Evaluation_ID} not found.");

            if (eval.Score < 0 || eval.Score > 100)
                throw new InvalidOperationException("Score must be between 0 and 100.");

            existing.Thesis_ID = eval.Thesis_ID;
            existing.Examiner_Name = eval.Examiner_Name;
            existing.Score = eval.Score;
            existing.Comments = eval.Comments;
            existing.Evaluation_Date = eval.Evaluation_Date;
            db.SaveChanges();
        }

        public void DeleteData(int id)
        {
            using var db = new ThesisDbContext();
            var existing = db.Evaluations.Find(id);
            if (existing == null)
                throw new KeyNotFoundException($"Evaluation with ID {id} not found.");

            db.Evaluations.Remove(existing);
            db.SaveChanges();
        }
    }
}
