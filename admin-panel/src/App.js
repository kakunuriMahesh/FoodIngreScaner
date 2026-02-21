import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Pending from "./pages/Pending";
import Ingredients from "./pages/Ingredients";
import AddIngredient from "./pages/AddIngredient";
import EditIngredient from "./pages/EditIngredient";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Ingredients />} />
        <Route path="/pending" element={<Pending />} />
        <Route path="/add" element={<AddIngredient />} />
        <Route path="/edit/:id" element={<EditIngredient />} />
      </Routes>
    </Router>
  );
}

export default App;
