import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/auth";
import "./Login.css";
import { toast } from "react-toastify";

export default function Login() {

    const navigate = useNavigate();

    const { API, setTokenInLS } = useAuth();
    const url = `${API}/api/auth/login`;

    const [data, setData] = useState({
        email: "",
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
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const resData = await respone.json();
        // console.log(resData);
        
        if (respone.ok) {
            toast.success(resData.message);
            setData({ email: "", password: "" });
            setTokenInLS(resData.token)
            navigate("/");
        }
        else {
            toast.error(resData.message);
        }
    }

    return (
        <div className="login">
            <span className="loginTitle">Login</span>
            <form
                onSubmit={handleSubmit}
                className="loginForm"
            >
                <label htmlFor="email">Email</label>
                <input
                    className="loginInput"
                    type="text"
                    placeholder="Enter your email..."
                    id="email"
                    name="email"
                    value={data.email}
                    onChange={handleInput}
                />
                <label htmlFor="password">Password</label>
                <input
                    className="loginInput"
                    type="password"
                    placeholder="Enter your password..."
                    id="password"
                    name="password"
                    value={data.password}
                    onChange={handleInput}
                />
                <button
                    className="loginButton"
                    type="submit"
                >Login</button>
            </form>
            <button className="loginRegisterButton">Register</button>
        </div>
    );
}
