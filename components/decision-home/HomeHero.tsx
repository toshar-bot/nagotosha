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
        条件を選んで、今日の行き先はなごとしゃに任せて。
      </p>
      <div className={styles.heroArtwork} aria-hidden="true">
        <Image
          className={styles.heroPhoto}
          src="/brand/hero-decision-concierge-home-v2.jpg"
          alt=""
          aria-hidden="true"
          width={1536}
          height={1024}
          priority
          sizes="(max-width: 448px) 100vw, 448px"
        />
      </div>
    </section>
  );
}
