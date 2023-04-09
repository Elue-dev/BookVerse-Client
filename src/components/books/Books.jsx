import { useQuery } from "@tanstack/react-query";
import { BsFillCalendar2PlusFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import { httpRequest } from "../../../services/httpRequest";
import Select from "react-select";
import styles from "./books.module.scss";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import {
  selectFilteredBooks,
  SORT_BOOKS,
} from "../../redux/slices/filter.slice";

const sortOptions = [
  { value: "latest", label: "Sorting: Latest" },
  { value: "lowest-price", label: "Sort by Lowest Price" },
  { value: "highest-price", label: "Sort by Highest Price" },
];

export default function Books() {
  const filteredBooks = useSelector(selectFilteredBooks);
  const [sort, setSort] = useState("latest");
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

  useEffect(() => {
    dispatch(
      SORT_BOOKS({
        books,
        sort,
      })
    );
  }, [dispatch, books, sort]);

  if (isLoading) return <div className="loading">LOADING BOOKS...</div>;

  if (isLoading)
    return <div className={styles.books}>SOMETHING WENT WRONG."</div>;

  const handleSelectChange = (option) => {
    setSort(option.value);
  };

  return (
    <div className={styles.books}>
      <h2>ALL BOOKS</h2>
      <label>
        <Select
          options={sortOptions}
          placeholder="Select sorting parameter"
          onChange={(option) => handleSelectChange(option)}
          className={styles["select__purpose"]}
        />
      </label>
      <section className={styles["all__books"]}>
        {filteredBooks?.map((book) => (
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
    </div>
  );
}
