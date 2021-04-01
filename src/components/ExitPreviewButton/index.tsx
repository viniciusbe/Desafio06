import Link from 'next/link';

import styles from './exitPreviewButton.module.scss';

export default function ExitPreviewButton(): JSX.Element {
  return (
    <Link href="/api/exit-preview">
      <section className={styles.exitPreview}>
        <a>Sair do modo Preview</a>
      </section>
    </Link>
  );
}
