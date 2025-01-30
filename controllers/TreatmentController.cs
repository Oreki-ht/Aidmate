using Microsoft.AspNetCore.Mvc;
using AidMate.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using AidMate.Services;
using System;

namespace AidMate.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TreatmentsController : ControllerBase
    {
        private readonly ITreatmentService _service;

        public TreatmentsController(ITreatmentService service) => _service = service;

        [HttpGet("Search")]
        public async Task<ActionResult<List<TreatmentModel>>> Get([FromQuery] string? paramedicId, [FromQuery] string? patientId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            try
            {
                var treatments = await _service.Get(paramedicId, patientId, from, to);
                if (treatments == null || treatments.Count == 0)
                    return NotFound("No treatments found with the specified criteria.");
                return Ok(treatments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("SearchById/{id}")]
        public async Task<ActionResult<TreatmentModel?>> GetById(string id)
        {
            try
            {
                var treatment = await _service.GetById(id);
                return treatment == null ? NotFound("Treatment not found.") : Ok(treatment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("AddTreatment")]
        public async Task<ActionResult> AddTreatment([FromBody] TreatmentRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrEmpty(request.ParamedicId) || string.IsNullOrEmpty(request.PatientId))
                    return BadRequest("ParamedicId and PatientId are required.");

                await _service.AddTreatment(request.ParamedicId, request.PatientId, request.Notes);
                return Ok(new { message = "Treatment record added successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("Update/{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] TreatmentModel updatedTreatment)
        {
            try
            {
                var existingTreatment = await _service.GetById(id);
                if (existingTreatment == null)
                    return NotFound("Treatment not found.");

                await _service.Update(id, updatedTreatment);
                return Ok(new { message = "Treatment record updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("Delete/{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            try
            {
                var treatment = await _service.GetById(id);
                if (treatment == null)
                    return NotFound("Treatment not found.");

                await _service.Delete(id);
                return Ok(new { message = "Treatment record deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    public class TreatmentRequest
    {
        public string ParamedicId { get; set; }
        public string PatientId { get; set; }
        public string Notes { get; set; }
    }
}