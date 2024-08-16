import { useEffect, useState } from "react";
import { useAuth } from "../../utils/auth";
import "./Contact.css";
import { toast } from "react-toastify";

export default function Contact() {

    const { user, API, isLoading } = useAuth();
    const url = `${API}/api/contact/send`;

    const [data, setData] = useState({
        username: "",
        email: "",
        message: "",
        user: user._id,
    });


    const handleInput = (e) => {
        const name = e.target.name;
        const value = e.target.value;

        setData({
            ...data,
            [name]: value,
        })
    }

    const handleSumit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            const resData = await response.json();
            if (response.ok) {
                toast.success(resData.message);
                setData({ ...data, message: "" });
            }

        } catch (error) {
            console.log('msg sent error :', error);

        }
    }


    // Set user data once it is available
    useEffect(() => {
        if (user) {
            setData({
                username: user.username,
                email: user.email,
                message: "",
                user: user._id,
            });
        }
    }, [user]);

    return (
        <div className="contact">
            <span className="contactTitle">Contact</span>
            <form className="contactForm" onSubmit={handleSumit}>
                <label htmlFor="username">Username</label>
                <input
                    className="contactInput"
                    type="text"
                    placeholder="Enter your username..."
                    id="username"
                    value={data.username || ""}
                    onChange={handleInput}
                />

                <label htmlFor="email">Email</label>
                <input
                    className="contactInput"
                    type="text"
                    placeholder="Enter your email..."
                    id="email"
                    value={data.email || ""}
                    onChange={handleInput}
                />

                <label htmlFor="message">Type Your Message</label>
                <textarea
                    className="contactInput"
                    placeholder="Type Your Message"
                    id="message"
                    name="message"
                    value={data.message}
                    onChange={handleInput}
                ></textarea>

                <button type="submit" className="contactButton">Send Msg</button>
            </form>
        </div>
    )
}
