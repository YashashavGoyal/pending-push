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


const App = () => {

    const { isLoggedin } = useAuth();
    console.log(isLoggedin);
    
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Home />}>
                        <Route path='' element={(isLoggedin) ? <Feed /> : <></>} />
                        <Route path='about' element={<About />} />
                        <Route path='contact' element={<Contact />} />
                        <Route path='create-post' element={<CreatePost />} />
                        <Route path='register' element={<Register />} />
                        <Route path='login' element={<Login />} />
                        <Route path='logout' element={<Logout />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App;