using System.ComponentModel.DataAnnotations;

namespace ThesisManagementAPI.Models
{
    public class StudentModel
    {
        [Key]
        public int Student_ID { get; set; }
        public string Full_Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public int Department_ID { get; set; }
    }
}
