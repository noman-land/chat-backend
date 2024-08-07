export const isOlderThan5Minutes = (timestamp: number) => {
  return timestamp < Date.now() - 5 * 60 * 1000;
};
