// import React, { useState, useEffect } from 'react';
// import "../Styles/Theaters.css"
// import axios from 'axios';

// const Theaters = () => {
//   // Sample theater data (replace with API call)
//   const [theaters, setTheaters] = useState([
//     {
//       id: 1,
//       name: 'City Cinema',
//       address: '123 Main St, Downtown, Cityville',
//       amenities: ['IMAX', '3D', 'Dolby Atmos'],
//       image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2070&auto=format&fit=crop',
//     },
//     {
//       id: 2,
//       name: 'Starplex Theater',
//       address: '456 Oak Ave, Suburbia, Cityville',
//       amenities: ['4K', 'Recliner Seats'],
//       image: 'https://images.unsplash.com/photo-1485095329183-d0797cdc5676?q=80&w=2070&auto=format&fit=crop',
//     },
//     {
//       id: 3,
//       name: 'Galaxy Multiplex',
//       address: '789 Pine Rd, Uptown, Cityville',
//       amenities: ['IMAX', 'VIP Lounge', 'Dolby Atmos'],
//       image: 'https://images.unsplash.com/photo-1570172619644-d4f5fc6ef052?q=80&w=2070&auto=format&fit=crop',
//     },
//   ]);

//   // Simulate fetching theaters from API
//   useEffect(() => {
//     const fetchTheaters = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/theaters');
//         setTheaters(response.data);
//       } catch (error) {
//         console.error('Error fetching theaters:', error);
//       }
//     };
//     fetchTheaters();
//   }, []);

//   return (
//     <div className="theaters-page">
//       <h1 className="theaters-title">Our Theaters</h1>
//       {theaters.length === 0 ? (
//         <p className="no-theaters">No theaters found.</p>
//       ) : (
//         <div className="theaters-grid">
//           {theaters.map((theater) => (
//             <div key={theater.id} className="theater-card">
//               <img
//                 src={theater.image}
//                 alt={theater.name}
//                 className="theater-image"
//               />
//               <div className="theater-info">
//                 <h2 className="theater-name">{theater.name}</h2>
//                 <p className="theater-address">{theater.address}</p>
//                 <p className="theater-amenities">
//                   <strong>Amenities:</strong> {theater.amenities.join(', ')}
//                 </p>
//                 <a
//                   href={`/showtimes/${theater.id}`}
//                   className="showtimes-btn"
//                 >
//                   View Showtimes
//                 </a>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Theaters;


import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import UseApiFetch from '../API-Method/UseApiFetch';
import '../Styles/Theaters.css';

const TheaterDetails = () => {
  const { id } = useParams(); // Get theater ID from URL
  const [theater, setTheater] = useState(null);
  const [screens, setScreens] = useState([]);
  const [startInit, setStartInit] = useState(true);
  const [currentApi, setCurrentApi] = useState(null);

  const { isLoading, serverRequest, apiKey, responseData, fetchError } = UseApiFetch();

  // Function to fetch theater details
  const fetchTheaterDetails = () => {
    const requestConfig = {
      method: 'GET',
      apiUrl: `/api/theaters/${id}`,
      apiKey: 'GET_THEATER_DETAILS',
    };
    serverRequest(requestConfig);
    setCurrentApi('THEATER');
  };

  // Function to fetch screens for the theater
  const fetchScreens = () => {
    const requestConfig = {
      method: 'GET',
      apiUrl: `/api/screens/theater/${id}`,
      apiKey: 'GET_SCREENS',
    };
    serverRequest(requestConfig);
    setCurrentApi('SCREENS');
  };

  // Handle API responses
  const handleApiResponse = () => {
    if (!isLoading && responseData && !fetchError) {
      if (apiKey === 'GET_THEATER_DETAILS' && currentApi === 'THEATER') {
        setTheater(responseData.data);
        // After fetching theater, fetch screens
        fetchScreens();
      } else if (apiKey === 'GET_SCREENS' && currentApi === 'SCREENS') {
        setScreens(responseData.data);
      }
    }
  };

  useEffect(() => {
    if (startInit) {
      fetchTheaterDetails();
      setStartInit(false);
    } else {
      handleApiResponse();
    }
  }, [isLoading, apiKey, responseData, fetchError]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (fetchError) {
    return <div className="error">{fetchError}</div>;
  }

  if (!theater) {
    return <div className="error">Theater not found.</div>;
  }

  return (
    <div className="theater-details-page">
      <h1 className="theater-details-title">{theater.name}</h1>
      <div className="theater-details-container">
        <img
          src={theater.image}
          alt={theater.name}
          className="theater-details-image"
        />
        <div className="theater-info">
          <p className="theater-address">
            <strong>Address:</strong> {theater.address}, {theater.city}
          </p>
          {theater.showtimes && theater.showtimes.length > 0 && (
            <p className="theater-showtimes">
              <strong>Showtimes:</strong>{' '}
              {theater.showtimes.map((showtime) => (
                <span key={showtime._id}>
                  {showtime.movieId?.title || 'Unknown Movie'} at{' '}
                  {new Date(showtime.startTime).toLocaleString()}
                  <br />
                </span>
              ))}
            </p>
          )}
          <a href={`/showtimes/${theater._id}`} className="showtimes-btn">
            View Showtimes
          </a>
        </div>
      </div>

      <h2 className="screens-title">Available Screens</h2>
      {screens.length === 0 ? (
        <p className="no-screens">No screens found for this theater.</p>
      ) : (
        <div className="screens-grid">
          {screens.map((screen) => (
            <div key={screen._id} className="screen-card">
              <div className="screen-info">
                <h3 className="screen-number">Screen {screen.screenNumber}</h3>
                <p className="screen-seats">
                  <strong>Total Seats:</strong> {screen.totalSeats}
                </p>
                <p className="screen-layout">
                  <strong>Seat Layout:</strong>{' '}
                  {screen.seatLayout
                    .map((seat) => `${seat.seatNumber} (${seat.status})`)
                    .join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TheaterDetails;