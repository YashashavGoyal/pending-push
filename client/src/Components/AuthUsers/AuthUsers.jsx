import { useEffect, useState } from "react";
import { useAuth } from "../../utils/auth";
import Users from "../Users/Users";
import './AuthUsers.css'
import { toast } from "react-toastify";

export default function AuthUsers() {

    const [users, setUsers] = useState([])

    const { API, token } = useAuth();
    const url = `${API}/api/admin/users`;


    const getAllUsers = async () => {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const resData = await response.json();
            if (response.ok) {
                console.log(resData);
                setUsers(resData.users);
                toast.success(resData.message);
            }

        } catch (error) {
            console.log('get all users', error);
        }
    }

    useEffect(() => {
        getAllUsers();
    }, [])

    return (
        <>
            <div className="users-conatiner">
                {
                    users.map((user,index)=>{
                        return <Users user={user} key={index}/>
                    })
                }
            </div>
        </>
    )
}
