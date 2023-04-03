import { BiBookReader } from "react-icons/bi";
import { Link } from "react-router-dom";
import styles from "./footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>
        <Link to="/">
          <BiBookReader />
          <b>BOOKVERSE</b>
        </Link>
      </p>
      <p>&copy; {new Date().getFullYear()}. All Rights Reserved.</p>
    </footer>
  );
}
