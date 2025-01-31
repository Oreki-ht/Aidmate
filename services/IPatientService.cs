using AidMate.Models;

public interface IPatientService
{
    Task<List<PatientModel>> Get(string? name, bool? isCritical);
    Task<PatientModel?> GetById(string id);
    Task<List<PatientModel>> Add(PatientModel newPatient);
    Task<List<PatientModel>> Update(string id, PatientModel updatedPatient);
    Task<List<PatientModel>> Delete(string id);
}