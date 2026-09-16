    export interface PostReq {
        content: string
        image: File | null
    }
 
    export interface PostRes {
        id: number
        userId: number
        username: string
        userProfileImageUrl: string
        content: string
        imageUrl: string | null
        likeCount: number
        isLikedByCurrentUser: boolean
        commentCount: number
        createdAt: string
    }

    export interface PaginationResult<T> {
        items: T[]
        pageNumber: number
        pageSize: number
        totalCount: number
        totalPages: number
        hasPreviousPage: boolean
        hasNextPage: boolean
    }
    
    export interface LikePostRes {
        postId: number
        isLiked: boolean
        likeCount: number
    }

    export interface CommentReq {
        postId: number
        comment: string
    }

    export interface CommentRes {
        id: number,
        postId: number,
        comment: string,
        createdAt: string,
        userId: number,
        username: string,
        userImageUrl: string
    }