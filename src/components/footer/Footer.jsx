import { BiBookReader } from "react-icons/bi";
import { Link, useLocation } from "react-router-dom";
import styles from "./footer.module.scss";

export default function Footer() {
  const location = useLocation();
  if (location.pathname.includes("auth")) return;

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
