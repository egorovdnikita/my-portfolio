import { useEffect, useState } from 'react';
import { MOBILE_MAX } from './canvas/layout';

/** true на телефоне (ширина до 767px включительно). */
export function useIsMobile() {
  const query = `(max-width: ${MOBILE_MAX}px)`;
  const [mobile, setMobile] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMobile(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return mobile;
}
