using practice_dotnet.DTOs;
using practice_dotnet.Entities;
using practice_dotnet.Helpers;

namespace practice_dotnet.Services.UserServices
{
    public interface IUserService
    {
        Task<Response<UserProfileDto>> GetUserProfile(int id);
        Task<Response<UserResDto>> UpdateUserDeatail(int userId, UpdateUserDto dto);
        Task<Response<UserResDto>> UpdateUserAvatar(int userId, AvatarDto dto);
        Task<Response<bool>> UpdateUserPassword(int userId, UpdatePasswordDto dto);
        Task<Response<bool>> DeleteAccount(int id);

        //  ADMIN SECTION
        Task<Response<PagedResult<UserResDto>>> GetAllUsers(int pageNumber = 1, int pageSize = 10);
        Task<Response<bool>> MakeAdmin(int id);

    }
}
