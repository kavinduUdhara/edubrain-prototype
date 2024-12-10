import "./Home.css";

import { FcGoogle } from "react-icons/fc";
import { ImLab } from "react-icons/im";
import { FaArrowDown } from "react-icons/fa6";
import Logo from "../../assets/img/main-logo.svg";
import bannerImg from "../../assets/img/main-banner.png";
import planetImg from "../../assets/img/objects/planet.png";
import spaceshipImg from "../../assets/img/objects/spaceship.png";
import rockedImg from "../../assets/img/objects/rocket.png";
import astronautImg from "../../assets/img/objects/astronaut.png";
import problemStatementImg from "../../assets/img/p-statement.jpg";
import { IoGameControllerOutline } from "react-icons/io5";
import { MdOutlineChatBubbleOutline } from "react-icons/md";
import { SiGoogleanalytics } from "react-icons/si";
import { TbHeart, TbPrompt, TbUser } from "react-icons/tb";
import { UserCountChart } from "@/components/chart";
import { LucideCodeXml, LucideGamepad2, LucideNewspaper } from "lucide-react";

import { handleGoogleLogin } from "../signIn/register/RegisterFucntions";
import { auth } from "@/firebase";
import { useEffect, useState } from "react";
import { redirect, useNavigate } from "react-router-dom";
import photoURL from "../../assets/profile.png";

export default function Home() {
  const navigate = useNavigate();

  //get user info if they have already logged in
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("User is already logged in", user);
        setUser(user);
      } else {
        setUser(null); // Handle if no user is logged in
      }
    });

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, []);

  const handelGoToDashboard = () => {
    navigate("/dashboard")
  };

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
          {!user && (
            <button className="sign-in-btn" onClick={handleGoogleLogin}>
              <FcGoogle />
              Sign in
            </button>
          )}
          {user && (
            <button className="redirect-btn max-w-[150px]" onClick={handelGoToDashboard}>
              <img src={user.photoURL} />
              <div className="info">
                <div className="name">{user.displayName}</div>
                <p>Go to Dashboard</p>
              </div>
            </button>
          )}
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
          <img src={rockedImg} className="rocket-img" alt="image of a rocket" />
          <img
            src={astronautImg}
            className="astronut-img"
            alt="image of a astronaut"
          />
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
                requirements of the competition, "AI for Impact". This will help
                gather feedback and refine the solution to better serve
                students.
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
      <div className="def-holder problem-statement-holder">
        <img className="planet-img-2" src={planetImg} alt="planet" />
        <div className="def-child problem-statement">
          <div className="def-section statement">
            <div className="max-w-md flex flex-col gap-3">
              <img
                src={problemStatementImg}
                alt="problem statement banner image"
              />
              <p>
                Many students in Sri Lanka struggle to access personalized and
                practical learning tools, making ICT education less effective
                and engaging—AI can bridge this gap.
              </p>
              <p className="self-end bg-slate-600 px-2 rounded-full text-white">
                Problem Statement
              </p>
            </div>
          </div>
          <div className="def-section solution">
            <div className="max-w-lg w-full flex flex-col items-start gap-5">
              <p className="bg-slate-600 px-2 rounded-full text-white">
                Solution
              </p>
              <div className="solutions-list">
                <div className="line"></div>
                <div className="solution-item">
                  <div className="no bg-[#407ee9]">
                    <LucideNewspaper />
                  </div>
                  <div className="info">
                    <h4>Past Paper Practice</h4>
                    <p>
                      Students can practice exam questions and receive
                      AI-powered insights on areas needing improvement.
                      <span>
                        <ImLab /> Enabled
                      </span>
                    </p>
                  </div>
                </div>
                <div className="solution-item">
                  <div className="no bg-[#e94432]">
                    <LucideGamepad2 />
                  </div>
                  <div className="info">
                    <h4>Interactive Content and Games</h4>
                    <p>
                      Aligned with the syllabus, these make learning enjoyable
                      and boost student interest.
                    </p>
                  </div>
                </div>
                <div className="solution-item">
                  <div className="no bg-[#fabd04]">
                    <MdOutlineChatBubbleOutline />
                  </div>
                  <div className="info">
                    <h4>AI-Enhanced Forum</h4>
                    <p>
                      A collaborative space for students to ask questions, share
                      ideas, and receive AI-generated responses, with peer
                      discussions encouraged.
                    </p>
                  </div>
                </div>
                <div className="solution-item">
                  <div className="no bg-[#33a453]">
                    <LucideCodeXml />
                  </div>
                  <div className="info">
                    <h4>Hands-On Experience</h4>
                    <p>
                      Provides practical learning in Python, web development,
                      and more to bridge the gap between theory and real-world
                      application.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="def-holder sign-in-msg-holder">
        <div className="def-child sign-in-msg">
          <div className="left">
            <h3>
              If you are an <span>AL ICT</span> student why wait?
            </h3>
            <p>
              Click on sign-in to enjoy the{" "}
              <span>
                <ImLab /> prototype
              </span>
            </p>
          </div>
          <div className="right">
            {!user && (
              <button onClick={handleGoogleLogin}>
                <FcGoogle /> Sign in with Google
              </button>
            )}
            {user && (
              <button className="redirect-btn max-w-[200px]" onClick={handelGoToDashboard}>
                <img src={user.photoURL} alt="user profile" />
                <div className="info">
                  <div className="name">{user.displayName}</div>
                  <p>Go to Dashboard</p>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="def-holder text-sm pb-3 text-gray-700 underline">
        <a
          href="https://www.linkedin.com/in/kavindu-udhara/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Who Developed this?{" "}
        </a>
      </div>
    </div>
  );
}
