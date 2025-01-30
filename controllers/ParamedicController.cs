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
    public class ParamedicsController : ControllerBase
    {
        private readonly IParamedicService _service;

        public ParamedicsController(IParamedicService service) => _service = service;

        [HttpGet("SearchByNameOrQualification")]
        public async Task<ActionResult<List<ParamedicModel>>> Get([FromQuery] string? name, [FromQuery] string? qualification)
        {
            try
            {
                var paramedics = await _service.Get(name, qualification);
                if (paramedics == null || paramedics.Count == 0)
                    return NotFound("No paramedics found with the specified criteria.");
                return Ok(paramedics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpGet("SearchById/{id}")]
        public async Task<ActionResult<ParamedicModel?>> GetById(string id)
        {
            try
            {
                var paramedic = await _service.GetById(id);
                return paramedic == null ? NotFound("Paramedic not found.") : Ok(paramedic);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("AddParamedic")]
        public async Task<ActionResult> Add([FromBody] ParamedicModel paramedic)
        {
            try
            {
                if (string.IsNullOrEmpty(paramedic.Name) || string.IsNullOrEmpty(paramedic.Qualification))
                    return BadRequest("Name and Qualification are required.");

                await _service.Add(paramedic);
                return Ok(new { message = "Paramedic added successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("Update/{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] ParamedicModel paramedic)
        {
            try
            {
                var existingParamedic = await _service.GetById(id);
                if (existingParamedic == null)
                    return NotFound("Paramedic not found.");

                await _service.Update(id, paramedic);
                return Ok(new { message = "Paramedic updated successfully." });
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
                var paramedic = await _service.GetById(id);
                if (paramedic == null)
                    return NotFound("Paramedic not found.");

                await _service.Delete(id);
                return Ok(new { message = "Paramedic deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}