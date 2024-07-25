export const isOlderThan5Minutes = (timestamp: string) => {
  return parseInt(timestamp, 10) < Date.now() - 5 * 60 * 1000;
};
