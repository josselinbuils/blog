export function debounce<T>(
  callback: (...args: T[]) => void,
  delay: number
): (...args: T[]) => void {
  let timerId: NodeJS.Timeout;

  return (...args: T[]) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}
