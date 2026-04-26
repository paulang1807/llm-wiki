import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '',
}));

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
  default: (fn: any) => {
    const Component = (props: any) => {
      return null; // Or some mock component
    };
    return Component;
  },
}));
