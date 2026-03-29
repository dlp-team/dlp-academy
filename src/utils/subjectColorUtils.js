// src/utils/subjectColorUtils.js
export const getIconColor = (gradientString) => {
    if (!gradientString) return 'text-gray-900';
    const parts = String(gradientString).split(' ');
    const baseToColor = parts.find(part => part.startsWith('to-'));
    const darkToColor = parts.find(part => part.startsWith('dark:to-'));

    const classes = [];
    if (baseToColor) {
        classes.push(baseToColor.replace('to-', 'text-'));
    }
    if (darkToColor) {
        classes.push(darkToColor.replace('dark:to-', 'dark:text-'));
    }

    return classes.length > 0 ? classes.join(' ') : 'text-gray-900';
};