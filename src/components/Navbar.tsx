import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Navbar, Nav, Container } from "react-bootstrap";

export const NavbarComponent = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/campaigns", label: "Active Campaign" },
    { to: "/contact", label: "Contact Us" },
    user ? { to: "/dashboard", label: "Studio" } : { to: "/login", label: "Login" },
  ].filter(Boolean);

  // Hide navbar on admin pages
  if (location.pathname.startsWith("/admin")) return null;

  return (
    <Navbar expand="lg" fixed="top" className="bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm py-2">
      <Container>
        <Navbar.Brand as={Link} to="/" className="flex items-center gap-3 group">
          <img 
            src="/logo.png" 
            alt="Salmanul Faris Logo" 
            className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300" 
          />
          <span className="text-xl font-black text-gray-900 tracking-tighter hidden sm:inline uppercase">
            Salmanul Faris<span className="text-indigo-600">.</span>
          </span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {navLinks.map((link: any) => (
              <Nav.Link
                key={link.to}
                as={Link}
                to={link.to}
                className={`mx-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  location.pathname === link.to
                    ? "text-indigo-700 bg-indigo-50"
                    : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50 mb-2 mb-lg-0"
                }`}
              >
                {link.label}
              </Nav.Link>
            ))}
            
            {user && (
                <div className="d-flex align-items-center gap-3 ms-lg-4 ps-lg-4 border-lg-start border-gray-100 mt-3 mt-lg-0 w-100 w-lg-auto justify-content-between p-2 p-lg-0 bg-gray-50 bg-lg-transparent rounded-lg">
                    <div className="d-flex align-items-center gap-2">
                      <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200" />
                      <span className="text-xs font-semibold text-gray-700 d-lg-none">{user.name}</span>
                    </div>
                    <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors border-0 bg-transparent">
                        <LogOut size={18} />
                    </button>
                </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export const NavbarWrapper = () => <NavbarComponent />;
export { NavbarWrapper as Navbar };
