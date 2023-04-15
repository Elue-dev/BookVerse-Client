import { useEffect, useRef, useState } from "react";
import { TfiImage } from "react-icons/tfi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import styles from "./add.book.module.scss";
import { CLOUD_NAME, UPLOAD_PRESET } from "../../../utils/variables";
import { errorToast, successToast } from "../../../utils/alerts";
import { useLocation, useNavigate } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import { httpRequest } from "../../../services/httpRequest";
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentUser,
  getUserToken,
  SAVE_URL,
} from "../../redux/slices/auth.slice";
import toast from "react-hot-toast";

export default function AddBook() {
  const currentUser = useSelector(getCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    setTitle(() => {
      if (!currentUser) {
        dispatch(SAVE_URL(pathname));
        navigate("/auth");
        return;
      }
    }, 500);
  }, []);

  const state = useLocation().state;
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [genre, setSelectedGenre] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const imageRef = useRef();
  const [imagePreview, setImagePreview] = useState(null);
  const token = useSelector(getUserToken);
  const authHeaders = { headers: { authorization: `Bearer ${token}` } };

  const queryString = useLocation().search;
  const queryParams = new URLSearchParams(queryString);
  const action = queryParams.get("action");

  useEffect(() => {
    switch (action) {
      case "new":
        setTitle("");
        setDescription("");
        setPrice("");
        setSelectedGenre("");
        break;
      case "edit":
        setTitle(state?.title);
        setDescription(state?.description);
        setPrice(state?.price);
        setSelectedGenre(state?.category);
      default:
        "";
    }
  }, [action]);

  const parseText = (html) => {
    const value = new DOMParser().parseFromString(html, "text/html");
    return value.body.textContent;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const genres = [
    "Fantasy",
    "Mystery",
    "Sci-Fi",
    "Thriller",
    "Contemporary",
    "Poetry",
    "Fiction",
    "Drama",
  ];

  let imageUrl;
  const queryClient = useQueryClient();

  const mutation = useMutation(
    (newBook) => {
      return httpRequest.post("/books", newBook, authHeaders);
    },
    {
      onSuccess: (data) => {
        toast.dismiss();
        successToast(data?.data?.message);
        queryClient.invalidateQueries(["books"]);
      },
      onError: (err) => {
        toast.dismiss();
        setLoading(false);
        errorToast(err?.response?.data.message);
        // console.log("ERROR", err);
      },
    }
  );

  const updateMutation = useMutation(
    (updatedbook) => {
      return httpRequest.patch(`/books/${state.id}`, updatedbook, authHeaders);
    },
    {
      onSuccess: (data) => {
        toast.dismiss();
        successToast(data.data.message);
        queryClient.invalidateQueries(["books"]);
      },
      onError: (err) => {
        toast.dismiss();
        setLoading(false);
        errorToast(err?.response?.data.message);
        console.log("ERROR", err);
      },
    }
  );

  const uploadBookImage = async () => {
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
  };

  const addBook = async () => {
    toast.dismiss();

    if (title && !/^[A-Za-z0-9\s]+$/.test(title))
      return errorToast("Book title contains unwanted characters");

    if (
      description &&
      !/^[A-Za-z0-9\s.,;:'"!?()@#$%^&*+=<>\/\\\[\]\{\}-]*$/.test(description)
    )
      return errorToast("Book description contains unwanted characters");

    const fields = { title, description, genre, price, image };
    let missingFields = [];

    for (let field in fields) {
      if (!fields[field]) missingFields.push(field);
    }

    if (missingFields.length > 0)
      return errorToast(
        `${missingFields.join(", ")} ${
          missingFields.length > 1 ? "are" : "is"
        } required`
      );

    const convertedPrice = parseFloat(price);

    if (isNaN(convertedPrice) || !Number.isFinite(convertedPrice))
      return errorToast("price must be a number");

    setLoading(true);

    toast.loading("Adding book...");

    await uploadBookImage();

    await mutation.mutateAsync({
      title,
      description: parseText(description),
      price,
      date: new Date(),
      category: genre,
      image: imageUrl,
    });
    setLoading(false);
    setImage(null);
    setImagePreview(null);
    navigate("/");
  };

  const updateBook = async () => {
    toast.dismiss();
    const fields = { title, description, genre, price };

    if (title && !/^[A-Za-z0-9\s]+$/.test(title))
      return errorToast("Book title contains unwanted characters");

    if (typeof price !== "number" || isNaN(price) || !Number.isFinite(price))
      return errorToast("price must be a number");

    if (description && !/^[A-Za-z0-9\s]+$/.test(description))
      return errorToast("Book description contains unwanted characters");

    let missingFields = [];

    for (let field in fields) {
      if (!fields[field]) missingFields.push(field);
    }

    if (missingFields.length > 0)
      return errorToast(
        `${missingFields.join(", ")} ${
          missingFields.length > 1 ? "are" : "is"
        } required`
      );

    if (isNaN(price)) return errorToast("Price must be a number");

    setLoading(true);
    toast.loading("Updating book...");

    image && (await uploadBookImage());
    await updateMutation.mutateAsync({
      title,
      description: parseText(description),
      price,
      category: genre,
      image: imageUrl || state.bookimg,
    });
    setLoading(false);
    setImage(null);
    setImagePreview(null);
    navigate("/");
  };

  return (
    <section className={styles["add__book"]}>
      <div className={styles["left__section"]}>
        <div className={styles.top}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Book title..."
          />
          <input
            type="number"
            value={price}
            min={1}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Book price..."
          />
        </div>
        <div className={styles["editor__cont"]}>
          <ReactQuill
            theme="snow"
            className={styles.editor}
            value={description}
            onChange={setDescription}
            placeholder="Enter book description here..."
          />
        </div>
      </div>
      <div className={styles["right__section"]}>
        {state ? (
          <>
            <img
              className={styles.bookimg}
              src={imagePreview ? imagePreview : state.bookimg}
            />
            <p onClick={() => imageRef.current.click()}>Change Image</p>
            <input
              type="file"
              onChange={(e) => handleImageChange(e)}
              accept="image/*"
              className={styles["image__upload"]}
              style={{ display: "none" }}
              ref={imageRef}
              name="image"
              id="image"
            />
          </>
        ) : (
          <form className={styles.container}>
            <div onClick={() => imageRef.current.click()}>
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt={title}
                    className={styles.preview}
                  />
                  <p>Change Image</p>
                  <input
                    type="file"
                    onChange={(e) => handleImageChange(e)}
                    accept="image/*"
                    className={styles["image__upload"]}
                    style={{ display: "none" }}
                    ref={imageRef}
                    name="image"
                    id="image"
                  />
                </>
              ) : (
                <>
                  <TfiImage className={styles["image__icon"]} />
                  <p style={{ textAlign: "center" }}>Add Book Image</p>
                  <input
                    type="file"
                    onChange={(e) => handleImageChange(e)}
                    accept="image/*"
                    className={styles["image__upload"]}
                    ref={imageRef}
                    name="image"
                    id="image"
                  />
                </>
              )}
            </div>
          </form>
        )}

        <div className={styles.genres}>
          <h4>Select Book Genre</h4>
          <div className={styles.genre}>
            {genres.map((g) => (
              <div key={g}>
                <input
                  type="radio"
                  value={g}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  checked={genre === g}
                />{" "}
                {g}
              </div>
            ))}
          </div>

          <div className={styles["add__btn"]}>
            {loading ? (
              <button type="button" disabled>
                <PulseLoader loading={loading} size={10} color={"#746ab0"} />
              </button>
            ) : (
              <button onClick={state ? updateBook : addBook}>
                {state ? "Update Book" : "Add Book"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
