import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import styles from "./featured.module.scss";
import { Link } from "react-router-dom";
import { BsFillCalendar2PlusFill } from "react-icons/bs";
import { httpRequest } from "../../../services/httpRequest";

export default function featured() {
  const {
    isLoading,
    error,
    data: books,
  } = useQuery(["books"], () =>
    httpRequest.get("/books").then((res) => {
      return res.data.books;
    })
  );

  if (isLoading)
    return <div className={styles["featured__books"]}>LOADING...</div>;

  return (
    <section className={styles["featured__books"]}>
      {books.map((book) => (
        <div className={styles["books__card"]} key={book.id}>
          <div>
            <img src={book.bookimg} alt="" />
          </div>
          <div className={styles["book__details"]}>
            <h3>{book.title}</h3>
            <p>
              <BsFillCalendar2PlusFill /> {moment(book.date).fromNow()}
            </p>
            <p>{book.description.substring(0, 90)}...</p>
            <div className={styles.bottom}>
              <Link to={`/book/${book.slug}`}>
                <button>See Details</button>
              </Link>
              <p>₦{book.price}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
