using System.ComponentModel.DataAnnotations;

namespace ThesisManagementAPI.Models
{
    public class EvaluationModel
    {
        [Key]
        public int Evaluation_ID { get; set; }
        public int Thesis_ID { get; set; }
        public string Examiner_Name { get; set; } = string.Empty;
        public decimal Score { get; set; }
        public string? Comments { get; set; }
        public DateTime Evaluation_Date { get; set; } = DateTime.Now;
    }
}
