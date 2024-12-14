import { AiOutlineLoading3Quarters } from "react-icons/ai";
import "./ErrorWithOllie.css";
import { MdFilterListOff } from "react-icons/md";
import OllieImg from "../../assets/img/objects/octopus-on-the-coutch.png";
import { useNavigate } from "react-router-dom";

export default function ErrorWithOllie({
  title,
  clearFilter,
  action,
  children,
  redirectToHome,
  loading,
  loadingTitle,
  loadingProgress,
  hideOllie,
}) {

  const navigate = useNavigate();

  const redirect = (link) => {
    navigate(link);
  };

  return (
    <div className="not-found">
      {!hideOllie && (
        <img src={OllieImg} alt="Not Found" />
      )}
      {title && (
        <h1>{title}</h1>
      )}
      {children && (
        <p>{children}</p>
      )}
      {loading && (
        <div className="checking-info">
          <AiOutlineLoading3Quarters /> {loadingTitle || "Loading"} {loadingProgress && <span>{loadingProgress}</span>}
        </div>
      )}
      {clearFilter && (
        <button onClick={action}>
          <MdFilterListOff /> Clear Filters
        </button>
      )}
      {redirectToHome && (
        <button onClick={() => navigate("/")}>
          <img className="def-logo-img w-7 duration-300" src="/main-logo.svg" />
          Back to home
        </button>
      )}
    </div>
  );
}
