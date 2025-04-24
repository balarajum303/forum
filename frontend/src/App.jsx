import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import axios from "axios";
import Navbar from "./components/Layout/Navbar";
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";
import ForumList from "./components/Forums/ForumList";
import ForumForm from "./components/Forums/ForumForm";
import ForumDetail from "./components/Forums/ForumDetail";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token"); // Retrieve token from localStorage
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Send the token to backend to verify it
        const response = await axios.get(
          "http://localhost:5000/api/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(response.data); // Set user state if token is valid
      } catch (err) {
        // If token is invalid, remove it from localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null); // Set user to null if token is invalid
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="container mt-5 text-center">Loading session...</div>;
  }

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route
          path="/"
          element={<Navigate to={user ? "/forums" : "/login"} />}
        />
        <Route
          path="/signup"
          element={
            !user ? <Signup setUser={setUser} /> : <Navigate to="/forums" />
          }
        />
        <Route
          path="/login"
          element={
            !user ? <Login setUser={setUser} /> : <Navigate to="/forums" />
          }
        />
        <Route
          path="/forums"
          element={
            <ProtectedRoute user={user}>
              <ForumList user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={user ? <ForumForm /> : <Navigate to="/login" />}
        />
        <Route
          path="/editForums/:id"
          element={user ? <ForumForm /> : <Navigate to="/login" />}
        />

        <Route
          path="/forumDetails/:id"
          element={
            user ? <ForumDetail user={user} /> : <Navigate to="/login" />
          }
        />
        <Route
          path="*"
          element={<div className="container mt-5">404 - Page Not Found</div>}
        />
      </Routes>
    </Router>
  );
}

export default App;
