import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { httpRequest } from "../../../services/httpRequest";
import Comments from "../../components/comments/Comments";
import { MdDeleteForever, MdOutlineEditNote } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import {
  getCurrentUser,
  getUserToken,
  SAVE_URL,
} from "../../redux/slices/auth.slice";
import { errorToast, successToast } from "../../../utils/alerts";
import Notiflix from "notiflix";
import styles from "./book.detail.module.scss";
import PaystackPop from "@paystack/inline-js";
import { useEffect, useState } from "react";
import { SyncLoader } from "react-spinners";

export default function BookDetail() {
  const [isPurchased, setIsPurchased] = useState(false);
  const { slug } = useParams();
  const currentUser = useSelector(getCurrentUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const token = useSelector(getUserToken);

  const authHeaders = { headers: { authorization: `Bearer ${token}` } };

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
  } = useQuery([`books-${book?.category}`], () =>
    httpRequest.get(`/books`).then((res) => {
      return res.data.books;
    })
  );

  const { data: transactions, isLoading: tLoading } = useQuery(
    [`transactions-${currentUser?.id}`],
    () =>
      httpRequest
        .get(`/transactions/all?bookId=${book?.id}`, authHeaders)
        .then((res) => {
          return res.data;
        })
  );

  const queryClient = useQueryClient();

  const mutation = useMutation(
    () => {
      return httpRequest.delete(`/books/${book.id}`, authHeaders);
    },
    {
      onSuccess: (data) => {
        successToast(data.data);
        navigate("/");
        queryClient.invalidateQueries(["books"]);
      },
      onError: (err) => {
        errorToast("Somethinng went wrong");
        console.log("ERROR", err);
      },
    }
  );

  const confirmDelete = () => {
    Notiflix.Confirm.show(
      "Delete Book",
      "Are you sure you want to delete this book?",
      "DELETE",
      "CLOSE",
      function okCb() {
        deleteBook();
      },
      function cancelCb() {},
      {
        width: "320px",
        borderRadius: "5px",
        titleColor: "#746ab0",
        okButtonBackground: "#746ab0",
        cssAnimationStyle: "zoom",
      }
    );
  };

  const deleteBook = async () => {
    mutation.mutate();
  };

  const saveTransaction = async (tId) => {
    try {
      const response = await httpRequest.post(
        "/transactions",
        {
          bookId: book.id,
          transactionId: tId,
        },
        authHeaders
      );
      if (response) {
        successToast(
          "Transaction successful. You would hear from us and get your book soon!"
        );
      }
    } catch (error) {
      errorToast("Something went wrong. Please try again.");
      // console.log(error);
    }
  };

  const buyBook = () => {
    if (!currentUser) {
      errorToast("Please login to purchase book");
      dispatch(SAVE_URL(pathname));
      navigate("/auth");
      return;
    }

    const initiatePayment = () => {
      try {
        const paystack = new PaystackPop();
        paystack.newTransaction({
          key: import.meta.env.VITE_PAYSTACK_KEY,
          amount: book.price * 100,
          email: currentUser.email,
          name: currentUser.username,
          onSuccess() {
            saveTransaction(paystack.id);
            setIsPurchased(true);
          },
          onCancel() {
            errorToast("Transaction Cancelled ⛔️");
            console.log("");
          },
        });
      } catch (err) {
        console.log(err);
        errorToast("failed transaction" + err);
      }
    };
    initiatePayment();
  };

  const similarBooks = books?.filter(
    (b) => b.category === book?.category && b.id !== book.id
  );

  const myTransactions = transactions?.filter(
    (t) => t.slug === slug && t.user_id === currentUser?.id
  )[0];

  useEffect(() => {
    let userIds = [];
    transactions?.map((t) => userIds.push(t.user_id));
    if (userIds.includes(currentUser?.id)) {
      setIsPurchased(true);
    } else {
      setIsPurchased(false);
    }
  }, [transactions, myTransactions]);

  if (isLoading)
    return (
      <div className="loading">
        <SyncLoader color={"#746ab0"} />
      </div>
    );
  if (error)
    return <div className={styles["book_detail"]}>SOMETHING WENT WRONG...</div>;

  return (
    <section className={styles["book_detail"]}>
      <div className={styles["left__section"]}>
        <h2>{book.title}</h2>
        <br />
        <a href={book.bookimg}>
          <img
            src={book.bookimg}
            alt={book.title}
            className={styles["book__img"]}
          />
        </a>

        <div className={styles["added__by"]}>
          <img
            src={book.user_img}
            alt={book.username}
            className={styles["user__img"]}
          />
          <div className={styles.user}>
            <b>{book.username}</b>
            {currentUser?.id === book.userid ? (
              <p>Added by you {moment(book.date).fromNow()}</p>
            ) : (
              <p>Added {moment(book.date).fromNow()}</p>
            )}
          </div>

          {currentUser?.id === book.userid && (
            <div className={styles.actions}>
              <Link to="/add-book?action=edit" state={book}>
                <MdOutlineEditNote className={styles.edit} />
              </Link>
              <MdDeleteForever
                onClick={confirmDelete}
                className={styles.delete}
              />
            </div>
          )}
        </div>

        <div className={styles["book__details"]}>
          <p>
            <b>Genre:</b> {book.category}
          </p>
          <p>
            <b>Price:</b> ₦{new Intl.NumberFormat().format(book.price)}
          </p>
          <br />
          <p>{book.description}</p>

          {myTransactions && isPurchased ? (
            <p className={styles.pdate}>
              You purchased this book on{" "}
              {new Date(myTransactions?.transaction_date).toDateString()}
            </p>
          ) : (
            <button className={styles["purchase__btn"]} onClick={buyBook}>
              Buy Book
            </button>
          )}
        </div>

        <div className={styles["comments__container"]}>
          <Comments bookId={book.id} />
        </div>
      </div>
      <div className={styles["right__section"]}>
        <h2>Similar Books</h2>
        {similarBooks?.length === 0 ? (
          <p>
            No similar book to <b style={{ color: "#746ab0" }}>{book.title}</b>
          </p>
        ) : (
          similarBooks?.map((sb) => (
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
                <p>
                  <b>Price:</b> ₦{new Intl.NumberFormat().format(sb.price)}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
