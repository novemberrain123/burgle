using Microsoft.AspNetCore.Mvc;
using app.Services;

namespace proj.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HomeController : ControllerBase
    {
        [HttpGet]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> GetSensorThreshold([FromServices] InfluxDBService service)
        {
            var results = await service.QueryAsync(async query =>
            {
                var flux = "from(bucket:\"bucket1\") " +
                            "|> range(start: 0)" +
                            "|> filter(fn: (r) => " +
                            "|> r._measurement == \"threshold\"";
                var tables = await query.QueryAsync(flux, "johnorg");
                return tables.SelectMany(table =>
                    table.Records.Select(record =>
                        float.Parse(record.GetValue().ToString())
                        ));
            });

            return (IActionResult)results;
        }
    }
    
}
