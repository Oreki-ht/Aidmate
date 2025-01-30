using AidMate.Services;
var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register MongoDB-backed services
builder.Services.AddSingleton<IParamedicService, ParamedicService>();
builder.Services.AddSingleton<IPatientService, PatientService>();
builder.Services.AddSingleton<IAmbulanceService, AmbulanceService>();
builder.Services.AddSingleton<ITreatmentService, TreatmentService>();

var app = builder.Build();

// Enable Swagger UI in Development Mode
if (app.Environment.IsDevelopment() || app.Environment.IsProduction()) // Ensure it works in both Dev & Prod
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "AidMate API v1");
        c.RoutePrefix = string.Empty; // Set Swagger UI as default page
    });
}

//app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();



