import { Outlet } from 'react-router-dom';
import Navbar from './Navabar';
import { Suspense } from 'react';

export default function RootLayout() {
  return (
    <div >
      <Navbar />

        <main className="p-6">
          <Suspense fallback={<p>Loading...</p>}>
            <Outlet />
          </Suspense>
        </main>

    </div>
  );
}