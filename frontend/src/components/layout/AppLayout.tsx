import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { motion } from 'framer-motion';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0" style={{ marginLeft: 240 }}>
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="p-6 min-h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
