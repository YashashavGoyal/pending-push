import { useState } from "react";
import { useAuth } from "../../utils/auth";
import "./CreatePost.css";
import { toast } from "react-toastify";

export default function CreatePost() {

    const { user, API, token } = useAuth();
    const url = `${API}/api/post/new`;

    const [data, setData] = useState({
        title: "",
        content: "",
    });

    // handling form input
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

        try {

            const respone = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const resData = await respone.json();
            if (respone.ok) {
                toast.success(resData.message);
                setData({ title: "", content: "", });
            }
            else {
                toast.error(resData.message);
            }

        } catch (error) {
            console.log('post error ', error);
        }
    }


    return (
        <div className="write">
            <img
                className="writeImg"
                src="https://images.pexels.com/photos/6685428/pexels-photo-6685428.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
                alt=""
            />
            <form
                onSubmit={handleSubmit}
                className="writeForm"
            >
                <div className="writeFormGroup">
                    <label htmlFor="fileInput">
                        <i className="writeIcon fas fa-plus"></i>
                    </label>
                    <input id="fileInput" type="file" style={{ display: "none" }} />
                    <input
                        className="writeInput"
                        placeholder="Title"
                        type="text"
                        autoFocus={true}
                        name="title"
                        value={data.title}
                        onChange={handleInput}
                    />
                </div>
                <div className="writeFormGroup">
                    <textarea
                        className="writeInput writeText"
                        placeholder={`${user.username} Tell your story...`}
                        type="text"
                        autoFocus={true}
                        name="content"
                        value={data.content}
                        onChange={handleInput}
                    />
                </div>
                <button className="writeSubmit" type="submit">
                    Publish
                </button>
            </form>
        </div>
    );
}
