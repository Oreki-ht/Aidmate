using AidMate.Models;

public class PatientService : IPatientService
{
    private readonly List<PatientModel> _store = new();

    public async Task<List<PatientModel>> Get(string? name, bool? isCritical) => await Task.FromResult(_store);

    public async Task<PatientModel?> GetById(string id)
        => await Task.FromResult(_store.FirstOrDefault(p => p.Id == id));

    public async Task<List<PatientModel>> Add(PatientModel newPatient)
    {
        newPatient.Id = Guid.NewGuid().ToString();
        _store.Add(newPatient);
        return await Task.FromResult(_store);
    }

    public async Task<List<PatientModel>> Update(string id, PatientModel updatedPatient)
    {
        var idx = _store.FindIndex(p => p.Id == id);
        if (idx != -1) _store[idx] = updatedPatient;
        return await Task.FromResult(_store);
    }

    public async Task<List<PatientModel>> Delete(string id)
    {
        _store.RemoveAll(p => p.Id == id);
        return await Task.FromResult(_store);
    }
}