using practice_dotnet.DTOs;
using practice_dotnet.Helpers;

namespace practice_dotnet.Services.PostServices
{
    public interface IPostService
    {
        Task<Response<PostResDto>> CreatePost(PostReqDto post, int userId);
        Task<Response<PostResDto>> GetPost(int postId, int? userId = null);
        Task<Response<PagedResult<PostResDto>>> GetAllPosts(int pageNumber, int pageSize, int? userId = null);
        Task GetUserPosts();
        Task EditPost();
        Task<Response<bool>> DeletePost(int postId, int userId, bool isAdmin);

        // COMMENTS SECTION
        Task<Response<CommentResDto>> CreateComment(int userId, CommentReqDto comment);
        Task<Response<PagedResult<CommentResDto>>> GetPostComments(int pageNumber, int pageSize, int postId);
        Task GetUserComments();
        Task EditComment();
        Task DeleteComment();

        // LIKES SECTION
        Task<Response<LikeResDto>> LikePost(int userId, int postId);
        Task GetUserLikedposts();
    }
}
