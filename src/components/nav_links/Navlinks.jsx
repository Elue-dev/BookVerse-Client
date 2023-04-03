import { Link, useLocation } from "react-router-dom";
import styles from "./navlinks.module.scss";
import { BsSearch } from "react-icons/bs";

export default function Navlinks() {
  const location = useLocation();

  if (location.pathname.includes("auth")) return;

  return (
    <div className={styles.navlinks}>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/featured">Featured</Link>
        </li>
        <li>
          <Link to="/add-book?action=new">Add Book</Link>
        </li>
        <li className={styles["search__icon"]}>
          <Link to="/account">
            <BsSearch />
          </Link>
        </li>
      </ul>
    </div>
  );
}
