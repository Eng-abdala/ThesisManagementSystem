using System.ComponentModel.DataAnnotations;

namespace ThesisManagementAPI.Models
{
    public class DepartmentModel
    {
        [Key]
        public int Department_ID { get; set; }
        public string Department_Name { get; set; } = string.Empty;
        public string? Department_Head { get; set; }
    }
}
