import { render } from '@testing-library/react';

import FeatureLib from './feature-lib';

describe('FeatureLib', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FeatureLib />);
    expect(baseElement).toBeTruthy();
  });
});
