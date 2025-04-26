import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  Info,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  // Close mobile sidebar on location change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location, isOpen, onClose]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: '登出成功',
          description: '您已成功登出系統',
        });
      },
    });
  };

  const navItems = [
    {
      path: '/',
      label: '儀表板',
      icon: <LayoutDashboard className="h-5 w-5 mr-3" />,
    },
    {
      path: '/appointments',
      label: '預約管理',
      icon: <Calendar className="h-5 w-5 mr-3" />,
    },
    {
      path: '/patients',
      label: '患者管理',
      icon: <Users className="h-5 w-5 mr-3" />,
    },
    {
      path: '/queue',
      label: '看診進度',
      icon: <MessageSquare className="h-5 w-5 mr-3" />,
    },
    {
      path: '/registration',
      label: '掛號系統',
      icon: <Info className="h-5 w-5 mr-3" />,
    },
    {
      path: '/reports',
      label: '報表分析',
      icon: <BarChart3 className="h-5 w-5 mr-3" />,
    },
    {
      path: '/settings',
      label: '系統設定',
      icon: <Settings className="h-5 w-5 mr-3" />,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-neutral-700 bg-opacity-50 z-20 lg:hidden transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        className={cn(
          'fixed lg:relative inset-y-0 left-0 w-64 bg-white shadow-lg z-30 transform transition-transform duration-300 ease-in-out flex flex-col h-full',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo and clinic name */}
        <div className="flex items-center p-4 border-b border-neutral-100">
          <div className="rounded-md bg-primary p-2 mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral-800">
              CLINIC LINK
            </h1>
            <p className="text-xs text-neutral-500">管理系統</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto no-scrollbar">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'flex items-center px-3 py-2.5 text-sm font-medium rounded-md',
                  location === item.path
                    ? 'bg-primary-light/10 text-primary'
                    : 'text-neutral-600 hover:bg-neutral-100',
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* User profile */}
        <div className="p-4 border-t border-neutral-100">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-primary-light/30 flex items-center justify-center text-primary font-medium overflow-hidden">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.fullName?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-700">
                {user?.fullName || '使用者'}
              </p>
              <p className="text-xs text-neutral-500">
                {user?.department || '員工'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto rounded-full p-1 text-neutral-400 hover:bg-neutral-100"
              aria-label="登出"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
