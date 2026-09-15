using practice_dotnet.Data;
using practice_dotnet.Entities;
using Microsoft.EntityFrameworkCore;
using practice_dotnet.Helpers;
using practice_dotnet.DTOs;
using Microsoft.Extensions.Configuration.UserSecrets;

namespace practice_dotnet.Services.PostServices
{
    public class PostService : IPostService
    {
        private readonly DataContext _context;
        private readonly IWebHostEnvironment _environment;
        public PostService(DataContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        public async Task<Response<CommentResDto>> CreateComment(int userId, CommentReqDto comment)
        {
            var postExists = await _context.UserPosts.AnyAsync(up => up.Id == comment.PostId);
            if (!postExists)
            {
                return Response<CommentResDto>.Fail("Post not found.");
            }

            var user = await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => new { u.UserName, u.AvatarUrl })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return Response<CommentResDto>.Fail("User not found.");
            }

            var newComment = new Comment 
            {
                PostId = comment.PostId,
                UserId = userId,
                Content = comment.Comment
            };

            _context.Comments.Add(newComment);
            await _context.SaveChangesAsync();

            var commentDto = new CommentResDto
            {
                Id = newComment.Id,
                PostId = newComment.PostId,
                Comment = newComment.Content,
                CreatedAt = newComment.CreatedAt,
                UserId = userId,
                Username = user.UserName,
                UserImageUrl = user.AvatarUrl
            };

            return Response<CommentResDto>.Ok(commentDto);
        }

        public async Task<Response<PostResDto>> CreatePost(PostReqDto post, int userId)
        {
            var user = await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => new { u.UserName, u.AvatarUrl })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return Response<PostResDto>.Fail("User was not found");
            }

            string? imageUrl = null;
            if (post.Image != null && post.Image.Length > 0)
            {
                imageUrl = await UploadImageAsync(post.Image);
            }

            var newPost = new UserPost
            {
                Content = post.Content,
                ImageUrl = imageUrl,
                UserId = userId
            };

            _context.UserPosts.Add(newPost);
            await _context.SaveChangesAsync();

            var userPostDto = new PostResDto
            {
                Id = newPost.Id,
                Content = newPost.Content,
                ImageUrl = newPost.ImageUrl,
                CreatedAt = newPost.CreatedAt,
                UserId = userId,
                Username = user.UserName,
                UserProfileImageUrl = user.AvatarUrl,
                LikeCount = 0,
                CommentCount = 0,
                IsLikedByCurrentUser = false
            };

            return Response<PostResDto>.Ok(userPostDto);
        }

        public Task DeleteComment()
        {
            throw new NotImplementedException();
        }

        public async Task<Response<bool>> DeletePost(int postId, int userId, bool isAdmin)
        {
            var post = await _context.UserPosts.FindAsync(postId);

            if (post == null)
            {
                return Response<bool>.Fail("Post not found.");
            }

            if (post.UserId != userId && !isAdmin)
            {
                return Response<bool>.Fail("Unauthorized");
            }

            if (!string.IsNullOrEmpty(post.ImageUrl))
            {
                DeleteImageFile(post.ImageUrl);
            }

            _context.UserPosts.Remove(post);
            await _context.SaveChangesAsync();

            return Response<bool>.Ok(true);
        }

        public Task EditComment()
        {
            throw new NotImplementedException();
        }

        public Task EditPost()
        {
            throw new NotImplementedException();
        }

        public async Task<Response<PagedResult<PostResDto>>> GetAllPosts(int pageNumber, int pageSize, int? userId = null)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var totalCount = await _context.UserPosts.CountAsync();

            var posts = await _context.UserPosts
                .OrderByDescending(up => up.CreatedAt)
                .ThenByDescending(up => up.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(up => new PostResDto
                {
                    Id = up.Id,
                    Content = up.Content,
                    ImageUrl = up.ImageUrl,
                    CreatedAt = up.CreatedAt,   
                    UserId = up.User.Id,
                    Username = up.User.UserName,
                    UserProfileImageUrl = up.User.AvatarUrl,
                    LikeCount = up.Likes.Count,
                    CommentCount = up.Comments.Count,
                    IsLikedByCurrentUser = userId.HasValue && up.Likes.Any(l => l.UserId == userId.Value)
                })
                .ToListAsync();

            var data = new PagedResult<PostResDto>
            {
                Items = posts,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return Response<PagedResult<PostResDto>>.Ok(data);
        }

        public async Task<Response<PostResDto>> GetPost(int postId, int? userId = null)
        {
            var post = await _context.UserPosts
                .Where(up => up.Id == postId)
                .Select(up => new PostResDto
                {
                    Id = up.Id,
                    Content = up.Content,
                    ImageUrl = up.ImageUrl,
                    CreatedAt = up.CreatedAt,
                    UserId = up.User.Id,
                    Username = up.User.UserName,
                    UserProfileImageUrl = up.User.AvatarUrl,
                    LikeCount = up.Likes.Count,
                    CommentCount = up.Comments.Count,
                    IsLikedByCurrentUser = userId.HasValue && up.Likes.Any(l => l.UserId == userId.Value)
                })
                .FirstOrDefaultAsync();

            if (post == null)
            {
                return Response<PostResDto>.Fail("Post with this ID doesn't exist.");
            }

            return Response<PostResDto>.Ok(post);

        }

        public Task GetPostComments()
        {
            throw new NotImplementedException();
        }

        public Task GetUserComments()
        {
            throw new NotImplementedException();
        }

        public Task GetUserLikedposts()
        {
            throw new NotImplementedException();
        }

        public Task GetUserPosts()
        {
            throw new NotImplementedException();
        }

        public async Task<Response<LikeResDto>> LikePost(int userId, int postId)
        {
            var postExists = await _context.UserPosts.AnyAsync(up => up.Id == postId);
            if (!postExists)
            {
                return Response<LikeResDto>.Fail("Post not found.");
            }

            var userLiked = await _context.PostLikes
                .FirstOrDefaultAsync(pl => pl.UserId == userId && pl.PostId == postId);

            bool isLiked;

            if (userLiked != null)
            {
                _context.PostLikes.Remove(userLiked);
                isLiked = false;
            }
            else
            {
                _context.PostLikes.Add(new PostLike
                {
                    PostId = postId,
                    UserId = userId
                });
                isLiked = true;
            }

            await _context.SaveChangesAsync();

            var likeCount = await _context.PostLikes.CountAsync(pl => pl.PostId == postId);

            var likeDto = new LikeResDto
            {
                PostId = postId,
                IsLiked = isLiked,
                LikeCount = likeCount
            };

            return Response<LikeResDto>.Ok(likeDto);

        }

        private async Task<string> UploadImageAsync(IFormFile file)
        {
            string uploadsFolder = Path.Combine(_environment.ContentRootPath, "Uploads");

            string uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/Uploads/{uniqueFileName}";
        }

        private void DeleteImageFile(string imageUrl)
        {
            try
            {
                string relativePath = imageUrl.TrimStart('/', '\\');

                string filePath = Path.Combine(_environment.ContentRootPath, relativePath);

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                } 
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to delete image file: {ex.Message}");
            }
        }
    }
}
