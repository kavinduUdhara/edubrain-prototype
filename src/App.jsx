import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import './App.css'
import Home from "./pages/home/Home";
import Dashboard from "./pages/dashboard/Dashboard";

function App() {

  return (
    <Router>
      {/* Dynamic Navigation */}

      {/* Define Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
