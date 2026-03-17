/**
 * Universal Slug Generator
 * Standardized with the Python intelligent_fetcher.py script
 */
export const generateSlug = (name: string): string => {
  if (!name) return 'unknown-asset';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
