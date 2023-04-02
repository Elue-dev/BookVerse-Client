import { selectIsLoggedIn } from "../../redux/slices/auth.slice";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Authenticated({ children }) {
  const isLoggedIn = useSelector(selectIsLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/auth" />;
  }

  return children;
}
