import React from 'react';
import { Bell } from 'lucide-react';

const Header = () => {
    return (
        <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm shrink-0">
            <h2 className="text-xl font-semibold text-slate-800">New Credit Memo Analysis</h2>

            <div className="flex items-center space-x-4">
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full dark-hover">
                    <Bell size={20} />
                </button>
            </div>
        </header>
    );
};

export default Header;
