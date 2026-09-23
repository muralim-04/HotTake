using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace practice_dotnet.Services.BlobService
{
    public class BlobService : IBlobService
    {
        private readonly BlobContainerClient _containerClient;
        public BlobService(IConfiguration config)
        {
            _containerClient = new BlobContainerClient(
                config["AzureBlobStorage:ConnectionString"],
                config["AzureBlobStorage:ContainerName"]);

        }

        public async Task DeleteImageFile(string imageUrl)
        {
            if (string.IsNullOrWhiteSpace(imageUrl)) return;

            if (Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri))
            {
                var blobName = Path.GetFileName(uri.LocalPath);
                await _containerClient.GetBlobClient(blobName).DeleteIfExistsAsync();
            }   
        }

        public async Task<string> UploadImageAsync(IFormFile file)
        {
            var blobName = $"{Guid.NewGuid()}_{file.FileName}";
            var blobClient = _containerClient.GetBlobClient(blobName);

            var options = new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders { ContentType = file.ContentType }
            };

            await using var stream = file.OpenReadStream();
            await blobClient.UploadAsync(stream, options);

            return blobClient.Uri.ToString();
        }
    }
}
