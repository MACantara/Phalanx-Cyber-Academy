import { Children, useContext, type ReactNode } from 'react';
import { AsyncLoadingContext } from './AsyncSection';

type Direction = 'up' | 'left' | 'right';

const animationClass: Record<Direction, string> = {
  up: 'animate-fade-in-up',
  left: 'animate-fade-in-left',
  right: 'animate-fade-in-right',
};

interface FadeInProps {
  delay?: string;
  direction?: Direction;
  className?: string;
  children: ReactNode;
}

export function FadeIn({ delay = '0s', direction = 'up', className = '', children }: FadeInProps) {
  const isAsync = useContext(AsyncLoadingContext);
  if (isAsync) {
    return <div className={className}>{children}</div>;
  }
  return (
    <div
      className={`opacity-0 ${animationClass[direction]} ${className}`}
      style={{ animationDelay: delay, animationFillMode: 'forwards' }}
    >
      {children}
    </div>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  baseDelay?: number;
  increment?: number;
  direction?: Direction;
}

export function Stagger({ children, className = '', baseDelay = 0.1, increment = 0.15, direction = 'up' }: StaggerProps) {
  const items = Children.toArray(children);
  return (
    <div className={className}>
      {items.map((child, i) => (
        <FadeIn key={i} delay={`${baseDelay + i * increment}s`} direction={direction}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
}
