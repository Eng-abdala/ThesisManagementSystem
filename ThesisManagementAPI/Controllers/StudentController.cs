using Microsoft.AspNetCore.Mvc;
using ThesisManagementAPI.DataAccess;
using ThesisManagementAPI.Models;

namespace ThesisManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        StudentData data = new StudentData();

        [HttpGet]
        public IActionResult getData()
        {
            return Ok(data.getData());
        }

        [HttpGet("{id}")]
        public IActionResult getById(int id)
        {
            var std = data.getById(id);
            if (std == null) return NotFound(new { message = $"Student with ID {id} not found." });
            return Ok(std);
        }

        [HttpPost]
        public IActionResult InsertData(StudentModel std)
        {
            try
            {
                data.InsertData(std);
                return Ok(new { message = "Student inserted successfully." });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        [HttpPut]
        public IActionResult UpdateData(StudentModel std)
        {
            try
            {
                data.UpdateData(std);
                return Ok(new { message = "Student updated successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteData(int id)
        {
            try
            {
                data.DeleteData(id);
                return Ok(new { message = "Student deleted successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }
    }
}
