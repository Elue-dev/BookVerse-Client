import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  REMOVE_ACTIVE_USER,
} from "../../redux/slices/auth.slice";
import styles from "./navlinks.module.scss";
import { errorToast } from "../../../utils/alerts";
import axios from "axios";
import { SERVER_URL } from "../../../utils/variables";
import { BsSearch } from "react-icons/bs";

export default function Navlinks() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logoutUser = async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        `${SERVER_URL}/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      setLoading(false);
      dispatch(REMOVE_ACTIVE_USER());
      response && navigate("/");
    } catch (error) {
      setLoading(false);
      errorToast(error.response.data.message);
    }
  };

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
        <li onClick={logoutUser}>Logout</li>
      </ul>
    </div>
  );
}
