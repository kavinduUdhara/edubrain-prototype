import { useEffect, useState } from "react";
import "./AIsuggesions.css";
import GeminiSVG from "@/components/Gemini";
import { db, auth } from "@/firebase";
import { getDoc, doc } from "firebase/firestore";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiInfo } from "react-icons/fi";

export default function AISuggestions() {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        // Replace 'collectionName' and 'docId' with your Firestore path
        const docRef = doc(
          db,
          "users",
          auth.currentUser.uid,
          "user-sensitive-info",
          "ai_suggestions"
        );
        const docSnap = await getDoc(docRef);

        const subUnitDocRef = doc(db, "brief_det", "sub_units");
        const subUnitDocSnap = await getDoc(subUnitDocRef);
        const subUnitData = subUnitDocSnap.exists
          ? subUnitDocSnap.data().data
          : {};
        
        const unitDocRef = doc(db, "brief_det", "units");

        if (docSnap.exists()) {
          const data = docSnap.data().data;
          const enrichedData = data.map((item) => ({
            ...item,
            sub_unit_title:
              subUnitData[item.sub_unit_id]?.sub_unit_title || "Unknown title",
          }));
          setSuggestions(enrichedData || []); // Assuming data has a 'suggestions' field
          console.log(enrichedData);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false); // Stop loading once data is fetched
      }
    };
    fetchSuggestions();
  }, []);
  return (
    <div className="ai-sug-holder">
      <div className="title">
        <GeminiSVG />
        <h1>
          <b>AI thinks</b> you should focusing on these topics
        </h1>
      </div>
      {loading && (
        <>
          <div className="unit-list">
            <button className="loading-button def-loading-box rounded-full w-14 h-7 bg-white shadow-sm border-2"></button>
            <button className="loading-button def-loading-box rounded-full w-10 h-7 bg-white shadow-sm border-2"></button>
            <button className="loading-button def-loading-box rounded-full w-16 h-7 bg-white shadow-sm border-2"></button>
          </div>
          <div className="tag-list def-loading-box h-28 shadow">
            <div className="bg-white absolute z-20 flex items-center gap-2 shadow-md p-1 px-2 rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <AiOutlineLoading3Quarters className="def-loading-svg" /> Loading
              Suggestions
            </div>
          </div>
        </>
      )}
      {suggestions.length != 0 && !loading && (
        <>
          <div className="unit-list">
            <button className="unit-item" data-active={true}>
              All
            </button>
            <button className="unit-item">OS</button>
            <button className="unit-item">DBMS</button>
            <button className="unit-item">Net & Com</button>
            <button className="unit-item">Sys Des</button>
            <button className="unit-item">Coding</button>
            <button className="unit-item">Web Dev</button>
          </div>
          <div className="tag-list">
            {suggestions.map((suggestion, index) => (
              <div className="tag" key={index}>
                <div className="tag-id">{suggestion.sub_unit_id}</div>
                <div className="tag-name">{suggestion.sub_unit_title}</div>
              </div>
            ))}
            <button className="view-more">View all 13</button>
          </div>
        </>
      )}
      {suggestions.length === 0 && !loading && (
        <div className="tag-list">
          <p className="w-full p-2 px-2 text-slate-700">
            <FiInfo className="inline-block -mt-1 mr-1" />
            Complete at least one past paper to unlock personalized suggestions!{" "}
            <br />
            <span className="text-sm">
              If you've already completed one past paper and are still seeing
              this, your suggestions are being created. Please try
              again after a few minutes.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
