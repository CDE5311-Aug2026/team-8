// A static Vite deployment works without credentials or API routes.
// Real services can still be explicitly enabled in a separate environment.
export const localDemo=import.meta.env.VITE_ENABLE_BACKEND!=='true';
