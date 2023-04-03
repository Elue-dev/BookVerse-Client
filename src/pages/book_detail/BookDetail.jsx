import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "./book.detail.module.scss";
import moment from "moment";
import { httpRequest } from "../../../services/httpRequest";
import Comments from "../../components/comments/Comments";
import { MdDeleteForever, MdOutlineEditNote } from "react-icons/md";
import { useSelector } from "react-redux";
import { getCurrentUser } from "../../redux/slices/auth.slice";
import { errorToast, successToast } from "../../../utils/alerts";

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
  } = useQuery(["books-cat"], () =>
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
        errorToast("Something went wrong");
        console.log("ERROR", err);
      },
    }
  );

  const deleteBook = async () => {
    mutation.mutate();
  };

  const similarBooks = books?.filter(
    (b) => b.category === book?.category && b.id !== book.id
  );

  if (isLoading) return <div className={styles["book_detail"]}>LOADING...</div>;
  if (error)
    return <div className={styles["book_detail"]}>SOMETHING WENT WRONG...</div>;

  // console.log(book);
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
            <p>Added {moment(book.date).fromNow()}</p>
          </div>

          {currentUser?.id === book.userid && (
            <div className={styles.actions}>
              <Link to="/add-book?action=edit" state={book}>
                <MdOutlineEditNote className={styles.edit} />
              </Link>
              <MdDeleteForever onClick={deleteBook} className={styles.delete} />
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
        <h3>Similar Books</h3>
        {similarBooks?.map((sb) => (
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
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
