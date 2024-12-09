import profilePic from "../assets/profile.png";
import { TimeSpentChart } from "@/components/chart";
import "./Dashboard.css";
import { ImLab } from "react-icons/im";
export default function Dashboard() {
  return (
    <div className="dashboard-pg-holder">
      <div className="dashboard-pg">
        <div className="left">
          <div className="profile-det-holder">
            <div className="profile-pic-holder">
              <img src={profilePic} alt="profile-pic-img" />
            </div>
            <div className="name">Kavindu Udhara</div>
            <div className="username">@wmkavinduudhara</div>
            <div className="chart-holder">
              <TimeSpentChart />
            </div>
          </div>
        </div>
        <div className="right">
          {/* <div className="greeting-section">
            <h1>Good Morning!</h1>
            <p>Kavindu</p>
          </div> */}
          <div className="fetures-offered">
            <div className="title">
              <h1>
                Features Offered in <span><ImLab/> prototype</span>
              </h1>
            </div>
            <div className="f-list">
              <div className="f-itme">
                <div className="title">Past paper practice</div>
                <p>Students can practice exam questions and receive AI-powered insights on areas needing improvement.</p>
                <button>Practice Now</button>
              </div>
              <div className="f-itme">
                <div className="title">AI-Enhanced Forum</div>
                <p>A collaborative space for students to ask questions, share ideas, and receive AI-generated responses, with peer discussions encouraged.</p>
                <button>Ask anything</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
