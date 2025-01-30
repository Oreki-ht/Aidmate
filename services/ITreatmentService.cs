using AidMate.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AidMate.Services;
public interface ITreatmentService
{
    Task<List<TreatmentModel>> Get(string? paramedicId, string? patientId, DateTime? from, DateTime? to);
    Task<TreatmentModel?> GetById(string id);
    Task AddTreatment(string paramedicId, string patientId, string notes);
    Task Update(string id, TreatmentModel updatedTreatment);
    Task Delete(string id);
}