import { createBrowserRouter } from 'react-router-dom';
import RootLayout from './layout/RootLayout';
import HomePage from './features/home/HomePage';
import UserPage from './features/user/UserPage';
import Register from './features/auth/RegisterPage';
import LogIn from './features/auth/LogInPage';
import PostDetail from './features/post/PostDetail';


export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />, 
    children: [
      {
        path: '', 
        element: <HomePage />,
        errorElement: <h2 style={{color: "red"}}>Something went wrong</h2>,
      },
      {
        path: 'user', 
        element: <UserPage />,
        errorElement: <h2 style={{color: "red"}}>Something went wrong</h2>,
      },
      {
        path: 'register', 
        element: <Register />,
      },
      {
        path: 'login', 
        element: <LogIn />,
      },
      {
        path: 'post/:id', 
        element: <PostDetail />,
      },
    ],
  },
]);