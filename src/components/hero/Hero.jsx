import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { httpRequest } from "../../../services/httpRequest";
import { CLOSE_MODAL, modalState } from "../../redux/slices/modal.slice";
import styles from "./hero.module.scss";

export default function Hero() {
  const modal = useSelector(modalState);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const dispatch = useDispatch();

  const {
    isLoading,
    error,
    data: books,
  } = useQuery(["books"], () =>
    httpRequest.get("/books").then((res) => {
      return res.data.books;
    })
  );

  const getBooks = async () => {
    const filteredBooks = books.filter(
      (book) =>
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.category.toLowerCase().includes(search.toLowerCase())
    );

    setSearchResults(filteredBooks);
  };

  const clearFields = () => {
    setSearch("");
    setSearchResults([]);
    dispatch(CLOSE_MODAL());
  };

  return (
    <section className={styles.hero}>
      {modal && (
        <div
          className={
            modal ? ` ${styles.modal} ${styles.active}` : `${styles.modal}`
          }
        >
          <input
            type="text"
            placeholder="Seach books by title or genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onInput={getBooks}
          />

          {isLoading && <div className="loading">Loading...</div>}

          {search && (
            <div className={styles["search__results"]}>
              {searchResults.length === 0 && (
                <p style={{ color: "#fff" }}>No Books Found.</p>
              )}
              {searchResults?.map((book) => (
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
      )}
      <div className={styles["hero__content"]}>
        <h1>Up to 80% Off</h1>
        <p>Let's find the perfect book for you</p>
        <Link to="/books">
          <button>See Books</button>
        </Link>
      </div>
    </section>
  );
}
