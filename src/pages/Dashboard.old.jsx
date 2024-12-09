import "./Dashboard.css";
import profileImg from "../assets/profile.png";
import flotingObjectsImg from "../assets/img/objects/floating-objects.png";
import { ImLab } from "react-icons/im";
import { RiGeminiFill } from "react-icons/ri";
import { CiCircleInfo } from "react-icons/ci";
import { Settings } from "lucide-react";
export default function Dashboard() {
  return (
    <div className="page-holder">
      <div className="dashboard-page">
        <div className="def-holder top-holder">
          <div className="def-child top-menu">
            <div className="left">
              <div className="profile-holder">
                <img src={profileImg} />
              </div>
              <div className="welcome-txt">
                <h1>Hello, Kavindu!</h1>
                <p>
                  Welcome to EduBrain{" "}
                  <span>
                    <ImLab /> Prototype
                  </span>
                </p>
              </div>
            </div>

            {/* <div className="right">
              <button>
                <Settings />
              </button>
            </div> */}
            <img src={flotingObjectsImg} alt="floating objects" className="flo-obj-img"/>
          </div>
        </div>
        <div className="bottom-holder">
          <div className=""></div>
          <div className="def-child content">
            <div className="ai-s-child">
              <h1 className="title">
                {" "}
                <RiGeminiFill />
                Suggestions from AI
              </h1>
              <div className="no-sug">
                {" "}
                Complete at least one past paper to unlock personalized
                suggestions!
              </div>
              <div className="sug-list"></div>
            </div>
            <div className="fetures-sec">
              <h1 className="title">
                Fetrues on <span><ImLab/> prototype</span>
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
