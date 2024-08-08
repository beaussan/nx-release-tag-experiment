import styles from './components.module.css';
import { Theme } from '@nx-release-tag/design-system-theme';
import { Icons } from '@nx-release-tag/design-system-icons';

export function Components() {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Components!</h1>
      <Theme />
      <Icons />
    </div>
  );
}

export default Components;
