import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import styles from "./featured.module.scss";
import { Link } from "react-router-dom";
import { BsFillCalendar2PlusFill } from "react-icons/bs";
import { FaQuoteLeft } from "react-icons/fa";
import { httpRequest } from "../../../services/httpRequest";
import image from "../../assets/image1.jpg";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { CLOSE_MODAL } from "../../redux/slices/modal.slice";

export default function featured() {
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
    dispatch(CLOSE_MODAL());
  }, []);

  if (isLoading) return <div className={styles.featured}>LOADING...</div>;
  if (error)
    return <div className={styles.featured}>SOMETHING WENT WRONG...</div>;

  return (
    <section className={styles.featured}>
      <div>
        <p>
          <FaQuoteLeft /> &nbsp;
          <span>
            {" "}
            One glance at a book and you hear the voice of another person,
            perhaps someone dead for 1,000 years. To read is to voyage through
            time. – <b style={{ color: "#746ab0" }}>Carl Sagan</b>
          </span>
        </p>
        <img src={image} alt="" />
      </div>
      <h2>FEATURED BOOKS</h2>
      <section className={styles["featured__books"]}>
        {books?.slice(0, 3).map((book) => (
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
    </section>
  );
}
