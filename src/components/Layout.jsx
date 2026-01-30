import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <>
            <Navbar />
            <main className="main-content">
                {children}
            </main>
            <style>{`
        .main-content {
          padding-top: 2rem;
          padding-bottom: 2rem;
          min-height: calc(100vh - 70px); /* Adjust based on navbar height */
        }
      `}</style>
        </>
    );
};

export default Layout;
