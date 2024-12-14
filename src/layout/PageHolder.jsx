import "./pageHolder.css";
import { ImLab } from "react-icons/im";
import { auth } from "@/firebase";

export default function PageHolder({ children, maxW = 5 }) {
  const user = auth.currentUser;

  return (
    <div className="page-holder">
      <div className="dashboard-page">
        <div className="def-holder top-holder">
          <div className={`top-menu ${maxW ? `max-w-${maxW}xl` : "max-w-5xl"}`}>
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
                  <h1>{user.displayName}</h1>
                  <p>@{user.email.split("@")[0]}</p>
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
          <div className={`content ${maxW ? `max-w-${maxW}xl` : ""}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
