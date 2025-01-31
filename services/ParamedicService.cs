using AidMate.Models;

public class ParamedicService : IParamedicService
{
    private readonly List<ParamedicModel> _store = new();

    public async Task<List<ParamedicModel>> Get(string? name, string? qualification) => await Task.FromResult(_store);

    public async Task<ParamedicModel?> GetById(string id)
        => await Task.FromResult(_store.FirstOrDefault(p => p.Id == id));

    public async Task<List<ParamedicModel>> Add(ParamedicModel newParamedic)
    {
        newParamedic.Id = Guid.NewGuid().ToString();
        _store.Add(newParamedic);
        return await Task.FromResult(_store);
    }

    public async Task<List<ParamedicModel>> Update(string id, ParamedicModel updatedParamedic)
    {
        var idx = _store.FindIndex(p => p.Id == id);
        if (idx != -1) _store[idx] = updatedParamedic;
        return await Task.FromResult(_store);
    }

    public async Task<List<ParamedicModel>> Delete(string id)
    {
        _store.RemoveAll(p => p.Id == id);
        return await Task.FromResult(_store);
    }
}