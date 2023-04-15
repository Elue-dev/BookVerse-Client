import { Link } from "react-router-dom";
import styles from "./error.page.module.scss";

export default function ErrorPage() {
  return (
    <section className={styles["error__page"]}>
      <h1>404 ❗️</h1>
      <p> We can’t seem to find the page you’re looking for </p>
      <Link to="/">
        <button>Go home</button>
      </Link>
    </section>
  );
}
