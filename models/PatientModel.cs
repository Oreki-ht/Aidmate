using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AidMate.Models
{
    public class PatientModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string? Id { get; set; }

        [BsonRequired]
        public string Name { get; set; }

        public string Condition { get; set; }

        public bool IsCritical { get; set; }
    }
}
