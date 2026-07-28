import Image from 'next/image';
import styles from './home-functional.module.css';

export default function HomeHero() {
  return (
    <section
      className={styles.hero}
      aria-labelledby="decision-home-title"
      aria-describedby="decision-home-description"
    >
      <h1 id="decision-home-title" className={styles.visuallyHidden}>
        今日は名古屋でどんな時間にする？
      </h1>
      <p id="decision-home-description" className={styles.visuallyHidden}>
        気分に近いものを選んで
        今日の行き先はなごとしゃに任せて
      </p>
      <div className={styles.heroArtwork} aria-hidden="true">
        <Image
          className={styles.heroPhoto}
          src="/decision/home-functional/home-hero-final-v1.webp"
          alt=""
          aria-hidden="true"
          width={1536}
          height={1024}
          priority
          unoptimized
          sizes="(max-width: 430px) 100vw, 430px"
        />
        <svg
          className={styles.heroCategoryMask}
          viewBox="0 0 1536 1024"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M0 819 C220 807 670 806 930 812 C958 813 978 818 984 824 C986 876 986 940 978 978 C968 998 951 1014 928 1024 L0 1024 Z" />
        </svg>
      </div>
    </section>
  );
}
