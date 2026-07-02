using System.ComponentModel.DataAnnotations;

namespace ThesisManagementAPI.Models
{
    public class SupervisorModel
    {
        [Key]
        public int Supervisor_ID { get; set; }
        public string Full_Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Specialization { get; set; }
        public int Department_ID { get; set; }
    }
}
