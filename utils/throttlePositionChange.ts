let lastCall = 0;
let timeoutId: NodeJS.Timeout | null = null;

export const throttleOnPositionChange = (
  callback: (id: string, position: { x: number; y: number }) => void,
  delay = 300
) => {
  return (id: string, position: { x: number; y: number }) => {
    const now = Date.now();
    const remaining = delay - (now - lastCall);

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      callback(id, position);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        callback(id, position);
        timeoutId = null;
      }, remaining);
    }
  };
};
