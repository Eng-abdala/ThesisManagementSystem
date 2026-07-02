using Microsoft.AspNetCore.Mvc;
using ThesisManagementAPI.DataAccess;
using ThesisManagementAPI.Models;

namespace ThesisManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentController : ControllerBase
    {
        DepartmentData data = new DepartmentData();

        [HttpGet]
        public IActionResult getData()
        {
            return Ok(data.getData());
        }

        [HttpGet("{id}")]
        public IActionResult getById(int id)
        {
            var dept = data.getById(id);
            if (dept == null) return NotFound(new { message = $"Department with ID {id} not found." });
            return Ok(dept);
        }

        [HttpPost]
        public IActionResult InsertData(DepartmentModel dept)
        {
            try
            {
                data.InsertData(dept);
                return Ok(new { message = "Department inserted successfully." });
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
        public IActionResult UpdateData(DepartmentModel dept)
        {
            try
            {
                data.UpdateData(dept);
                return Ok(new { message = "Department updated successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
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
                return Ok(new { message = "Department deleted successfully." });
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
