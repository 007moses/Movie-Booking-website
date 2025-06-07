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

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTheaters, setLoading, setError } from "../Redux/Slices/theatersSlice.js";
import UseApiFetch from "../API-Method/UseApiFetch";
import "../Styles/Theaters.css";

const Theaters = () => {
  const [startInit, setStartInit] = useState(true);
  const { isLoading, serverRequest, apiKey, responseData, fetchError } = UseApiFetch();
  const dispatch = useDispatch();
  const { theaters, loading, error } = useSelector((state) => state.theaters);

  const GetTheaters = () => {
    const requestConfig = {
      method: "GET",
      apiUrl: "/api/theaters",
      apiKey: "GETTHEATERS",
    };
    dispatch(setLoading());
    serverRequest(requestConfig);
  };

  const fnResponseForGetTheaters = () => {
    if (responseData?.data) {
      dispatch(setTheaters(responseData.data));
    } else {
      dispatch(setError("Invalid theater data"));
    }
  };

  useEffect(() => {
    if (startInit) {
      GetTheaters();
      setStartInit(false);
    } else if (!isLoading && apiKey === "GETTHEATERS") {
      fnResponseForGetTheaters();
    }
  }, [startInit, isLoading, apiKey, responseData,fetchError]);

  return (
    <div className="theater-details-page">
      {loading && <p className="loading">Loading theaters...</p>}
      {error && <p className="error">Error: {error}</p>}
      {!loading && !error && theaters?.length === 0 && (
        <h1 className="no-screens">No theaters are available</h1>
      )}
      {!loading && !error && theaters?.length > 0 && (
        <div className="theaters-grid">
          {theaters.map((theater) => (
            <div key={theater?._id} className="theater-card">
              <img
                src={theater?.image || "https://via.placeholder.com/400"}
                alt={theater?.name}
                className="theater-card-image"
              />
              <div className="theater-card-content">
                <h2 className="theater-card-title">{theater?.name}</h2>
                <p className="theater-card-address">
                  <strong>Address:</strong> {theater?.address}, {theater?.city}
                </p>
                <div className="theater-card-showtimes">
                  <strong>Showtimes:</strong>
                  {theater?.showtimes && theater.showtimes.length > 0 ? (
                    <select className="showtimes-dropdown">
                      <option value="" disabled selected>
                        Select a showtime
                      </option>
                      {theater.showtimes.map((showtime) => (
                        <option key={showtime._id} value={showtime._id}>
                          {showtime.movieId?.title || "Unknown Movie"} at{" "}
                          {new Date(showtime.startTime).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="no-screens">No showtimes available</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Theaters;