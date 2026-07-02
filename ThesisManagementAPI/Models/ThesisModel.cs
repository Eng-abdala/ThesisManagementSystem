using System.ComponentModel.DataAnnotations;

namespace ThesisManagementAPI.Models
{
    public class ThesisModel
    {
        [Key]
        public int Thesis_ID { get; set; }
        public string Title { get; set; } = string.Empty;
        public int Student_ID { get; set; }
        public int Supervisor_ID { get; set; }
        public string Status { get; set; } = "In Progress"; // In Progress / Submitted / Approved / Rejected
        public DateTime? Submission_Date { get; set; }
    }
}
