using System.ComponentModel.DataAnnotations;

namespace practice_dotnet.DTOs
{
    public class UpdateUserDto
    {
        [StringLength(30, MinimumLength = 3)]
        public required string UserName { get; set; }

        [StringLength(90, MinimumLength = 3)]
        public required string Bio { get; set; }
    }
}
