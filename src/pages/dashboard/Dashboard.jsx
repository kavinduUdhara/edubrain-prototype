import "./Dashboard.css";
import profileImg from "../../assets/profile.png";
import flotingObjectsImg from "../../assets/img/objects/floating-objects.png";
import { ImLab } from "react-icons/im";
import { RiGeminiFill } from "react-icons/ri";
import { CiCircleInfo } from "react-icons/ci";
import { GiPartyPopper } from "react-icons/gi";
import { RiExternalLinkFill } from "react-icons/ri";
import { LucideNewspaper, Settings } from "lucide-react";
import { MdOutlineChatBubbleOutline } from "react-icons/md";
import { auth } from "@/firebase";

export default function Dashboard() {
  const user = auth.currentUser;

  return (
    <div className="page-holder">
      <div className="dashboard-page">
        <div className="def-holder top-holder">
          <div className="def-child top-menu">
            <div className="left">
              <div className="profile-holder">
                <img src={user.photoURL} />
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
            <img
              src={flotingObjectsImg}
              alt="floating objects"
              className="flo-obj-img"
            />
          </div>
        </div>
        <div className="bottom-holder">
          <div className=""></div>
          <div className="def-child content">
            {/* <div className="ai-s-child">
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
            </div> */}
            <div className="fetures-sec">
              <h1 className="title">
                <GiPartyPopper /> Fetrues on{" "}
                <span>
                  <ImLab /> prototype
                </span>
              </h1>
              <div className="f-list">
                <div className="f-item">
                  <h1><LucideNewspaper />Past Paper Practice</h1>
                  <p>Students can practice exam questions and receive AI-powered insights on areas needing improvement.</p>
                  <button>Practice Past Papers <RiExternalLinkFill /></button>
                </div>
                <div className="f-item">
                  <h1><MdOutlineChatBubbleOutline /> AI-Enhanced Forum</h1>
                  <p>A collaborative space for students to ask questions, share ideas, and receive AI-generated responses, with peer discussions encouraged.</p>
                  <button>Ask a questions <RiExternalLinkFill /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
