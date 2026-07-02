using Microsoft.AspNetCore.Mvc;
using ThesisManagementAPI.DataAccess;
using ThesisManagementAPI.Models;

namespace ThesisManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EvaluationController : ControllerBase
    {
        EvaluationData data = new EvaluationData();

        [HttpGet]
        public IActionResult getData()
        {
            return Ok(data.getData());
        }

        [HttpGet("{id}")]
        public IActionResult getById(int id)
        {
            var eval = data.getById(id);
            if (eval == null) return NotFound(new { message = $"Evaluation with ID {id} not found." });
            return Ok(eval);
        }

        [HttpPost]
        public IActionResult InsertData(EvaluationModel eval)
        {
            try
            {
                data.InsertData(eval);
                return Ok(new { message = "Evaluation inserted successfully." });
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
        public IActionResult UpdateData(EvaluationModel eval)
        {
            try
            {
                data.UpdateData(eval);
                return Ok(new { message = "Evaluation updated successfully." });
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
                return Ok(new { message = "Evaluation deleted successfully." });
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
    }
}
