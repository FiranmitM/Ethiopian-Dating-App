// import { useEffect, useState } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import {
// 	BrowserRouter as Router, Routes, Route
// } from 'react-router-dom'
// import signUpService from './services/signUpService'
// import { setUser } from './reducers/userReducer'
// import { getProfileData } from './reducers/profileReducer'
// import { getUserNotifications } from './reducers/userNotificationsReducer'
// import { getUserLists } from './reducers/userListsReducer'
// import Login from './components/Login'
// import Signup from './components/Signup'
// import Profile from './components/Profile'
// import ProfileSettings from './components/profile/ProfileSettings'
// import Browsing from './components/Browsing'
// import NavBar from './components/navbar/Navbar'
// import Footer from './components/Footer'
// import RedirectPage from './components/RedirectPage'
// import ConfirmMail from './components/login/ConfirmMail'
// import Chat from './components/chat/Chat'
// import Loader from './components/Loader'
// import ResetPassword, { SetNewPassword } from './components/login/ResetPassword'
// import ChangePassword from './components/profile/ChangePassword'
// import Logout from './components/Logout'
// import DeleteUser from './components/profile/DeleteUser'
// import UserProfile from './components/Userprofile'
// import PathNotExists from './components/PathNotExists'
// import { changeOnlineUsers } from './reducers/onlineUsersReducer'
// import socketIO from 'socket.io-client';
// import "./css/App.css"

// const App = () => {
// 	const [socket, setSocket] = useState(null)
// 	const [socketConnected, setSocketConnected] = useState(false)
// 	const dispatch = useDispatch()
// 	const user = useSelector(state => state.user)

// 	useEffect(() => {
// 		setSocket(socketIO('http://localhost:3001/'))
// 	}, [])

// 	useEffect(() => {
// 		if (!socket) return

// 		socket.on('connect', () => {
// 			setSocketConnected(true)
// 		})
// 		socket.on('newUserResponse', (data) => {
// 			dispatch(changeOnlineUsers(data))
// 		})
// 	}, [socket, dispatch, user])

// 	useEffect(() => {
// 		dispatch(getProfileData())
// 		dispatch(getUserLists())
// 		dispatch(getUserNotifications())
// 		signUpService
// 			.getSessionUser()
// 			.then(result => {
// 				dispatch(setUser(result))
// 			})
// 	}, [dispatch])

// 	useEffect(() => {
// 		if (user && socketConnected) {
// 			if (user.name && socket.id) {
// 				socket.emit("newUser", { name: user.name, id: user.id, socketID: socket.id })
// 				socket.emit("join_notification", { id: user.id })
// 			}
// 		}
// 	}, [user, socket, socketConnected])

// 	if (!socketConnected) return <Loader text="Waiting for socket..." />

// 	return <div className='content-wrap'>
// 		<Router>
// 			<RedirectPage />
// 			<NavBar socket={socket} />
// 			<Routes>
// 				<Route path="/" element={<Profile />} />
// 				<Route path="/login" element={<Login socket={socket} />} />
// 				<Route path="/login/resetpassword" element={<ResetPassword />} />
// 				<Route path="/resetpassword/:user/:code" element={<SetNewPassword />} />
// 				<Route path="/signup" element={<Signup />} />
// 				<Route path="/settings" element={<ProfileSettings />} />
// 				<Route path="/changepassword" element={<ChangePassword />} />
// 				<Route path="/confirm/:user/:code" element={<ConfirmMail />} />
// 				<Route path="/profile" element={<Profile />} />
// 				<Route path="/profile/:id" element={<UserProfile />} />
// 				<Route path="/browsing" element={<Browsing />} />
// 				<Route path="/chat" element={<Chat socket={socket} />} />
// 				<Route path="/chat/:id" element={<Chat socket={socket} />} />
// 				<Route path="/logout" element={<Logout socket={socket} />} />
// 				<Route path="/deleteuser" element={<DeleteUser />} />
// 				<Route path='*' element={<PathNotExists />} />
// 			</Routes>
// 		</Router>
// 		<Footer />
// 	</div>
// }

// export default App





