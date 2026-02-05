export const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
};

export const isRequired = (value: any) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
};
