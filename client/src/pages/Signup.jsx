import React,{useState} from "react";
import { useNavigate } from "react-router-dom";
function Signup() { 
   const [user,setUser] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [token, setToken] =useState("");
    const navigate = useNavigate();
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => {
            return {
                ...prevUser,
                [name]: value
            };
        });
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log("User signed up:", user);
        try{
            const response = await fetch("http://localhost:5001/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });
            if (response.ok) {
                const data = await response.json();
                console.log("Signup successful:", data);
                localStorage.setItem("token", data.token); // Store token in localStorage
                setToken(data.token);
                navigate("/dashboard"); // Redirect to home page on success
                // Redirect or show success message
            } else {
                const errorData = await response.json();
                console.error("Signup failed:", errorData);
                navigate("/signup"); // Redirect to login page on error
                // Show error message to user
            }



        }catch(err){
            console.error("Error during signup:", err);
        }
    };


    return (
        <div className="container" style={{ backgroundColor: "rgba(64, 50, 84, 0.3)" }}>
            
        <h1>Sign Up</h1>
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
            <label htmlFor="username" className="form-label" >Username</label>
            <input type="text" className="form-control" id="username" required  name="username" onChange={handleChange} value={user.username}/>
            </div>
            <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input type="email" className="form-control" id="email" required  name="email" onChange={handleChange} value={user.email}/>
            </div>
            <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" className="form-control" id="password" required  name="password" onChange={handleChange} value={user.password}/>
            </div>
            <button type="submit" className="btn btn-primary">Sign Up</button>
        </form>
        </div>
    );
    }

    export default Signup;