using System.ComponentModel.DataAnnotations;

namespace practice_dotnet.DTOs
{
    public class CommentReqDto
    {
        [Required]
        public int PostId { get; set; }

        [Required]
        [StringLength(90, MinimumLength = 4)]
        public required string Comment { get; set; }
    }
}
