// Don't need millisecond granularity
export const now = () => Math.floor(new Date().getTime() / 1000) * 1000;
