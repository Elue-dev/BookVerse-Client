import styles from "./hero.module.scss";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles["hero__content"]}>
        <h1>Up to 80% Off</h1>
        <p>Let's find the perfect book for you</p>
        <button>See Books</button>
      </div>
    </section>
  );
}
