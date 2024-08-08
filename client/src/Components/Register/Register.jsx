import { useState } from "react";
import { toast } from 'react-toastify'
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/auth";
import "./Register.css";

export default function Register() {

    const { API } = useAuth();
    const url = `${API}/api/auth/register`;


    const navigate = useNavigate();

    const [data, setData] = useState({
        username: "",
        email: "",
        phone: "",
        password: "",
    });

    const handleInput = (e) => {
        const name = e.target.name;
        const value = e.target.value;

        setData({
            ...data,
            [name]: value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const respone = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
        });

        const resData = await respone.json();

        if (respone.ok) {
            toast.success(resData.message);
            setData({ username: "", email: "", phone: "", password: "" });
            navigate('/login');
        }
        else {
            toast.error(resData.message);
        }
    }


    return (
        <div className="register">
            <span className="registerTitle">Register</span>
            <form
                onSubmit={handleSubmit}
                className="registerForm"
            >
                <label htmlFor="username">Username</label>
                <input
                    className="registerInput"
                    type="text"
                    placeholder="Enter your username..."
                    id="uername"
                    name="username"
                    value={data.username}
                    onChange={handleInput}
                />

                <label htmlFor="email">Email</label>
                <input
                    className="registerInput"
                    type="text"
                    placeholder="Enter your email..."
                    id="email"
                    name="email"
                    value={data.email}
                    onChange={handleInput}
                />

                <label htmlFor="phone">Phone</label>
                <input
                    className="registerInput"
                    type="text"
                    placeholder="Enter your email..."
                    id="phone"
                    name="phone"
                    value={data.phone}
                    onChange={handleInput}
                />

                <label htmlFor="password">Password</label>
                <input
                    className="registerInput"
                    type="password"
                    placeholder="Enter your password..."
                    id="password"
                    name="password"
                    value={data.password}
                    onChange={handleInput}

                />

                <button className="registerButton">Register</button>
            </form>
            <button className="registerLoginButton">Login</button>
        </div>
    )
}
