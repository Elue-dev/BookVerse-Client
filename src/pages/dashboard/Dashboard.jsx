import { useRef, useState } from "react";
import {
  getCurrentUser,
  REMOVE_ACTIVE_USER,
  SET_ACTIVE_USER,
} from "../../redux/slices/auth.slice";
import { useDispatch, useSelector } from "react-redux";
import { IoMdArrowDropdown } from "react-icons/io";
import { MdOutlineArrowDropUp } from "react-icons/md";
import styles from "./dashboard.module.scss";
import { httpRequest } from "../../../services/httpRequest";
import {
  CLOUD_NAME,
  SERVER_URL,
  UPLOAD_PRESET,
} from "../../../utils/variables";
import { errorToast, successToast } from "../../../utils/alerts";
import { PulseLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import UserBooks from "./user_books/UserBooks";
import { CiLogout } from "react-icons/ci";
import axios from "axios";

export default function Dashboard() {
  const currentUser = useSelector(getCurrentUser);
  const initialState = {
    username: currentUser.username,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
  const [credentials, setCredentials] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const imageRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { username, oldPassword, newPassword, confirmPassword } = credentials;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  let imageUrl;
  const uploadUserImage = async () => {
    const img = new FormData();
    img.append("file", image);
    img.append("cloud_name", CLOUD_NAME);
    img.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "post", body: img }
    );
    const imageData = await response.json();
    imageUrl = imageData?.url?.toString();
    setImage(null);
    setImagePreview(null);
  };

  const updateUserCredentials = async (e) => {
    e.preventDefault();

    if (
      username === currentUser.username &&
      !image &&
      !newPassword &&
      !oldPassword
    ) {
      return errorToast("You have not made any changes to your credentials");
    }

    if (newPassword !== confirmPassword)
      return errorToast("New password credentials do not match");

    setLoading(true);
    try {
      image && (await uploadUserImage());

      const userDetails = {
        username,
        email: currentUser.email,
        password: newPassword,
        oldPassword,
        confirmPassword,
        image: imageUrl || currentUser.img,
      };
      const response = await httpRequest.patch(
        `${SERVER_URL}/users/${currentUser.id}`,
        userDetails
      );

      if (response) {
        setLoading(false);
        dispatch(SET_ACTIVE_USER(response.data.user));

        if (newPassword) {
          successToast(
            `${response.data.message}. You changed your password, Please log in again`
          );
          dispatch(REMOVE_ACTIVE_USER());
          navigate("/auth");
        } else {
          successToast(response.data.message);
        }
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      errorToast(error.response.data.message);
    }
  };

  const logoutUser = async () => {
    setLoading(true);

    try {
      const response = await httpRequest.post(`${SERVER_URL}/auth/logout`);
      setLoading(false);
      dispatch(REMOVE_ACTIVE_USER());
      response && navigate("/");
    } catch (error) {
      setLoading(false);
      errorToast(error.response.data.message);
    }
  };

  return (
    <section className={styles.dashboard}>
      <div className={styles["left__section"]}>
        <div className={styles.card}>
          <p className={styles.logout} onClick={logoutUser}>
            <CiLogout />
            <span>Log out</span>
          </p>
          <div>
            <img
              src={imagePreview ? imagePreview : currentUser.img}
              alt={currentUser.username}
            />
            <button onClick={() => imageRef.current.click()}>
              Change Picture
            </button>
            <input
              type="file"
              onChange={(e) => handleImageChange(e)}
              accept="image/*"
              className={styles["image__upload"]}
              ref={imageRef}
              name="image"
              id="image"
            />
          </div>
          <form onSubmit={updateUserCredentials}>
            <label>
              <span>Username</span>
              <input
                type="text"
                value={username}
                name="username"
                onChange={handleInputChange}
              />
            </label>
            <br />
            <label>
              <span>Email</span>
              <input type="text" value={currentUser.email} disabled />
            </label>
            <br />
            <div>
              <p
                className={styles["password__reveal"]}
                onClick={() => setShowPassword(!showPassword)}
              >
                Change Password{" "}
                {showPassword ? (
                  <MdOutlineArrowDropUp />
                ) : (
                  <IoMdArrowDropdown />
                )}
              </p>
              {showPassword && (
                <div className={styles["password__sec"]}>
                  <label>
                    <span>Old Password</span>
                    <input
                      type="password"
                      name="oldPassword"
                      value={oldPassword}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    <span>New Password</span>
                    <input
                      type="password"
                      name="newPassword"
                      value={newPassword}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    <span>Confirm New Password</span>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={handleInputChange}
                    />
                  </label>
                </div>
              )}
            </div>

            {loading ? (
              <button type="button" disabled>
                <PulseLoader loading={loading} size={10} color={"#746ab0"} />
              </button>
            ) : (
              <button type="submit" className={styles.submit}>
                Update Credentials
              </button>
            )}
          </form>
        </div>
      </div>
      <div className={styles["right__section"]}>
        <UserBooks currentUser={currentUser} />
      </div>
    </section>
  );
}
