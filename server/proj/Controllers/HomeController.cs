using Microsoft.AspNetCore.Mvc;
using app.Services;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using System.Drawing.Text;
using InfluxDB.Client.Writes;
using System.Text.Json;

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
                            "r._measurement == \"sensor_threshold1\" and " +
                            "r._field == \"ultrasonic1\")";
                var tables = await query.QueryAsync(flux, "johnorg");
                return tables[0].Records.Select(record => float.Parse(record.GetValue().ToString()));
            });

            return Ok(results.Last());
        }

        [HttpPost]
        public IActionResult PostSensorThreshold([FromBody] JsonElement curSensorVal, [FromServices] InfluxDBService service)
        {
            var dict = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(curSensorVal);
            double value = double.Parse(dict["curSensorVal"]);
            Console.WriteLine(value);
            service.Write(write =>
            {
                var point = PointData.Measurement("sensor_threshold1")
                    .Field("ultrasonic1", value)
                    .Timestamp(DateTime.UtcNow, InfluxDB.Client.Api.Domain.WritePrecision.Ns);

                write.WritePoint(point, "bucket1", "johnorg");
            });

            return Ok();
        }

        [HttpGet]
        [Route("data")]
        public async Task<IActionResult> GetSensorValues([FromServices] InfluxDBService service)
        {
             var results = await service.QueryAsync(async query =>
             {
                var flux = "from(bucket:\"bucket1\") " +
                            "|> range(start: -15m)" +
                            "|> filter(fn: (r) => " +
                            "r._measurement == \"sensors\" and " +
                            "r._field == \"ultrasonic1\")";
                var tables = await query.QueryAsync(flux, "johnorg");
                return tables[0].Records.Select(record => new[] { record.GetValue().ToString(), record.GetTime().ToString() });
             });

             return Ok(results);

        }
    }
    
}
