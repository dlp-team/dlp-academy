import React from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import {
    getEffectiveHomeThemeTokens,
    resolveInstitutionHomeThemeOverrides,
    resolveInstitutionHomeThemeColors,
    getEffectiveHomeThemeColors,
    buildHomeThemeCssVariables
} from '../../../utils/themeTokens';

export const useInstitutionHomeThemeTokens = (user) => {
    const institutionId = user?.institutionId || null;
    const [themeOverrides, setThemeOverrides] = React.useState(null);
    const [themeColorOverrides, setThemeColorOverrides] = React.useState(null);

    React.useEffect(() => {
        let isMounted = true;

        const loadInstitutionTheme = async () => {
            if (!institutionId) {
                if (isMounted) {
                    setThemeOverrides(null);
                    setThemeColorOverrides(null);
                }
                return;
            }

            try {
                const institutionDocRef = doc(db, 'institutions', institutionId);
                const institutionSnapshot = await getDoc(institutionDocRef);

                if (!isMounted) return;

                if (!institutionSnapshot.exists()) {
                    setThemeOverrides(null);
                    setThemeColorOverrides(null);
                    return;
                }

                const institutionData = institutionSnapshot.data();
                const resolvedOverrides = resolveInstitutionHomeThemeOverrides(institutionData);
                const resolvedColorOverrides = resolveInstitutionHomeThemeColors(institutionData);
                setThemeOverrides(resolvedOverrides || null);
                setThemeColorOverrides(resolvedColorOverrides || null);
            } catch {
                if (isMounted) {
                    setThemeOverrides(null);
                    setThemeColorOverrides(null);
                }
            }
        };

        loadInstitutionTheme();

        return () => {
            isMounted = false;
        };
    }, [institutionId]);

    return React.useMemo(() => {
        const tokens = getEffectiveHomeThemeTokens(themeOverrides);
        const colors = getEffectiveHomeThemeColors(themeColorOverrides);
        const cssVariables = buildHomeThemeCssVariables(colors);

        return {
            ...tokens,
            colors,
            cssVariables
        };
    }, [themeOverrides, themeColorOverrides]);
};

export default useInstitutionHomeThemeTokens;
