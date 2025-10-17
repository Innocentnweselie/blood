import React, { useState } from "react";
const express = require('express');
const router = express.Router();

// Dummy signup
router.post('/register', (req, res) => {
  // Save user to DB here
  res.json({ message: 'User registered successfully' });
});

// Dummy login
router.post('/login', (req, res) => {
  // Check user credentials here
  res.json({ message: 'Login successful', token: 'dummy-jwt-token' });
});

module.exports = router;

// Example for login//

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    alert(data.message);
    // Optionally save token: localStorage.setItem("token", data.token);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" onChange={handleChange} placeholder="Username" />
      <input name="password" type="password" onChange={handleChange} placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}