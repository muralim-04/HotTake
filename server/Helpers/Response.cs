namespace practice_dotnet.Helpers
{
    public class Response<T>
    {
        public T? Data { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;

        public static Response<T> Fail(string message) => new() { Success = false, Message = message };
        public static Response<T> Ok(T data) => new() { Success = true, Data = data };
    }
}
