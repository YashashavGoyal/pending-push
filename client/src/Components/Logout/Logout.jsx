import { useEffect } from "react";
import { useAuth } from "../../utils/auth"
import { Navigate } from "react-router-dom";

export default function Logout() {

    const { logoutUser } = useAuth();

    useEffect(() => {
        logoutUser();
    }, [logoutUser]);

    return <Navigate to='/login' />
}
