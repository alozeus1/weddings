"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "none";
};

export function Reveal({
  children,
  className,
  delay = 0,
  duration = 700,
  direction = "up"
}: RevealProps): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Determine if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (prefersReducedMotion.matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const baseClasses = "transition-all ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0";
  
  let hiddenClasses = "opacity-0";
  if (direction === "up") hiddenClasses += " translate-y-6";
  
  const visibleClasses = "opacity-100 translate-y-0";

  return (
    <div
      ref={ref}
      className={cn(
        baseClasses,
        isVisible ? visibleClasses : hiddenClasses,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}
