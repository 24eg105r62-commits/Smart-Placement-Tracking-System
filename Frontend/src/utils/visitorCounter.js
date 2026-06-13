const COUNT_KEY = 'vsmart-visitor-count';
const SESSION_KEY = 'vsmart-visitor-session';
const BASE_COUNT = 18420;

export const getVisitorCount = () => {
  if (typeof window === 'undefined') return BASE_COUNT;

  let count = Number(localStorage.getItem(COUNT_KEY));
  if (!count || Number.isNaN(count)) count = BASE_COUNT;

  if (!sessionStorage.getItem(SESSION_KEY)) {
    count += 1;
    sessionStorage.setItem(SESSION_KEY, '1');
    localStorage.setItem(COUNT_KEY, String(count));
  }

  return count;
};
