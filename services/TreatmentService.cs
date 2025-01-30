using AidMate.Models;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AidMate.Services;
public class TreatmentService : ITreatmentService
{
    private readonly IMongoCollection<TreatmentModel> _treatmentCollection;

    public TreatmentService(IConfiguration config)
    {
        var client = new MongoClient(config["MongoDbSettings:ConnectionString"]);
        var database = client.GetDatabase(config["MongoDbSettings:DatabaseName"]);
        _treatmentCollection = database.GetCollection<TreatmentModel>(config["MongoDbSettings:Collections:Treatments"]);
    }

    public async Task<List<TreatmentModel>> Get(string? paramedicId, string? patientId, DateTime? from, DateTime? to)
    {
        var filterBuilder = Builders<TreatmentModel>.Filter;
        var filters = new List<FilterDefinition<TreatmentModel>>();

        if (!string.IsNullOrEmpty(paramedicId))
            filters.Add(filterBuilder.Eq(t => t.ParamedicId, paramedicId));

        if (!string.IsNullOrEmpty(patientId))
            filters.Add(filterBuilder.Eq(t => t.PatientId, patientId));

        if (from.HasValue)
            filters.Add(filterBuilder.Gte(t => t.Timestamp, from.Value));

        if (to.HasValue)
            filters.Add(filterBuilder.Lte(t => t.Timestamp, to.Value));

        var filter = filters.Count > 0 ? filterBuilder.And(filters) : filterBuilder.Empty;
        return await _treatmentCollection.Find(filter).ToListAsync();
    }

    public async Task<TreatmentModel?> GetById(string id) =>
        await _treatmentCollection.Find(t => t.Id == id).FirstOrDefaultAsync();

    public async Task AddTreatment(string paramedicId, string patientId, string notes)
    {
        var treatment = new TreatmentModel
        {
            Id = Guid.NewGuid().ToString(),
            ParamedicId = paramedicId,
            PatientId = patientId,
            Notes = notes,
            Timestamp = DateTime.UtcNow
        };
        await _treatmentCollection.InsertOneAsync(treatment);
    }

    public async Task Update(string id, TreatmentModel updatedTreatment)
    {
        await _treatmentCollection.ReplaceOneAsync(t => t.Id == id, updatedTreatment);
    }

    public async Task Delete(string id) =>
        await _treatmentCollection.DeleteOneAsync(t => t.Id == id);
}