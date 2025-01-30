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
    public class PatientsController : ControllerBase
    {
        private readonly IPatientService _service;

        public PatientsController(IPatientService service) => _service = service;

        [HttpGet("SearchByNameOrCondition")]
        public async Task<ActionResult<List<PatientModel>>> Get([FromQuery] string? name, [FromQuery] bool? isCritical)
        {
            try
            {
                var patients = await _service.Get(name, isCritical);
                if (patients == null || patients.Count == 0)
                    return NotFound("No patients found with the specified criteria.");
                return Ok(patients);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("SearchById/{id}")]
        public async Task<ActionResult<PatientModel?>> GetById(string id)
        {
            try
            {
                var patient = await _service.GetById(id);
                return patient == null ? NotFound("Patient not found.") : Ok(patient);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("AddPatient")]
        public async Task<ActionResult> Add([FromBody] PatientModel patient)
        {
            try
            {
                if (string.IsNullOrEmpty(patient.Name))
                    return BadRequest("Name is required.");

                await _service.Add(patient);
                return Ok(new { message = "Patient added successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("Update/{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] PatientModel patient)
        {
            try
            {
                var existingPatient = await _service.GetById(id);
                if (existingPatient == null)
                    return NotFound("Patient not found.");

                await _service.Update(id, patient);
                return Ok(new { message = "Patient updated successfully." });
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
                var patient = await _service.GetById(id);
                if (patient == null)
                    return NotFound("Patient not found.");

                await _service.Delete(id);
                return Ok(new { message = "Patient deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}