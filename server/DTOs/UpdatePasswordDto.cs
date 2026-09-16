using System.ComponentModel.DataAnnotations;

namespace practice_dotnet.DTOs
{
    public class UpdatePasswordDto
    {
        [Required]
        public required string CurrentPassword { get; set; }

        [Required]
        [StringLength(40, MinimumLength = 6)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*\d).+$")]
        public required string NewPassword { get; set; }
    }
}
