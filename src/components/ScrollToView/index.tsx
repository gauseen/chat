import { useEffect, useRef } from 'react';

const ScrollToView = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView?.();
  });

  return <div ref={ref} className="chat-scroll-to-view"></div>;
};

export default ScrollToView;
