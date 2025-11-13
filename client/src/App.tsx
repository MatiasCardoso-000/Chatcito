import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { Layout } from "./components/layout/Layout";
import { FeedPage } from "./pages/Feed";

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<LoginPage />} path="/login" />
        <Route element={<RegisterPage />} path="/register" />
        <Route element={<Layout />} path="/">
          <Route index element={<FeedPage />} path="/" />
        </Route>
      </Routes>
    </Router>
  );
};
