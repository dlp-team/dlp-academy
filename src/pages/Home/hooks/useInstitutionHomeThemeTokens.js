import React from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import {
    getEffectiveHomeThemeTokens,
    resolveInstitutionHomeThemeOverrides
} from '../../../utils/themeTokens';

export const useInstitutionHomeThemeTokens = (user) => {
    const institutionId = user?.institutionId || null;
    const [themeOverrides, setThemeOverrides] = React.useState(null);

    React.useEffect(() => {
        let isMounted = true;

        const loadInstitutionTheme = async () => {
            if (!institutionId) {
                if (isMounted) setThemeOverrides(null);
                return;
            }

            try {
                const institutionDocRef = doc(db, 'institutions', institutionId);
                const institutionSnapshot = await getDoc(institutionDocRef);

                if (!isMounted) return;

                if (!institutionSnapshot.exists()) {
                    setThemeOverrides(null);
                    return;
                }

                const institutionData = institutionSnapshot.data();
                const resolvedOverrides = resolveInstitutionHomeThemeOverrides(institutionData);
                setThemeOverrides(resolvedOverrides || null);
            } catch {
                if (isMounted) setThemeOverrides(null);
            }
        };

        loadInstitutionTheme();

        return () => {
            isMounted = false;
        };
    }, [institutionId]);

    return React.useMemo(() => getEffectiveHomeThemeTokens(themeOverrides), [themeOverrides]);
};

export default useInstitutionHomeThemeTokens;
