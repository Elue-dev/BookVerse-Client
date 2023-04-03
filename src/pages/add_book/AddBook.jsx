import { useEffect, useRef, useState } from "react";
import { TfiImage } from "react-icons/tfi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import styles from "./add.book.module.scss";
import { CLOUD_NAME, UPLOAD_PRESET } from "../../../utils/variables";
import { errorToast, successToast } from "../../../utils/alerts";
import { useLocation, useNavigate } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import moment from "moment";
import { httpRequest } from "../../../services/httpRequest";

export default function AddBook() {
  const state = useLocation().state;
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [genre, setSelectedGenre] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const imageRef = useRef();
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

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
      return httpRequest.post("/books", newBook);
    },
    {
      onSuccess: (data) => {
        console.log(data);
        successToast(data.data.message);
        queryClient.invalidateQueries(["books"]);
      },
      onError: (err) => {
        setLoading(false);
        errorToast("Something went wrong");
        console.log("ERROR", err);
      },
    }
  );

  const updateMutation = useMutation(
    (updatedbook) => {
      return httpRequest.patch(`/books/${state.id}`, updatedbook);
    },
    {
      onSuccess: (data) => {
        console.log({ data });
        successToast(data.data.message);
        queryClient.invalidateQueries(["books"]);
      },
      onError: (err) => {
        setLoading(false);
        errorToast(err.response.data.message);
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
    setImage(null);
    setImagePreview(null);
  };

  const addBook = async () => {
    setLoading(true);

    await uploadBookImage();
    await mutation.mutateAsync({
      title,
      description: parseText(description),
      price,
      category: genre,
      image: imageUrl,
    });
    setLoading(false);
    navigate("/");
  };

  const updateBook = async () => {
    setLoading(true);

    image && (await uploadBookImage());
    await updateMutation.mutateAsync({
      title,
      description: parseText(description),
      price,
      category: genre,
      image: imageUrl || state.bookimg,
    });
    setLoading(false);
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
