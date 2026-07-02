using Microsoft.AspNetCore.Mvc;
using ThesisManagementAPI.DataAccess;
using ThesisManagementAPI.Models;

namespace ThesisManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ThesisController : ControllerBase
    {
        ThesisData data = new ThesisData();

        [HttpGet]
        public IActionResult getData()
        {
            return Ok(data.getData());
        }

        [HttpGet("{id}")]
        public IActionResult getById(int id)
        {
            var thesis = data.getById(id);
            if (thesis == null) return NotFound(new { message = $"Thesis with ID {id} not found." });
            return Ok(thesis);
        }

        [HttpPost]
        public IActionResult InsertData(ThesisModel thesis)
        {
            try
            {
                data.InsertData(thesis);
                return Ok(new { message = "Thesis inserted successfully." });
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
        public IActionResult UpdateData(ThesisModel thesis)
        {
            try
            {
                data.UpdateData(thesis);
                return Ok(new { message = "Thesis updated successfully." });
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
                return Ok(new { message = "Thesis deleted successfully." });
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
