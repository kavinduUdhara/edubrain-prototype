import "./Home.css";

import { FcGoogle } from "react-icons/fc";
import { ImLab } from "react-icons/im";
import { FaArrowDown } from "react-icons/fa6";
import Logo from "../assets/img/main-logo.svg";
import bannerImg from "../assets/img/main-banner.png";
import planetImg from "../assets/img/objects/planet.png";
import spaceshipImg from "../assets/img/objects/spaceship.png";
import rockedImg from "../assets/img/objects/rocket.png";
import astronautImg from "../assets/img/objects/astronaut.png";
import { SiGoogleanalytics } from "react-icons/si";
import { TbHeart, TbPrompt, TbUser } from "react-icons/tb";
import { UserCountChart } from "@/components/chart";

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
      <div className="def-holder about-and-num-holder">
        <div className="def-child about-and-num-child">
          <img src={rockedImg} className="rocket-img" alt="image of a rocket"/>
          <img src={astronautImg} className="astronut-img" alt="image of a astronaut"/>
          <div className="def-section numbers">
            <div className="users-number-holder">
              <div className="user-count">
                <div className="number">
                  <h3>50</h3>
                  <p>
                    <TbUser /> users
                  </p>
                </div>
                <UserCountChart />
              </div>
            </div>
            <div className="more-count">
              <div className="count">
                <h3>50</h3>
                <p>
                  <TbPrompt /> Prompts
                </p>
              </div>
              <div className="count">
                <h3>70%</h3>
                <p>
                  <TbUser /> Active Users
                </p>
              </div>
              <div className="count">
                <h3>80%</h3>
                <p>
                  <TbHeart /> Loved suggestions
                </p>
              </div>
            </div>
            <div className="about-prototype">
              <div className="title">
                <ImLab /> Prototype
              </div>
              <p>
                A prototype of EduBrain with limited functionalities is being
                developed to test its core features and align with the
                requirements of the competition, "AI for Impact". This will help gather feedback
                and refine the solution to better serve students.
              </p>
            </div>
          </div>
          <div className="def-section about">
            <h2 className="title">
              <img src={Logo} /> About EduBrain
            </h2>
            <p>
              EduBrain is a platform that empowers students to excel by
              delivering personalized, engaging, and interactive learning
              experiences driven by innovative technology.
            </p>
            <h2 className="self-end">{"EduBrain's Mission"}</h2>
            <p>
              To empower every student to reach their full potential by
              providing personalized, engaging, and innovative learning
              experiences that make education accessible, effective, and
              enjoyable for all.
            </p>
            <h2>{"EduBrain's Vision"}</h2>
            <p>
              To revolutionize education by creating a world where every student
              thrives through personalized learning, fostering a lifelong
              passion for knowledge and success.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
