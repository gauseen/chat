import { useEffect, useRef } from 'react';

const useScrollToView = () => {
  const scrollContainerRef = useRef<HTMLElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  const scrollBottom = () => {
    setTimeout(() => {
      ref.current?.scrollIntoView?.();
    }, 0);
  };

  useEffect(() => {
    const scrollContainerDom = scrollContainerRef?.current;
    const { height: scrollContainerHeight } =
      scrollContainerDom?.getBoundingClientRect() || { height: 0 };
    const { top = 0 } = ref.current?.getBoundingClientRect() || {};

    // console.log('top, scrollContainerHeight: ', top, scrollContainerHeight);
    if (top - scrollContainerHeight > -1 && top - scrollContainerHeight < 100) {
      scrollBottom();
    }
  });

  return {
    inspection: <div ref={ref} className="chat-scroll-to-view" />,
    scrollContainerRef,
    scrollBottom,
  };
};

export default useScrollToView;
