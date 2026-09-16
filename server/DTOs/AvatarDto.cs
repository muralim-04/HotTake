using practice_dotnet.Validations;
using System.ComponentModel.DataAnnotations;

namespace practice_dotnet.DTOs
{
    public class AvatarDto
    {
        [Required]
        [MaxFileSize(5)]
        [AllowedExtensions(new string[] { ".jpg", ".jpeg", ".png", ".webp" })]
        public IFormFile? Image { get; set; }
    }
}
