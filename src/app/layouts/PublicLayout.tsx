import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { PageTransition } from '@/components/animations/PageTransition';
import { useScrollToTop } from '@/hooks/useScrollToTop';

export function PublicLayout() {
  const { pathname } = useLocation();
  useScrollToTop();

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary text-text-primary print:min-h-0 print:bg-white print:text-slate-900">
      <Navbar />
      <main id="main-content" className="flex-1">
        <PageTransition key={pathname}>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
