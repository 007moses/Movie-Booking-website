import React, { useState, useEffect } from "react";
import "../Styles/Movies.css";
// import axios from "axios";
import {Link, useNavigate} from "react-router-dom"
import Intrestellar from "../assets/Interstellar.jpg"
import Inception from "../assets/Inception1.webp"
import DarkKnight from "../assets/The dark knight.webp"
import Oppenheimer from "../assets/Oppenheimer.webp"
import Avengers3 from "../assets/Avengers-3.jpg"
import BlackPanther from "../assets/Black-panther.jpg"
import CaptainMarvel from "../assets/Captain-marvel.jpg"
import Avengers4 from "../assets/Avengers-4.jpg"
import Antman from "../assets/antman.jpg"
import Tenet from "../assets/Tenet.jpg"
import UseApiFetch from "../API-Method/UseApiFetch";




const Movies = () => {
  // Sample movie data (replace with API call in a real app)
  const {isLoading,serverRequest,fetchError,responseData,apiKey}=UseApiFetch();
  //  const [ProductPageList, setProductPageList] = useState(false);
  const [reRender, setReRender] = useState(false);
  const [startInit, setStartInit] = useState(true);
  // const [wishlist, setWishlist] = useState(new Set());
  // const [hoveredIcons, setHoveredIcons] = useState(new Set());
  const [ProductData, setProductData] = useState([]);
  // const [quantities, setQuantities] = useState({});
  const navigate = useNavigate()


  const ProductItems = () => {
    const requestConfig = {
      method: "GET",
      apiUrl: "/api/movies",
      apiKey: "GETMOVIES",
    };
    serverRequest(requestConfig);
    setStartInit(false);
  };

  const fnResponseForProductItems = () => {
    setReRender(!reRender);
    if (Array.isArray(responseData)) {
      setProductData(responseData);
    } else {
      console.error("Invalid product data:", responseData);
      setProductData([]);
    }
  };

  console.log(ProductData,"MoviesData")

  useEffect(() => {
    if (startInit) {
      ProductItems();
    } else {
      if (!isLoading && apiKey) {
        switch (apiKey) {
          case "GETMOVIES":
            fnResponseForProductItems();
            break;
          // case "ADDTOCART":
          //   fnResponseForAddCart();
          //   break;
          // case "UPDATECART":
          //   fnResponseForUpdateCart();
          //   break;
          // case "ADDWISHLIST":
          //   fnResponseForAddWishlist();
          //   break;
          // case "REMOVEWISHLIST":
          //   fnResponseForRemoveWishlist();
          //   break;
          // default:
          //   break;
        }
      }
    }
  }, [startInit, isLoading, apiKey, responseData, fetchError]);
  
  

  return (
    <div className="movies-page">
      <h1 className="movies-title">Now Showing</h1>
      <div className="movies-grid">
        {ProductData?.map((movie) => (
          <div key={movie.id} className="movie-card">
            <img
              src={movie?.poster}
              alt={movie?.title}
              className="movie-poster"
            />
            <div className="movie-info">
              <h2 className="movie-title">{movie?.title}</h2>
              <p className="movie-details">
                {movie?.genre} | {movie?.duration} | {movie?.rating}
              </p>
              {/* <a href={`/movies/${movie.id}`} className="book-now-btn">
                Book Now
              </a> */}
              {/* <Button to={`/movies/${movie.id}`} className="book-now-btn">
                Book Now
              </Button>  */}
              <button
               className="book-now-btn"
               onClick={()=>navigate(`/movies/${movie?.title.split(" ").join("-")}`)} >
                Book Now
              </button>
            
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Movies;
