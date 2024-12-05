import "./Home.css";

import { FcGoogle } from "react-icons/fc";
import { ImLab } from "react-icons/im";
import { FaArrowDown } from "react-icons/fa6";
import Logo from "../assets/img/main-logo.svg";
import bannerImg from "../assets/img/main-banner.png";
import planetImg from "../assets/img/objects/planet.png";
import spaceshipImg from "../assets/img/objects/spaceship.png";

export default function Home() {
  return (
    <div className="def-page home-page">
      <div className="def-holder main-banner-holder">
        <div className="planet-track-holder">
          <div className="planet-track">
            <img className="planet" src={planetImg} />
          </div>
        </div>
        <div className="def-child main-banner">
          <img className="spaceship" src={spaceshipImg} />
          <button className="sign-in-btn">
            <FcGoogle />
            Sign in
          </button>
          <div className="main-banner-content">
            <h1>EduBrain</h1>
            <p>
              <ImLab /> Prototype
            </p>
          </div>
          <div className="bottom">
            <div className="left">
              <div className="logo">
                <img src={Logo} alt="EduBrain" />
              </div>
            </div>
            <div className="right">
              <button>
                Learn More <FaArrowDown />
              </button>
            </div>
          </div>
          <img src={bannerImg} alt="banner-image" className="banner-img" />
        </div>
      </div>
    </div>
  );
}
