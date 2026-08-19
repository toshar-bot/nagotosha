import styles from './decision-v3.module.css';

type Props = {
  onStart: () => void;
};

export function HeroV3({ onStart }: Props) {
  return (
    <section className={styles.heroStage} aria-labelledby="decision-v3-title">
      <h1 id="decision-v3-title" className={styles.srOnly}>
        今日は名古屋でどんな時間にする？
      </h1>
      <p className={styles.srOnly}>気分に近いものを選んで、今日の行き先はなごとしゃにまかせて。</p>
      <div className={styles.heroArtwork}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/decision/v3/hero/HERO_MASTER_1536x1024.png"
          alt=""
          aria-hidden="true"
          width={1536}
          height={1024}
          className={styles.heroImage}
        />
        <svg
          viewBox="0 0 1536 1024"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
          className={styles.heroMask}
        >
          <path
            d="M0 819 C220 807 670 806 930 812 C958 813 978 818 984 824 C986 876 986 940 978 978 C968 998 951 1014 928 1024 L0 1024 Z"
            fill="#F8F1DB"
          />
        </svg>
      </div>
      <div className={styles.heroAction}>
        <button type="button" className={styles.primaryButton} onClick={onStart}>
          条件からはじめる
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
