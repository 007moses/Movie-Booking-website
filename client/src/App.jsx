import './App.css'
import Navbar from './Components/NavBar'
import Home from './Pages/Home'
import Movies from './Pages/Movies'
import {BrowserRouter,Routes,Route} from "react-router-dom"
import MyBookings from './Pages/MyBookings'
import Theaters from './Pages/Theaters'
import Profile from './Pages/Profile'
import MovieDetails from './Pages/MovieDetails.jsx'
import Login from './Pages/LoginPage.jsx'
import SignUp from './Pages/SignUpPage.jsx'
import ForgotPassword from './Pages/ForgotPassword.jsx'
import AboutUs from './Pages/About.jsx'
import Footer from './Components/Footer.jsx'
import TicketPage from './Pages/TicketPage.jsx'
import SeatBooking from './Pages/SeatBooking.jsx'

function App() {

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:title" element={<MovieDetails />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/theaters" element={<Theaters />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* <Route path='/:theater/:movie/SeatBooking' element={<SeatBooking/>}/> */}
        <Route path='/:theater/:movie/SeatBooking' element={<SeatBooking/>}/>

        <Route path='/About' element={<AboutUs/>}/>
        <Route path='/ticket/:ticketId' element={<TicketPage/>}/>
        {/* <Route path="/showtimes/:theaterID" element={}/> */}

        {/* Placeholder for booking page */}
        <Route path="/booking/:movieId/:theaterId/:showtime" element={<div>Booking Page (TBD)</div>} />
      </Routes>
      <Footer/>
    </BrowserRouter>
  )
}

export default App
