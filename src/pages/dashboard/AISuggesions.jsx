import "./AIsuggesions.css";
import GeminiSVG from "@/components/Gemini"

export default function AISuggestions() {
  return (
    <div className="ai-sug-holder">
      <h1 className="title">
        <GeminiSVG/>
        <b>AI thinks</b> you should focusing on these topics
      </h1>
      <div className="unit-list">
        <button className="unit-item">OS</button>
        <button className="unit-item" data-active={true}>DBMS</button>
        <button className="unit-item">Net & Com</button>
        <button className="unit-item">Sys Des</button>
        <button className="unit-item">Coding</button>
        <button className="unit-item">Web Dev</button>
      </div>
      <div className="tag-list">
        <div className="tag">
          <div className="tag-id">8.2.2</div>
          <div className="tag-name">Relational database model</div>
        </div>
        <div className="tag">
          <div className="tag-id">8.2.3</div>
          <div className="tag-name">Compcomponents of a DB system</div>
        </div>
        <div className="tag">
          <div className="tag-id">8.2.4</div>
          <div className="tag-name">Logical database schema</div>
        </div>
        <button className="view-more">View all 13</button>
      </div>
    </div>
  );
}