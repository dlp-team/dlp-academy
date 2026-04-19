// src/pages/Home/components/HomeLoader.tsx
import React from 'react';
import HomeContentSkeleton from './HomeContentSkeleton';

type HomeLoaderProps = {
    fullPage?: boolean;
};

const HomeLoader = ({ fullPage = false }: HomeLoaderProps) => {
    if (fullPage) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
                <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <HomeContentSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="py-6">
            <HomeContentSkeleton />
        </div>
    );
};

export default HomeLoader;