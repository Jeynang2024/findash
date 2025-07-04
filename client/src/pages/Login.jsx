import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const BE = import.meta.env.VITE_BE;

function Login(){
    const [user, setUser] = useState({
        email: "",
        password: ""
    });
    const [token, setToken] = useState("");

    const navigate = useNavigate();
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({
            ...prevUser,
            [name]: value
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        //console.log("User logged in:", user);
        try {
            const response = await fetch(`${BE}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });
            if (response.ok) {
                const data = await response.json();
                //console.log("Login successful:", data);
                localStorage.setItem("token", data.token); 
                setToken(data.token);
                navigate("/dashboard"); 
            } else {
                const errorData = await response.json();
                console.error("Login failed:", errorData);
                navigate("/login"); 
            }
        } catch (err) {
            console.error("Error during login:", err);
        }
    };


    return (
        <div className="container mt-4" style={{ backgroundColor: "rgba(64, 50, 84, 0.3)" }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit} >
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input type="email" className="form-control" id="email" placeholder="Enter email" name="email" value={user.email} onChange={handleChange}/>
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" className="form-control" id="password" placeholder="Password" name='password' value={user.password} onChange={handleChange}/>
                </div>
                <button type="submit" className="btn btn-primary">Login</button>
            </form>
        </div>
    );      


}
export default Login;