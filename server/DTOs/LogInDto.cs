using System.ComponentModel.DataAnnotations;

namespace practice_dotnet.DTOs
{
    public class LogInDto
    {
        [Required]
        [StringLength(40, MinimumLength = 6)]
        public required string Password { get; set; }

        [Required]
        [EmailAddress]
        public required string Email { get; set; }
    }
}
