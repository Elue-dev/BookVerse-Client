import { useQuery } from "@tanstack/react-query";
import { httpRequest } from "../../../../services/httpRequest";
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

  console.log(books);

  return <section className={styles["user__books"]}>UserBooks</section>;
}
