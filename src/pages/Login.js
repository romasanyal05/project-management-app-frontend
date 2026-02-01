import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [msg, setMsg] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("Logging in...");

    try {
      const res = await fetch(process.env.REACT_APP_API_URL + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const text = await res.text();
const data = text ? JSON.parse(text) : {};

      if (data.ok) {
        setMsg("✅ Login Successful!");
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
        setUser(data.user);
      } else {
        setMsg("❌ " + data.error);
      }
    } catch (err) {
      setMsg("❌ Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        /><br /><br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        /><br /><br />

        <button>Login</button>
      </form>

      <p>{msg}</p>

      {user && (
        <pre>{JSON.stringify(user, null, 2)}</pre>
      )}
    </div>
  );
}