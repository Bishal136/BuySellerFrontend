import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Check if current route is an admin or seller dashboard route
  const isDashboardRoute = 
    location.pathname.startsWith('/admin') || 
    (location.pathname.startsWith('/seller') && location.pathname !== '/seller/register');

  return (
    <div className="min-h-screen flex flex-col">
      {!isDashboardRoute && <Header />}
      <main className=" grow pt-o">
        {children}
      </main>
      {!isDashboardRoute && <Footer />}
    </div>
  );
};

export default Layout;