import React, { useState } from 'react';
import { LayoutDashboard, FileText, Settings, PieChart, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils';

const Sidebar = () => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { path: '/', label: 'Analysis', icon: FileText },
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/editor', label: 'Editor', icon: PieChart },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className={cn(
            "bg-slate-900 text-white flex flex-col h-full border-r border-slate-800 transition-all duration-300 relative",
            isCollapsed ? "w-16" : "w-64"
        )}>
            {/* Collapse Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-6 bg-slate-800 border border-slate-700 rounded-full p-1 text-slate-400 hover:text-white transition-colors shadow-sm z-10"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            <div className={cn("p-6 flex items-center", isCollapsed ? "justify-center px-2" : "")}>
                <Link to="/" className="flex items-center overflow-hidden">
                    {isCollapsed ? (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center font-bold text-white shrink-0">
                            C
                        </div>
                    ) : (
                        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent whitespace-nowrap">
                            CreditMemo AI
                        </h1>
                    )}
                </Link>
            </div>

            <nav className="flex-1 px-2 space-y-2 overflow-hidden">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center px-3 py-3 rounded-lg transition-colors group relative",
                                isActive ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:bg-slate-800 hover:text-white",
                                isCollapsed && "justify-center"
                            )}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <Icon size={20} className="shrink-0" />
                            {!isCollapsed && (
                                <span className="font-medium ml-3 whitespace-nowrap opacity-100 transition-opacity duration-200">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 overflow-hidden">
                <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
                    {!isCollapsed && (
                        <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold shrink-0">
                                {user?.name ? user.name.charAt(0) : 'U'}
                            </div>
                            <div className="text-sm overflow-hidden">
                                <p className="text-white font-medium truncate w-24">{user?.name || 'User'}</p>
                                <p className="text-slate-500 text-xs truncate">Analyst</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={logout}
                        className={cn(
                            "text-slate-500 hover:text-white transition-colors",
                            isCollapsed && "p-2 hover:bg-slate-800 rounded-lg"
                        )}
                        title="Sign Out"
                    >
                        <LogOut size={isCollapsed ? 20 : 18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
