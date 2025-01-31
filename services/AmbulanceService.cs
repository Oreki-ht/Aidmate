using AidMate.Models;

public class AmbulanceService : IAmbulanceService
{
    private readonly List<AmbulanceModel> _store = new();

    public async Task<List<AmbulanceModel>> Get(string? type, bool? isAvailable) => await Task.FromResult(_store);

    public async Task<AmbulanceModel?> GetById(string id)
        => await Task.FromResult(_store.FirstOrDefault(a => a.Id == id));

    public async Task<List<AmbulanceModel>> Add(AmbulanceModel newAmbulance)
    {
        newAmbulance.Id = Guid.NewGuid().ToString();
        _store.Add(newAmbulance);
        return await Task.FromResult(_store);
    }

    public async Task<List<AmbulanceModel>> Update(string id, AmbulanceModel updatedAmbulance)
    {
        var idx = _store.FindIndex(a => a.Id == id);
        if (idx != -1) _store[idx] = updatedAmbulance;
        return await Task.FromResult(_store);
    }

    public async Task<List<AmbulanceModel>> Delete(string id)
    {
        _store.RemoveAll(a => a.Id == id);
        return await Task.FromResult(_store);
    }
}