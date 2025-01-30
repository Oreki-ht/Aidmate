using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AidMate.Models
{
    public class AmbulanceModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string? Id { get; set; }

        [BsonRequired]
        public string PlateNumber { get; set; }

        public string Type { get; set; }

        public bool IsAvailable { get; set; }
    }
}
