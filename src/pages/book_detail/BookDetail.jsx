import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { httpRequest } from "../../../services/httpRequest";
import Comments from "../../components/comments/Comments";
import { MdDeleteForever, MdOutlineEditNote } from "react-icons/md";
import { useSelector } from "react-redux";
import moment from "moment";
import { getCurrentUser, getUserToken } from "../../redux/slices/auth.slice";
import { errorToast, successToast } from "../../../utils/alerts";
import Notiflix from "notiflix";
import styles from "./book.detail.module.scss";
import PaystackPop from "@paystack/inline-js";
import { useEffect, useState } from "react";

export default function BookDetail() {
  const [isPurchased, setIsPurchased] = useState(false);
  const { slug } = useParams();
  const currentUser = useSelector(getCurrentUser);
  const navigate = useNavigate();
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

  const { data: transactions } = useQuery(
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
      return httpRequest.delete(`/books/${book.id}`);
    },
    {
      onSuccess: (data) => {
        successToast(data.data);
        navigate("/");
        queryClient.invalidateQueries(["books"]);
      },
      onError: (err) => {
        errorToast(err.response.data.message);
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
        titleColor: "crimson",
        okButtonBackground: "crimson",
        cssAnimationStyle: "zoom",
      }
    );
  };

  const deleteBook = async () => {
    mutation.mutate();
  };

  const saveTransaction = async (tId) => {
    try {
      await httpRequest.post(
        "/transactions",
        {
          bookId: book.id,
          transactionId: tId,
        },
        authHeaders
      );
    } catch (error) {
      errorToast("Something went wrong");
      console.log(error);
    }
  };

  const buyBook = () => {
    if (!currentUser) {
      errorToast("Please login to purchase book");
      navigate("/auth");
      return;
    }

    const initiatePayment = () => {
      try {
        const paystack = new PaystackPop();
        paystack.newTransaction({
          key: import.meta.env.VITE_PAYSTACK_KEY,
          amount: book.price * 100,
          email: "legaalninja@gmail.com",
          name: currentUser.username,
          onSuccess() {
            saveTransaction(paystack.id);
            successToast(
              "Transaction successful. You would hear from us and get your book soon!"
            );
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
  }, [transactions]);

  if (isLoading || loading)
    return <div className="loading">LOADING BOOK...</div>;
  if (error || err)
    return <div className={styles["book_detail"]}>SOMETHING WENT WRONG...</div>;

  return (
    <section className={styles["book_detail"]}>
      <div className={styles["left__section"]}>
        <a href={book.bookimg}>
          <img
            src={book.bookimg}
            alt={book.title}
            className={styles["book__img"]}
          />
        </a>

        {isPurchased && (
          <p className={styles.pdate}>
            You purchased this book on{" "}
            {new Date(myTransactions?.transaction_date).toDateString()}
          </p>
        )}
        <div className={styles["added__by"]}>
          <img
            src={book.userimg}
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
          <h2>{book.title}</h2>
          <p>
            <b>Genre:</b> {book.category}
          </p>
          <p>
            <b>Price:</b> ₦{book.price}
          </p>
          <br />
          <p>{book.description}</p>

          <button className={styles["purchase__btn"]} onClick={buyBook}>
            Buy Book
          </button>
        </div>

        <div className={styles["comments__container"]}>
          <Comments bookId={book.id} />
        </div>
      </div>
      <div className={styles["right__section"]}>
        <h2>Similar Books</h2>

        {similarBooks?.length === 0 ? (
          <p>No similar books to {book.title}</p>
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
                  <b>Price:</b> ₦{sb.price}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
