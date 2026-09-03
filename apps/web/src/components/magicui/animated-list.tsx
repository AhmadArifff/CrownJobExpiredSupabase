'use client';

import React, {
  ComponentPropsWithoutRef,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
  const animations = {
    initial: { scale: 0.92, opacity: 0, y: -12 },
    animate: { scale: 1, opacity: 1, y: 0, originY: 0 },
    exit: { scale: 0.92, opacity: 0, y: 12 },
    transition: { type: 'spring' as const, stiffness: 350, damping: 30 },
  };

  return (
    <motion.div {...animations} layout className="mx-auto w-full">
      {children}
    </motion.div>
  );
}

export interface AnimatedListProps extends ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
  delay?: number;
  repeat?: boolean;
  disableAnimation?: boolean;
}

export const AnimatedList = React.memo(
  ({
    children,
    className,
    delay = 600,
    repeat = false,
    disableAnimation = false,
    ...props
  }: AnimatedListProps) => {
    const childrenArray = useMemo(
      () => React.Children.toArray(children),
      [children],
    );

    const [index, setIndex] = useState(0);

    // Reset index when items change
    useEffect(() => {
      setIndex(0);
    }, [childrenArray.length]);

    useEffect(() => {
      if (disableAnimation) return;
      if (childrenArray.length === 0) return;
      if (!repeat && index >= childrenArray.length - 1) return; // Do NOT repeat, stop once all are shown!

      const timeout = setTimeout(() => {
        setIndex((prevIndex) => {
          if (repeat) {
            return (prevIndex + 1) % childrenArray.length;
          }
          return Math.min(prevIndex + 1, childrenArray.length - 1);
        });
      }, delay);

      return () => clearTimeout(timeout);
    }, [childrenArray.length, delay, index, repeat, disableAnimation]);

    const itemsToShow = useMemo(() => {
      if (childrenArray.length === 0) return [];
      if (disableAnimation) return childrenArray;
      return childrenArray.slice(0, index + 1).reverse();
    }, [index, childrenArray, disableAnimation]);

    if (disableAnimation) {
      return (
        <div
          className={`flex flex-col items-center gap-3 ${className || ''}`}
          {...props}
        >
          {childrenArray.map((item) => (
            <div key={(item as React.ReactElement).key} className="w-full">
              {item}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        className={`flex flex-col items-center gap-3 ${className || ''}`}
        {...props}
      >
        <AnimatePresence mode="popLayout">
          {itemsToShow.map((item) => (
            <AnimatedListItem key={(item as React.ReactElement).key}>
              {item}
            </AnimatedListItem>
          ))}
        </AnimatePresence>
      </div>
    );
  },
);

AnimatedList.displayName = 'AnimatedList';
