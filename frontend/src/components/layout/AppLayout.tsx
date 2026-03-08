import { lazy, Suspense, useState } from "react";
import { Outlet } from "react-router-dom";

const Sidebar = lazy(() =>
  import("./Sidebar").then((module) => ({ default: module.Sidebar })),
);
const MobileNavbar = lazy(() =>
  import("./MobileNavbar").then((module) => ({
    default: module.MobileNavbar,
  })),
);

export const AppLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop/Tablet Sidebar */}
      <Suspense
        fallback={
          <div className="hidden md:block w-20 border-r border-divider" />
        }
      >
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile Header */}
        <Suspense
          fallback={<div className="md:hidden h-16 border-b border-divider" />}
        >
          <MobileNavbar />
        </Suspense>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
