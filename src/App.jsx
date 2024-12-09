import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import './App.css'
import Home from "./pages/home/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import PaperPractice from "./pages/paperPractice/paperPractice";

function App() {

  return (
    <Router>
      {/* Dynamic Navigation */}

      {/* Define Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/paper-practice/:pp_id" element={<PaperPractice />} />
        <Route path="/paper-practice" element={<Navigate to="/dashboard"/>}/>
      </Routes>
    </Router>
  )
}

export default App
