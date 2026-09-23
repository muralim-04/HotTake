namespace practice_dotnet.Services.BlobService
{
    public interface IBlobService
    {
        Task<string> UploadImageAsync(IFormFile file);
        Task DeleteImageFile(string imageUrl);
    }
}
