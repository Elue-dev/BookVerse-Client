import { BiBookReader } from "react-icons/bi";
import styles from "./footer.module.scss";

export default function Footer() {
  return (
    <footer>
      <p>
        <BiBookReader />
        <b>BOOKVERSE</b>
      </p>
      <p>&copy; {new Date().getFullYear()}. All Rights Reserved.</p>
    </footer>
  );
}
