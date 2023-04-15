using Microsoft.AspNetCore.Mvc;
using app.Services;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using System.Drawing.Text;
using InfluxDB.Client.Writes;

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
                            "r._measurement == \"sensor_threshold\" and " +
                            "r._field == \"ultrasonic1\")";
                var tables = await query.QueryAsync(flux, "johnorg");
                return tables[0].Records.Select(record => float.Parse(record.GetValue().ToString()));
            });
            
            return Ok(results);
        }

        [HttpPost]
        public async Task<IActionResult> PostSensorThreshold([FromBody]  float curSensorVal, [FromServices] InfluxDBService service)
        {
            Console.WriteLine(curSensorVal.ToString());

            service.Write(write =>
            {
                var point = PointData.Measurement("sensor_threshold")
                    .Field("ultrasonic1", curSensorVal)
                    .Timestamp(DateTime.UtcNow, InfluxDB.Client.Api.Domain.WritePrecision.Ns);

                write.WritePoint(point, "bucket1", "johnorg");
            });

            return Ok();
        }
    }
    
}
