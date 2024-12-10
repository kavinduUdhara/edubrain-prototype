import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import './App.css'
import Home from "./pages/home/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import PaperPractice from "./pages/paperPractice/paperPractice";
import AuthProtectedLayout from "./layout/AuthProtecetdLayout";
import Login from "./pages/signIn/SignIn";

function App() {

  return (
    <Router>
      {/* Dynamic Navigation */}

      {/* Define Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/log-in" element={<Login/>}/>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/paper-practice/:pp_id" element={<AuthProtectedLayout><PaperPractice /></AuthProtectedLayout>} />
        <Route path="/paper-practice" element={<Navigate to="/dashboard"/>}/>
      </Routes>
    </Router>
  )
}

export default App
