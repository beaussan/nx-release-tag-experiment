import styles from './data-fetcher.module.css';
import { Components } from '@nx-release-tag/design-system-components';
import { FeatureLib } from '@nx-release-tag/feature-lib';

export function DataFetcher() {
  return (
    <div className={styles['container']}>
      <h1>Welcome to DataFetcher!</h1>
      <Components />
      <FeatureLib />
    </div>
  );
}

export default DataFetcher;
