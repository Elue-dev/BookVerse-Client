import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpRequest } from "../../../services/httpRequest";
import { BsDot } from "react-icons/bs";
import { IoMdArrowDropdown } from "react-icons/io";
import { MdOutlineArrowDropUp } from "react-icons/md";
import { CiClock2 } from "react-icons/ci";
import { useSelector } from "react-redux";
import styles from "./comments.module.scss";
import { getCurrentUser, getUserToken } from "../../redux/slices/auth.slice";
import { errorToast, successToast } from "../../../utils/alerts";
import { Link } from "react-router-dom";
import moment from "moment";

export default function Comments({ bookId }) {
  const currentUser = useSelector(getCurrentUser);
  const [showComments, setShowComments] = useState(false);
  const [text, setText] = useState("");
  const token = useSelector(getUserToken);
  const authHeaders = { headers: { authorization: `Bearer ${token}` } };

  const {
    isLoading,
    error,
    data: comments,
  } = useQuery([`comment-${bookId}`], () =>
    httpRequest.get(`/comments?bookid=${bookId}`, authHeaders).then((res) => {
      return res.data;
    })
  );

  const queryClient = useQueryClient();

  const mutation = useMutation(
    (newComment) => {
      return httpRequest.post("/comments", newComment, authHeaders);
    },
    {
      onSuccess: (data) => {
        successToast(data.data.message);
        queryClient.invalidateQueries([`comment-${bookId}`]);
      },
      onError: (err) => {
        errorToast("Something went wrong");
        console.log("ERROR", err);
      },
    }
  );

  const addComment = () => {
    if (!text) return errorToast("Please add your comment");
    mutation.mutateAsync({
      comment: text,
      bookid: bookId,
    });
    setText("");
  };

  if (isLoading) return "Loading...";

  return (
    <section className={styles.comments}>
      <div className={styles.header}>
        <b>
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </b>{" "}
        <BsDot />{" "}
        <span onClick={() => setShowComments(!showComments)}>
          {showComments ? "Hide comments" : "Show more"}{" "}
          {showComments ? <MdOutlineArrowDropUp /> : <IoMdArrowDropdown />}
        </span>
        {!currentUser && (
          <Link to="/auth" className={styles.nouser}>
            <p>Login to comment</p>
          </Link>
        )}
      </div>

      {showComments && (
        <>
          <div className={styles["comments__section"]}>
            {currentUser && (
              <div>
                <img src={currentUser?.img} alt={currentUser?.username} />
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Add a comment..."
                />

                <button onClick={addComment} disabled={mutation.isLoading}>
                  {mutation.isLoading ? "Adding..." : "Submit"}
                </button>
              </div>
            )}
          </div>
          <div className={styles["book__comments"]}>
            {comments.length === 0 ? (
              <p>Be the first to add a comment</p>
            ) : (
              <>
                {comments.map((comment) => (
                  <div className={styles["comment__details"]} key={comment.id}>
                    <img src={comment.userimg} alt={comment.username} />
                    <div>
                      <p>
                        <b>{comment.username}</b>
                      </p>
                      <p className={styles.username}>{comment.comment}</p>
                    </div>
                    <div className={styles.date}>
                      <CiClock2 />
                      {moment(comment.date).fromNow()}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}
