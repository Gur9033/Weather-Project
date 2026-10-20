import { Link } from "react-router-dom";
function Sidebar()
{
  return(
    <aside className="sidebar">
        <Link to="/" className="brand" aria-label="Home">
            ≋
        </Link>
        <nav>
            <Link to="/" className="nav-link">
                <span className="nav-icon">🌦️</span>
                <span>Weather</span>
            </Link>
            <Link to="/cities" className="nav-link">
                <span className="nav-icon">☷</span>
                <span>Cities</span>
            </Link>
            <Link to="/map" className="nav-link">
                <span className="nav-icon">🗺️</span>
                <span>Map</span>
            </Link>
            <Link to="/settings" className="nav-link">
                <span className="nav-icon">⚙</span>
                <span>Settings</span>
            </Link>
        </nav>
    </aside>
  );
}
export default Sidebar;





