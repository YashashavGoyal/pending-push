import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useAuth } from './utils/auth';

// Components
import Home from './Layouts/Home/Home';
import Register from './Components/Register/Register';
import Contact from './Components/Contact/Contact';
import Login from './Components/Login/Login';
import CreatePost from './Components/CreatePost/CreatePost';
import About from './Components/About/About';
import Feed from './Components/Feed/Feed';
import Logout from './Components/Logout/Logout';
import PrivateRoute from './utils/PrivateRoute';
import Admin from './Layouts/Admin/Admin';
import AdminProtect from './utils/AdminProtect';
import AdminPosts from './Components/AdminPosts/AdminPosts';
import AdminProfile from './Components/Profile/AdminProfile';
import AuthAdmin from './Layouts/AuthAdmin/AuthAdmin';
import AuthUsers from './Components/AuthUsers/AuthUsers';


const App = () => {

    const { isLoading, isLoggedIn } = useAuth();


    if (isLoading) {
        return <h1>Loading...</h1>
    }



    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Home />}>
                        {/* PUBLIC ROUTES */}
                        <Route path='about' element={<About />} />
                        <Route path='contact' element={<Contact />} />
                        <Route path='register' element={<Register />} />
                        <Route path='login' element={<Login />} />
                        {/* PRIVATE ROUTES */}
                        <Route path='feed' element={<PrivateRoute isLoggedIn={isLoggedIn}><Feed /></PrivateRoute>} />
                        <Route path='create-post' element={<PrivateRoute isLoggedIn={isLoggedIn}><CreatePost /></PrivateRoute>} />
                        <Route path='logout' element={<PrivateRoute isLoggedIn={isLoggedIn}><Logout /></PrivateRoute>} />
                    </Route>


                    <Route path='/user/admin' element={
                        <PrivateRoute isLoggedIn={isLoggedIn}><Admin /></PrivateRoute>
                    } >
                        <Route path='posts' element={<AdminPosts />} />
                        <Route path='profile' element={<AdminProfile />} />
                    </Route>


                    <Route path='/auth/admin' element={
                        <AdminProtect><AuthAdmin /></AdminProtect>
                    } >
                        <Route path='users' element={<AuthUsers />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App;