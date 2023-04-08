import { useQuery } from "@tanstack/react-query";
import { httpRequest } from "../../../../services/httpRequest";
import styles from "./user.books.module.scss";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserToken } from "../../../redux/slices/auth.slice";

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

  if (isLoading) return "LOADING YOUR BOOKS...";
  if (error) return "SOMETHING WENT WRONG......";

  return (
    <section className={styles["user__books"]}>
      <h3>Books you've added</h3>
      <p>
        You have added{" "}
        <b style={{ color: "#746ab0" }}>
          {books.length === 0 ? "No Books" : books.length}
        </b>{" "}
        {books.length === 1 ? "Book" : "Books"} to BookVerse
      </p>
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
                <b>Price:</b> ₦{book.price}
              </p>
              <p>
                <b>Added:</b> {new Date(book.date).toDateString()}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}
