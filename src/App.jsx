import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "../utils/scrollToTop";
import BookDetail from "./pages/book_detail/BookDetail";
import Footer from "./components/footer/Footer";
import Header from "./components/header/Header";
import Navlinks from "./components/nav_links/Navlinks";
import { BiBookReader } from "react-icons/bi";
import ErrorPage from "./components/error_page/ErrorPage";
const Authenticated = lazy(() =>
  import("./components/protect_routes/authenticated")
);
const Unauthenticated = lazy(() =>
  import("./components/protect_routes/unauthenticated")
);
const Auth = lazy(() => import("./pages/auth/Auth"));
const Home = lazy(() => import("./pages/home/Home"));
const AddBook = lazy(() => import("./pages/add_book/AddBook"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Books = lazy(() => import("./components/books/Books"));

function App() {
  return (
    <div className="app">
      <Toaster />
      <BrowserRouter>
        <Header />
        <Navlinks />
        <ScrollToTop />
        <div className="main">
          <Suspense
            fallback={
              <div className="loading suspense">
                <div>
                  <BiBookReader />{" "}
                </div>
                <h2>BOOKVERSE...</h2>
              </div>
            }
          >
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
              <Route path="/book/:slug" element={<BookDetail />} />
              <Route path="/books" element={<Books />} />

              <Route path="/add-book" element={<AddBook />} />

              <Route
                path="/dashboard"
                element={
                  <Authenticated>
                    <Dashboard />
                  </Authenticated>
                }
              />
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </Suspense>
        </div>

        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
