import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSearchPlus } from "react-icons/fa";
import { MdOutlineSearchOff } from "react-icons/md";
import { useDispatch } from "react-redux";
import { CLOSE_MODAL, SHOW_MODAL } from "../../redux/slices/modal.slice";
import styles from "./navlinks.module.scss";

export default function Navlinks() {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState(false);

  useEffect(() => {
    setSearch(false);
  }, [pathname]);

  if (pathname.includes("auth")) return;

  const handleShowSearch = () => {
    setSearch(true);
    navigate("/");
    dispatch(SHOW_MODAL());
  };

  const handleCloseSearch = () => {
    dispatch(CLOSE_MODAL());
    setSearch(false);
  };

  return (
    <div className={styles.navlinks}>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/books">Books</Link>
        </li>
        <li>
          <Link to="/add-book?action=new">Add Book</Link>
        </li>
        {location.pathname === "/" && (
          <li className={styles["search__icon"]}>
            {search ? (
              <MdOutlineSearchOff
                onClick={handleCloseSearch}
                style={{ fontSize: "1.5rem" }}
              />
            ) : (
              <FaSearchPlus
                onClick={handleShowSearch}
                style={{ fontSize: "1.34rem" }}
              />
            )}
          </li>
        )}
      </ul>
    </div>
  );
}
