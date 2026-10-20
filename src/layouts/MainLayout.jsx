import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
function MainLayout()
{
    return(
        <div className="app">
            <Sidebar/>
            <main className="main-content">
                <Outlet/>
            </main>
        </div>
    );
}
export default MainLayout;