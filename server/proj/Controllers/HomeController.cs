using Microsoft.AspNetCore.Mvc;

namespace proj.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HomeController : ControllerBase
    {
        [HttpGet()]
        public IActionResult Index()
        {
            return View();
        }
    }
}
