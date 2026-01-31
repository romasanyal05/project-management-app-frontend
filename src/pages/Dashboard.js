import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const cardStyle = {
  background: "#74b9ff",
  padding: "30px",
  width: "200px",
  borderRadius: "10px",
  color: "white",
  textAlign: "center"
};

const logoutBtn = {
  padding: "10px 20px",
  background: "red",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

function Dashboard() {
  const [counts, setCounts] = useState({
  total: 0,
  pending: 0,
  completed: 0
});

  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    setUser(savedUser);
  }, []);

  useEffect(() => {
  fetch(https://project-management-app-backend-awuc.onrender.com/"dashboard-counts")
    .then(res => res.json())
    .then(data => setCounts(data));
}, []);

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

 return (
  <div style={{ padding: "40px" }}>

    <h2 style={{ marginBottom: "20px" }}>Dashboard</h2>

    {user && <h3>Welcome {user.name} 👋</h3>}

    <div style={{
      display: "flex",
      gap: "20px",
      marginTop: "30px"
    }}>

      {/* Total */}
      <div style={cardStyle}>
        <h3>Total Projects</h3>
        <h1>{counts.total}</h1>
      </div>

      {/* Pending */}
      <div style={{ ...cardStyle, background: "#ffeaa7" }}>
        <h3>Pending Projects</h3>
        <h1>{counts.pending}</h1>
      </div>

      {/* Completed */}
      <div style={{ ...cardStyle, background: "#55efc4" }}>
        <h3>Completed Projects</h3>
        <h1>{counts.completed}</h1>
      </div>

    </div>

    <br />

    <button onClick={logout} style={logoutBtn}>
      Logout
    </button>

  </div>
);
}

export default Dashboard;