using Microsoft.AspNetCore.Mvc;
using ThesisManagementAPI.DataAccess;
using ThesisManagementAPI.Models;

namespace ThesisManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SupervisorController : ControllerBase
    {
        SupervisorData data = new SupervisorData();

        [HttpGet]
        public IActionResult getData()
        {
            return Ok(data.getData());
        }

        [HttpGet("{id}")]
        public IActionResult getById(int id)
        {
            var sup = data.getById(id);
            if (sup == null) return NotFound(new { message = $"Supervisor with ID {id} not found." });
            return Ok(sup);
        }

        [HttpPost]
        public IActionResult InsertData(SupervisorModel sup)
        {
            try
            {
                data.InsertData(sup);
                return Ok(new { message = "Supervisor inserted successfully." });
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
        public IActionResult UpdateData(SupervisorModel sup)
        {
            try
            {
                data.UpdateData(sup);
                return Ok(new { message = "Supervisor updated successfully." });
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
                return Ok(new { message = "Supervisor deleted successfully." });
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
