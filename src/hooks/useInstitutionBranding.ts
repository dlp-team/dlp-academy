import React from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
    GLOBAL_BRAND_DEFAULTS,
    resolveInstitutionBranding,
    buildGlobalBrandCssVariables
} from '../utils/themeTokens';

const useInstitutionBranding = (user: any) => {
    const institutionId = user?.institutionId || null;
    const [branding, setBranding] = React.useState(GLOBAL_BRAND_DEFAULTS);

    React.useEffect(() => {
        if (!institutionId) {
            setBranding(GLOBAL_BRAND_DEFAULTS);
            return;
        }

        const institutionDocRef = doc(db, 'institutions', institutionId);
        const unsubscribe = onSnapshot(
            institutionDocRef,
            (institutionSnapshot: any) => {
                if (!institutionSnapshot.exists()) {
                    setBranding(GLOBAL_BRAND_DEFAULTS);
                    return;
                }

                setBranding(resolveInstitutionBranding(institutionSnapshot.data()));
            },
            () => {
                setBranding(GLOBAL_BRAND_DEFAULTS);
            }
        );

        return () => unsubscribe();
    }, [institutionId]);

    React.useEffect(() => {
        const root = document.documentElement;
        const cssVariables = buildGlobalBrandCssVariables(branding);

        Object.entries(cssVariables).forEach(([variable, value]: any) => {
            root.style.setProperty(variable, value);
        });
    }, [branding]);

    React.useEffect(() => {
        const iconUrl = typeof branding?.iconUrl === 'string' ? branding.iconUrl.trim() : '';
        if (!iconUrl) return;

        let faviconLink = document.querySelector('link[rel="icon"]');
        if (!faviconLink) {
            faviconLink = document.createElement('link');
            faviconLink.setAttribute('rel', 'icon');
            document.head.appendChild(faviconLink);
        }

        faviconLink.setAttribute('href', iconUrl);
    }, [branding?.iconUrl]);

    React.useEffect(() => {
        const title = typeof branding?.browserTabTitle === 'string' ? branding.browserTabTitle.trim() : '';
        if (title) {
            document.title = title;
        }
    }, [branding?.browserTabTitle]);

    return branding;
};

export default useInstitutionBranding;
