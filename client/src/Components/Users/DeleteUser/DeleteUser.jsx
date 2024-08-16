import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../../../utils/auth";
import { toast } from "react-toastify";
import { useEffect } from "react";

export default function DeleteUser() {

    const { id } = useParams()
    const { API, token } = useAuth();
    const url = `${API}/api/admin/${id}/delete/user`;

    const deleteUser = async () => {
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const resData = await response.json();
            if (response.ok) {
                // toast.success(resData.message);
            }
        } catch (error) {
            console.log(`delete user `, error);
        }
    }

    useEffect(()=>{
        console.log(url);
        
        deleteUser();
    },[])
    return (
        <Navigate to='/auth/admin/users'></Navigate>
    )
}
