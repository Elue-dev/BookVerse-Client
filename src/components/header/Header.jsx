import { Link, useLocation } from "react-router-dom";
import { BiUserCircle, BiBookReader } from "react-icons/bi";
import { GoTriangleDown } from "react-icons/go";
import styles from "./header.module.scss";
import { useSelector } from "react-redux";
import { getCurrentUser } from "../../redux/slices/auth.slice";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { httpRequest } from "../../../services/httpRequest";

export default function Header() {
  const location = useLocation();
  if (location.pathname.includes("auth")) return;

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const currentUser = useSelector(getCurrentUser);

  const {
    isLoading,
    error,
    data: books,
  } = useQuery(["books"], () =>
    httpRequest.get("/books").then((res) => {
      return res.data.books;
    })
  );

  if (isLoading) return <div className={styles.header}>LOADING...</div>;
  if (error)
    return <div className={styles.header}>SOMETHING WENT WRONG...</div>;

  const getBooks = async () => {
    const filteredBooks = books.filter((book) =>
      book.title.toLowerCase().includes(search.toLowerCase())
    );

    setResults(filteredBooks);
  };

  const clearFields = () => {
    setSearch("");
    setResults([]);
  };

  return (
    <header>
      <div className={styles.logo}>
        <Link to="/">
          <BiBookReader />
          <p>BookVerse</p>
        </Link>
      </div>

      <div className={styles.search}>
        <input
          type="search"
          placeholder="Search book by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onInput={getBooks}
        />
        {search && (
          <div className={styles["search__results"]}>
            {results.length === 0 && <p>No Books Found.</p>}
            {results?.map((book) => (
              <Link
                key={book.id}
                to={`/book/${book.slug}`}
                onClick={clearFields}
              >
                <div className={styles["search__details"]}>
                  <img src={book.bookimg} />
                  <div>
                    <p>{book.title}</p>
                    <p>₦{book.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className={styles["user__section"]}>
        {currentUser ? (
          <Link to="/dashboard">
            <img src={currentUser.img} alt={currentUser.username} />
          </Link>
        ) : (
          <Link to="/auth">
            <BiUserCircle className={styles.user} />
          </Link>
        )}
        <span className={styles.dropdown}>
          <GoTriangleDown />
        </span>
      </div>
    </header>
  );
}
