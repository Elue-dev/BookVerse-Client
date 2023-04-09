import { useQuery } from "@tanstack/react-query";
import { httpRequest } from "../../../../services/httpRequest";
import styles from "./user.books.module.scss";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserToken } from "../../../redux/slices/auth.slice";
import moment from "moment";

export default function UserBooks({ currentUser }) {
  const token = useSelector(getUserToken);
  const authHeaders = { headers: { authorization: `Bearer ${token}` } };

  const {
    isLoading,
    error,
    data: books,
  } = useQuery([`books-${currentUser.id}`], () =>
    httpRequest.get("/books/user-books", authHeaders).then((res) => {
      return res.data;
    })
  );

  const { data: transactions } = useQuery(
    [`transactions-${currentUser.id}`],
    () =>
      httpRequest.get("/transactions", authHeaders).then((res) => {
        return res.data;
      })
  );

  if (isLoading)
    return (
      <div className="loading" style={{ color: "#746ab0" }}>
        LOADING YOUR BOOKS...
      </div>
    );
  if (error) return "SOMETHING WENT WRONG......";

  return (
    <section className={styles["user__books"]}>
      <h2>Books you've added</h2>

      {books?.length === 0 ? (
        <p>
          You have not added any book on BookVerse.{" "}
          <Link to="/add-book?action=new">
            <b style={{ color: "#746ab0" }}>Start adding some</b>{" "}
          </Link>
        </p>
      ) : (
        <p>
          You have added{" "}
          <b style={{ color: "#746ab0" }}>
            {books.length} {books.length == 1 ? "book" : "books"}
          </b>{" "}
          to BookVerse
        </p>
      )}

      {books.map((book) => (
        <Link to={`/book/${book.slug}`} key={book.id}>
          <div className={styles["book__details"]}>
            <img src={book.bookimg} />
            <div>
              <h3>{book.title}</h3>
              <p>
                <b>Genre:</b> {book.category}
              </p>
              <p>
                <b>Price:</b> ₦{new Intl.NumberFormat().format(book.price)}
              </p>
              <p>
                <b>Added:</b> {new Date(book.date).toDateString()}
              </p>
            </div>
          </div>
        </Link>
      ))}
      <br />

      <h2>Books you've purchased</h2>
      {transactions.length > 0 ? (
        <p>
          You have purchased{" "}
          <b style={{ color: "#746ab0" }}>
            {transactions.length} {transactions.length === 1 ? "book" : "books"}{" "}
          </b>{" "}
          on BookVerse.
        </p>
      ) : (
        <p>You have not purchased any book on BookVerse.</p>
      )}

      {transactions.map((transaction) => (
        <Link to={`/book/${transaction.slug}`} key={transaction.transaction_id}>
          <div className={styles["book__details"]}>
            <img src={transaction.bookimg} />
            <div>
              <h3>{transaction.title}</h3>
              <p>
                <b>Genre:</b> {transaction.category}
              </p>
              <p>
                <b>Price:</b> ₦
                {new Intl.NumberFormat().format(transaction.price)}
              </p>
              <p>
                <b>Purchased:</b>{" "}
                {moment(transaction.transaction_date).fromNow()}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}
