import { useQuery } from "@tanstack/react-query";
import { httpRequest } from "../../../../services/httpRequest";
import moment from "moment";
import styles from "./user.books.module.scss";

export default function UserBooks({ currentUser }) {
  const {
    isLoading,
    error,
    data: books,
  } = useQuery([`books-${currentUser.id}`], () =>
    httpRequest.get("/books/user-books").then((res) => {
      return res.data;
    })
  );

  if (isLoading) return "LOADING...";

  return (
    <section className={styles["user__books"]}>
      <h3>Books you've added</h3>
      <p>
        You have added <b style={{ color: "#746ab0" }}>{books.length}</b> to
        BookVerse
      </p>
      {books.map((book) => (
        <div key={book.id} className={styles["book__details"]}>
          <img src={book.bookimg} />
          <div>
            <h3>{book.title}</h3>
            <p>
              <b>Genre:</b> {book.category}
            </p>
            <p>
              <b>Price:</b> ₦{book.price}
            </p>
            <p>
              <b>Added:</b> {moment(book.date).fromNow()}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
