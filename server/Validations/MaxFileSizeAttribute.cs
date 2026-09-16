using System.ComponentModel.DataAnnotations;

namespace practice_dotnet.Validations
{
    public class MaxFileSizeAttribute : ValidationAttribute
    {
        private readonly int _maxFileSizeInBytes;

        public MaxFileSizeAttribute(int maxFileSizeInMegabytes)
        {
            _maxFileSizeInBytes = maxFileSizeInMegabytes * 1024 * 1024;
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is IFormFile file)
            {
                if (file.Length > _maxFileSizeInBytes)
                {
                    return new ValidationResult($"File size cannot exceed {_maxFileSizeInBytes / (1024 * 1024)} MB.");
                }
            }

            return ValidationResult.Success;
        }
    }
}
