import "./Dashboard.css";
import profileImg from "../../assets/profile.png";
import flotingObjectsImg from "../../assets/img/objects/floating-objects.png";
import { ImLab } from "react-icons/im";
import { RiGeminiFill } from "react-icons/ri";
import { CiCircleInfo } from "react-icons/ci";
import { GiPartyPopper } from "react-icons/gi";
import { RiExternalLinkFill } from "react-icons/ri";
import { FaUncharted } from "react-icons/fa6";
import { LucideNewspaper, Settings } from "lucide-react";
import { MdOutlineChatBubbleOutline } from "react-icons/md";
import { auth } from "@/firebase";

import UnitWeightChart from "./SpiderWebChart";
import { UnitAvgMarksChart } from "./BarChart";
import UnitsFlowChart from "@/components/UnitsOverviewTree";
import { useNavigate } from "react-router-dom";
import { PaperListPopUp } from "./PaperListPopUp";

export default function Dashboard() {
  const user = auth.currentUser;
  const navigate = useNavigate();

  return (
    <div className="page-holder">
      <div className="dashboard-page">
        <div className="def-holder top-holder">
          <div className="def-child top-menu">
            <div className="left">
              <button
                onClick={() => {
                  navigate("/");
                }}
                className="logo-holder"
              >
                <div className="logo-icon-holder">
                  <img src="/main-logo.svg" />
                </div>
                <h1>
                  EduBrain{" "}
                  <span>
                    <ImLab />
                  </span>
                </h1>
              </button>
            </div>
            <div className="right">
              <button className="profile-info-holder">
                <div className="profile-holder">
                  <img src={user.photoURL} />
                </div>
                <div className="welcome-txt">
                  <h1>Kavindu Udhara</h1>
                  <p>@kavinduudhara</p>
                  {/* <p>
                  Welcome to EduBrain{" "}
                  <span>
                    <ImLab /> Prototype
                  </span>
                </p> */}
                </div>
              </button>
            </div>

            {/* <img
              src={flotingObjectsImg}
              alt="floating objects"
              className="flo-obj-img"
            /> */}
          </div>
        </div>
        <div className="bottom-holder">
          <div className=""></div>
          <div className="def-child content gap-5">
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
            <div className="overview-sec fetures-sec">
              <h1 className="title">
                <FaUncharted /> Numbers to wrap your head around
              </h1>
              <div className="flex flex-wrap gap-3">
                <UnitWeightChart />
                <UnitAvgMarksChart />
              </div>
            </div>
            <div className="fetures-sec">
              <h1 className="title">
                <GiPartyPopper /> Fetrues on{" "}
                <span>
                  <ImLab /> prototype
                </span>
              </h1>
              <div className="f-list">
                <div className="f-item">
                  <h1>
                    <LucideNewspaper />
                    Past Paper Practice
                  </h1>
                  <p>
                    Students can practice exam questions and receive AI-powered
                    insights on areas needing improvement.
                  </p>
                  <PaperListPopUp>
                    <button>
                      Practice Past Papers <RiExternalLinkFill />
                    </button>
                  </PaperListPopUp>
                </div>
                {/* <div className="f-item">
                  <h1>
                    <MdOutlineChatBubbleOutline /> AI-Enhanced Forum
                  </h1>
                  <p>
                    A collaborative space for students to ask questions, share
                    ideas, and receive AI-generated responses, with peer
                    discussions encouraged.
                  </p>
                  <button>
                    Ask a questions <RiExternalLinkFill />
                  </button>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
