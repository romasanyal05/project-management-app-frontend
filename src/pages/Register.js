import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";

function Register() {

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");   // 👈 NEW

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleRegister = async (e) => {
    e.preventDefault();

    const res = await fetch("https://project-management-app-backend-awuc.onrender.com/users", {   
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        token     // 👈 NEW
      }),
    });

    const data = await res.json();

    if (data.ok) {
  localStorage.setItem("user", JSON.stringify(data));
  window.location.href = "/dashboard";
}
  };

  return (
    <div>
      <h2>Register</h2>

      {token && (
        <p style={{color:"green"}}>
          You are registering via invitation
        </p>
      )}

      <form onSubmit={handleRegister}>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <br /><br />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br /><br />

        <button type="submit">Register</button>

      </form>

      
    </div>
  );
}

export default Register;