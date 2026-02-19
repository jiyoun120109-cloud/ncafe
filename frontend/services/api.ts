// API basic configuration (Placeholder)
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8011/api';

export const fetcher = async (url: string, options?: RequestInit) => {
    const res = await fetch(`${API_URL}${url}`, options);
    if (!res.ok) {
        throw new Error('An error occurred while fetching the data.');
    }
    return res.json();
};
