import React from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
    GLOBAL_BRAND_DEFAULTS,
    resolveInstitutionBranding,
    buildGlobalBrandCssVariables
} from '../utils/themeTokens';

const useInstitutionBranding = (user) => {
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
            (institutionSnapshot) => {
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
        const cssVariables = buildGlobalBrandCssVariables(branding.primaryColor);

        Object.entries(cssVariables).forEach(([variable, value]) => {
            root.style.setProperty(variable, value);
        });
    }, [branding.primaryColor]);

    return branding;
};

export default useInstitutionBranding;
