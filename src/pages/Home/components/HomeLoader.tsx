// src/pages/Home/components/HomeLoader.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';

type HomeLoaderProps = {
    fullPage?: boolean;
};

const HomeLoader = ({ fullPage = false }: HomeLoaderProps) => {
    if (fullPage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
                <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
    );
};

export default HomeLoader;