import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import signUpService from './services/signUpService';
import { setUser } from './reducers/userReducer';
import { getProfileData } from './reducers/profileReducer';
import { getUserNotifications } from './reducers/userNotificationsReducer';
import { getUserLists } from './reducers/userListsReducer';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import ProfileSettings from './components/profile/ProfileSettings';
import Browsing from './components/Browsing';
import NavBar from './components/navbar/Navbar';
import Footer from './components/Footer';
import ConfirmMail from './components/login/ConfirmMail';
import Chat from './components/chat/Chat';
import Loader from './components/Loader';
import ResetPassword, { SetNewPassword } from './components/login/ResetPassword';
import ChangePassword from './components/profile/ChangePassword';
import Logout from './components/Logout';
import DeleteUser from './components/profile/DeleteUser';
import UserProfile from './components/Userprofile';
import PathNotExists from './components/PathNotExists';
import { changeOnlineUsers } from './reducers/onlineUsersReducer';
import socketIO from 'socket.io-client';
import "./css/App.css";

const App = () => {
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = socketIO('http://localhost:3001', {
      withCredentials: true,
      transports: ['websocket']
    });
    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      setSocketConnected(true);
      console.log('Socket connected:', socket.id);
    };

    const onNewUserResponse = (data) => {
      dispatch(changeOnlineUsers(data));
    };

    socket.on('connect', onConnect);
    socket.on('newUserResponse', onNewUserResponse);

    return () => {
      socket.off('connect', onConnect);
      socket.off('newUserResponse', onNewUserResponse);
    };
  }, [socket, dispatch]);

  // Fetch initial user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionUser = await signUpService.getSessionUser();
        if (sessionUser) {
          dispatch(setUser(sessionUser));
          dispatch(getProfileData());
          dispatch(getUserLists());
          dispatch(getUserNotifications());
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchData();
  }, [dispatch]);

  // Emit user data when socket is ready
  useEffect(() => {
    if (user && socketConnected && socket) {
      socket.emit('newUser', { 
        name: user.name, 
        id: user.id, 
        socketID: socket.id 
      });
      socket.emit('join_notification', { id: user.id });
    }
  }, [user, socket, socketConnected]);

  if (!socketConnected) {
    return <Loader text="Connecting to server..." />;
  }

  return (
    <div className='content-wrap'>
      <Router>
        <NavBar socket={socket} />
        <Routes>
          <Route path="/" element={
            user ? <Profile /> : <Navigate to="/login" replace />
          } />
          <Route path="/login" element={
            !user ? <Login socket={socket} /> : <Navigate to="/" replace />
          } />
          <Route path="/login/resetpassword" element={<ResetPassword />} />
          <Route path="/resetpassword/:user/:code" element={<SetNewPassword />} />
          <Route path="/signup" element={
            !user ? <Signup /> : <Navigate to="/" replace />
          } />
          <Route path="/settings" element={
            user ? <ProfileSettings /> : <Navigate to="/login" replace />
          } />
          <Route path="/changepassword" element={
            user ? <ChangePassword /> : <Navigate to="/login" replace />
          } />
          <Route path="/confirm/:user/:code" element={<ConfirmMail />} />
          <Route path="/profile" element={
            user ? <Profile /> : <Navigate to="/login" replace />
          } />
          <Route path="/profile/:id" element={
            user ? <UserProfile /> : <Navigate to="/login" replace />
          } />
          <Route path="/browsing" element={
            user ? <Browsing /> : <Navigate to="/login" replace />
          } />
          <Route path="/chat" element={
            user ? <Chat socket={socket} /> : <Navigate to="/login" replace />
          } />
          <Route path="/chat/:id" element={
            user ? <Chat socket={socket} /> : <Navigate to="/login" replace />
          } />
          <Route path="/logout" element={<Logout socket={socket} />} />
          <Route path="/deleteuser" element={
            user ? <DeleteUser /> : <Navigate to="/login" replace />
          } />
          <Route path='*' element={<PathNotExists />} />
        </Routes>
      </Router>
      <Footer />
    </div>
  );
};

export default App;