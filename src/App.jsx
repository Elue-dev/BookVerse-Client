import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "../utils/scrollToTop";
import BookDetail from "./pages/book_detail/BookDetail";
import Footer from "./components/footer/Footer";
import Header from "./components/header/Header";
import Hero from "./components/hero/Hero";
import Navlinks from "./components/nav_links/Navlinks";
import Authenticated from "./components/protect_routes/authenticated";
import Unauthenticated from "./components/protect_routes/unauthenticated";
import Auth from "./pages/auth/Auth";
import Home from "./pages/home/Home";
import AddBook from "./pages/add_book/AddBook";
import Dashboard from "./pages/dashboard/Dashboard";
import Books from "./components/books/Books";

function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Header />
        <Navlinks />
        <ScrollToTop />
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route
            path="/auth"
            element={
              <Unauthenticated>
                <Auth />
              </Unauthenticated>
            }
          />
          <Route exact path="/book/:slug" element={<BookDetail />} />
          <Route exact path="/books" element={<Books />} />

          <Route
            exact
            path="/add-book"
            element={
              <Authenticated>
                <AddBook />{" "}
              </Authenticated>
            }
          />

          <Route
            exact
            path="/dashboard"
            element={
              // <Authenticated>
              <Dashboard />
              // </Authenticated>
            }
          />
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  );
}

export default App;
