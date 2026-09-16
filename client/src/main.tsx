import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { router } from './router.tsx'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}> 
      <Toaster position="bottom-left" />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
