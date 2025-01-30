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
    public class AmbulancesController : ControllerBase
    {
        private readonly IAmbulanceService _service;

        public AmbulancesController(IAmbulanceService service) => _service = service;

        [HttpGet("SearchByTypeOrAvailability")]
        public async Task<ActionResult<List<AmbulanceModel>>> Get([FromQuery] string? type, [FromQuery] bool? isAvailable)
        {
            try
            {
                var ambulances = await _service.Get(type, isAvailable);
                if (ambulances == null || ambulances.Count == 0)
                    return NotFound("No ambulances found with the specified criteria.");
                return Ok(ambulances);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("SearchById/{id}")]
        public async Task<ActionResult<AmbulanceModel?>> GetById(string id)
        {
            try
            {
                var ambulance = await _service.GetById(id);
                return ambulance == null ? NotFound("Ambulance not found.") : Ok(ambulance);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("AddAmbulance")]
        public async Task<ActionResult> Add([FromBody] AmbulanceModel ambulance)
        {
            try
            {
                if (string.IsNullOrEmpty(ambulance.PlateNumber))
                    return BadRequest("Plate Number is required.");

                await _service.Add(ambulance);
                return Ok(new { message = "Ambulance added successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("Update/{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] AmbulanceModel ambulance)
        {
            try
            {
                var existingAmbulance = await _service.GetById(id);
                if (existingAmbulance == null)
                    return NotFound("Ambulance not found.");

                await _service.Update(id, ambulance);
                return Ok(new { message = "Ambulance updated successfully." });
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
                var ambulance = await _service.GetById(id);
                if (ambulance == null)
                    return NotFound("Ambulance not found.");

                await _service.Delete(id);
                return Ok(new { message = "Ambulance deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}