// src/components/home/SearchBar.jsx
import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ searchTerm, onSearch, placeholder = "Buscar en todas las capas..." }) => {
    return (
        <div className={`
            group flex items-center 
            bg-white dark:bg-slate-900 
            border border-gray-200 dark:border-slate-700 
            rounded-xl shadow-sm 
            transition-all duration-300 ease-in-out
            ${searchTerm ? 'w-64' : 'w-12 hover:w-64 focus-within:w-64'}
            overflow-hidden
        `}>
            <div className="flex-shrink-0 p-3 text-gray-500 dark:text-gray-400 cursor-pointer">
                <Search className="w-5 h-5" />
            </div>
            <input 
                type="text"
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 text-sm placeholder-gray-400 dark:placeholder-gray-500 pr-3"
            />
            {searchTerm && (
                <button 
                    onClick={() => onSearch('')}
                    className="p-2 mr-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default SearchBar;
