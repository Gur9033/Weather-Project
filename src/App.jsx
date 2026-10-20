import {BrowserRouter,Routes,Route} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Weather from "./pages/Weather";
import Cities from "./pages/Cities";
import Map from "./pages/Map";
import Settings from "./pages/Settings";
function App()
{
  return(
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<MainLayout/>}>
      <Route index element={<Weather />} />
      <Route path="/weather" element={<Weather/>}/>
      <Route path="/cities" element={<Cities/>}/>
      <Route path="/map" element={<Map/>}/>
      <Route path="/settings" element={<Settings/>}/>
      </Route>
    </Routes>
    </BrowserRouter>
  )
}
export default App;