import { useEffect, useState } from "react"
import { useAuth } from "../../utils/auth";

import './AdminProfile.css'
import { toast } from "react-toastify";

export default function AdminProfile() {
    
        const { user, token, API, getUser } = useAuth();
        const url = `${API}/api/auth/user/update`;
    
        const { username, email, phone } = user;

    const [disabled, setDisabled] = useState(true);
    const [display, setDisplay] = useState('none');
    const [data, setData] = useState({
        username: username,
        email: email,
        phone: phone,
    });

    if (!user) {
        return <h1>Loading</h1>
    }

    useEffect(() => {
        if (disabled) {
            setDisplay('none')
        }
        else {
            setDisplay('block');
        }
    }, [disabled])

    const editBtn = (e) => {
        e.preventDefault();
        setDisabled(false);
    }

    const handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;

        setData({
            ...data,
            [name]: value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const resData = await response.json();
            if (response.ok) {
                toast.success(resData.message);
                getUser();
                setDisplay('none');
                setDisabled(true)
            }
        } catch (error) {
            console.log('update error', error);

        }
    }

    return (
        <>
            <section className="profile-section">
                <div className="header">
                    <h1 className="title center">User Profile</h1>
                </div>
                <form onSubmit={handleSubmit} className="profile">
                    <div className="form-container">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            placeholder="Enter Your Username"
                            id="username"
                            name="username"
                            value={data.username}
                            disabled={disabled}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-container">
                        <label htmlFor="email">Email</label>
                        <input
                            type="text"
                            placeholder="Enter Your Email"
                            id="email"
                            name="email"
                            value={data.email}
                            disabled={disabled}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-container">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            type="text"
                            placeholder="Enter Your Phone No"
                            id="phone"
                            name="phone"
                            value={data.phone}
                            disabled={disabled}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-container">
                        <button
                            className="btn"
                            onClick={editBtn}
                        >Edit</button>
                        <button
                            className="btn"
                            style={{ display: display }}
                            type="submit"
                        >Submit</button>
                    </div>
                </form>
            </section>
        </>
    )
}
