using System.ComponentModel.DataAnnotations;

namespace practice_dotnet.DTOs
{
    public class UserReqDto
    {
        [Required]
        [StringLength(40, MinimumLength =4)]
        public required string UserName { get; set; }

        [Required]
        [StringLength(40, MinimumLength = 6)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*\d).+$")]
        public required string Password { get; set; }

        [Required]
        [EmailAddress]
        public required string Email { get; set; }
    }
}
