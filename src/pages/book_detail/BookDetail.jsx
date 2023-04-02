import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { httpRequest } from "../../../services/axios";
import styles from "./book.detail.module.scss";
import moment from "moment";

export default function BookDetail() {
  const { slug } = useParams();

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

  const similarBooks = books?.filter(
    (b) => b.category === book?.category && b.id !== book.id
  );

  if (isLoading) return <div className={styles["book_detail"]}>LOADING...</div>;
  if (error)
    return <div className={styles["book_detail"]}>SOMETHING WENT WRONG...</div>;

  console.log(book);
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
        </div>

        <div className={styles["book__details"]}>
          <h2>{book.title}</h2>
          <p>
            <b>Genre:</b> {book.category}
          </p>
          <p>{book.description}</p>
        </div>
      </div>
      <div className={styles["right__section"]}>
        <h3>Similar Books</h3>
        {similarBooks?.map((sb) => (
          <Link to={`/book/${sb.slug}`}>
            <div key={sb.id} className={styles.similar}>
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
