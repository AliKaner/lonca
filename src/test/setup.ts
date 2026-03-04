import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// global cleanup after each test
afterEach(() => {
  cleanup();
});
