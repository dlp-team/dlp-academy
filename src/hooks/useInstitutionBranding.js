import React from 'react';
import { doc, getDoc } from 'firebase/firestore';
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
        let isMounted = true;

        const loadInstitutionBranding = async () => {
            if (!institutionId) {
                if (isMounted) {
                    setBranding(GLOBAL_BRAND_DEFAULTS);
                }
                return;
            }

            try {
                const institutionDocRef = doc(db, 'institutions', institutionId);
                const institutionSnapshot = await getDoc(institutionDocRef);

                if (!isMounted) return;

                if (!institutionSnapshot.exists()) {
                    setBranding(GLOBAL_BRAND_DEFAULTS);
                    return;
                }

                setBranding(resolveInstitutionBranding(institutionSnapshot.data()));
            } catch {
                if (isMounted) {
                    setBranding(GLOBAL_BRAND_DEFAULTS);
                }
            }
        };

        loadInstitutionBranding();

        return () => {
            isMounted = false;
        };
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
