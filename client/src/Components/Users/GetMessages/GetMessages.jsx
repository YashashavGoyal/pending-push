import { useEffect, useState } from "react";
import { useAuth } from "../../../utils/auth"
import Message from "../../Message/Message";

import './GetMessages.css';

export default function GetMessages() {

    const [msgs, setMsgs] = useState([]);

    const { API, token } = useAuth();
    const url = `${API}/api/admin/contacts`;

    const getAllMessages = async () => {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const resData = await response.json();
            // console.log(resData);
            
            if (response.ok) {
                setMsgs(resData.message);
            }
        } catch (error) {
            console.log(`get message`, error);
        }
    }

    useEffect(() => {
        getAllMessages();
    }, [])

    // console.log(msgs);
    if (msgs.length === 0) {
        return <h1>No msgs</h1>
    }


    return (
        <div className="msgs-container">
            {
                msgs.map((msg, index) => {
                    return <Message msg={msg} key={index} />
                })
            }
        </div>
    )
}
