using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AidMate.Models
{
    public class ParamedicModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string? Id { get; set; }

        [BsonRequired]
        public string? Name { get; set; }

        [BsonRequired]
        public string? Qualification { get; set; }

        public int YearsOfExperience { get; set; }
    }
}
