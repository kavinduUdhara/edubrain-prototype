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
import PageHolder from "@/layout/PageHolder";
import AISuggestions from "./AISuggesions";
import { functions } from "@/firebase";
import { httpsCallable } from "firebase/functions";

export default function Dashboard() {
  const user = auth.currentUser;
  const navigate = useNavigate();

    const handleClick = async (uid) => {
      try {
        const predictAndStore = httpsCallable(functions, "predictAISuggestionsAndStore");
        const result = await predictAndStore({ uid });
        console.log("Function Result:", result.data);
        alert("AI suggestions saved successfully!");
      } catch (error) {
        console.error("Error calling function:", error);
        alert("An error occurred. Check console for details.");
      }
    };

  return (
    <PageHolder maxW={5} >
      <div className="def-child content gap-5 p-3 px-5">
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
          <h1 className="title mb-3">
            <FaUncharted /> Numbers to wrap your head around
          </h1>
          <div className="flex flex-wrap gap-3">
            <UnitWeightChart />
            <UnitAvgMarksChart />
          </div>
          <AISuggestions/>
        </div>
        <button onClick={() => {handleClick(auth.currentUser.uid)}}>update suggestions</button>
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
    </PageHolder>
  );
}
