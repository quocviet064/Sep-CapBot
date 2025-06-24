import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LectureLayout from "./components/globals/layouts/lecture";

import LoadingPage from "./pages/loading-page";
import NotFoundPage from "./pages/not-found-page";

function App() {
  const Home = lazy(() => import("./pages/home-page"));
  const Contact = lazy(() => import("./pages/contact-page"));

  const CreateProject = lazy(() => import("./pages/supervisor/create-project"));

  const Login = lazy(() => import("./pages/login-page"));

  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        <Route element={<LectureLayout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/create-project" element={<CreateProject />} />

          <Route path="/*" element={<NotFoundPage />} />
        </Route>

        <Route path="/login" element={<Login />} />
      </Routes>
    </Suspense>
  );
}

export default App;
