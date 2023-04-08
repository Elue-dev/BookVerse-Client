import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { httpRequest } from "../../../services/httpRequest";
import Comments from "../../components/comments/Comments";
import { MdDeleteForever, MdOutlineEditNote } from "react-icons/md";
import { useSelector } from "react-redux";
import moment from "moment";
import { getCurrentUser } from "../../redux/slices/auth.slice";
import { errorToast, successToast } from "../../../utils/alerts";
import Notiflix from "notiflix";
import styles from "./book.detail.module.scss";

export default function BookDetail() {
  const { slug } = useParams();
  const currentUser = useSelector(getCurrentUser);
  const navigate = useNavigate();

  const {
    isLoading,
    error,
    data: book,
  } = useQuery([`book-${slug}`], () =>
    httpRequest.get(`/books/${slug}`).then((res) => {
      return res.data;
    })
  );

  const {
    isLoading: loading,
    error: err,
    data: books,
  } = useQuery([`books-${book?.category}`], () =>
    httpRequest.get(`/books`).then((res) => {
      return res.data.books;
    })
  );

  const queryClient = useQueryClient();

  const mutation = useMutation(
    () => {
      return httpRequest.delete(`/books/${book.id}`);
    },
    {
      onSuccess: (data) => {
        successToast(data.data);
        navigate("/");
        queryClient.invalidateQueries(["books"]);
      },
      onError: (err) => {
        errorToast(err.response.data.message);
        console.log("ERROR", err);
      },
    }
  );

  const confirmDelete = () => {
    Notiflix.Confirm.show(
      "Delete Book",
      "Are you sure you want to delete this book?",
      "DELETE",
      "CLOSE",
      function okCb() {
        deleteBook();
      },
      function cancelCb() {},
      {
        width: "320px",
        borderRadius: "5px",
        titleColor: "crimson",
        okButtonBackground: "crimson",
        cssAnimationStyle: "zoom",
      }
    );
  };

  const deleteBook = async () => {
    mutation.mutate();
  };

  const similarBooks = books?.filter(
    (b) => b.category === book?.category && b.id !== book.id
  );

  if (isLoading || loading)
    return <div className={styles["book_detail"]}>LOADING...</div>;
  if (error || err)
    return <div className={styles["book_detail"]}>SOMETHING WENT WRONG...</div>;

  return (
    <section className={styles["book_detail"]}>
      <div className={styles["left__section"]}>
        <img
          src={book.bookimg}
          alt={book.title}
          className={styles["book__img"]}
        />
        <div className={styles["added__by"]}>
          <img
            src={book.userimg}
            alt={book.username}
            className={styles["user__img"]}
          />
          <div className={styles.user}>
            <b>{book.username}</b>
            {currentUser?.id === book.userid ? (
              <p>Added by you {moment(book.date).fromNow()}</p>
            ) : (
              <p>Added {moment(book.date).fromNow()}</p>
            )}
          </div>

          {currentUser?.id === book.userid && (
            <div className={styles.actions}>
              <Link to="/add-book?action=edit" state={book}>
                <MdOutlineEditNote className={styles.edit} />
              </Link>
              <MdDeleteForever
                onClick={confirmDelete}
                className={styles.delete}
              />
            </div>
          )}
        </div>

        <div className={styles["book__details"]}>
          <h2>{book.title}</h2>
          <p>
            <b>Genre:</b> {book.category}
          </p>
          <p>
            <b>Price:</b> ₦{book.price}
          </p>
          <p>{book.description}</p>
        </div>

        <div className={styles["comments__container"]}>
          <Comments bookId={book.id} />
        </div>
      </div>
      <div className={styles["right__section"]}>
        <h2>Similar Books</h2>

        {similarBooks?.length === 0 ? (
          <p>No similar books to {book.title}</p>
        ) : (
          similarBooks?.map((sb) => (
            <Link key={sb.id} to={`/book/${sb.slug}`}>
              <div className={styles.similar}>
                <img
                  src={sb.bookimg}
                  alt={sb.title}
                  className={styles["s_book__img"]}
                />
                <h3>{sb.title}</h3>
                <p>
                  <b>Genre:</b> {sb.category}
                </p>
                <p>
                  <b>Price:</b> ₦{sb.price}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
