using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AidMate.Models
{
    public class TreatmentModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string? Id { get; set; }

        [BsonRequired]
        public string ParamedicId { get; set; }

        [BsonRequired]
        public string PatientId { get; set; }

        public string Notes { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}