import { render } from '@testing-library/react';

import DataFetcher from './data-fetcher';

describe('DataFetcher', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DataFetcher />);
    expect(baseElement).toBeTruthy();
  });
});
