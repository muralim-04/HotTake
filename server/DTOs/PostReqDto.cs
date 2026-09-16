using practice_dotnet.Entities;
using practice_dotnet.Validations;
using System.ComponentModel.DataAnnotations;

namespace practice_dotnet.DTOs
{
    public class PostReqDto
    {

        [Required]
        [StringLength(90, MinimumLength = 4)]
        public required string Content { get; set; }

        [MaxFileSize(5)]
        [AllowedExtensions(new string[] { ".jpg", ".jpeg", ".png", ".webp" })]
        public IFormFile? Image { get; set; }

    }
}
