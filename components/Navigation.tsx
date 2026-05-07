"use client";

import { auth } from "@/lib/auth/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import inRange from 'lodash.inrange';
import { signOut } from "@/lib/auth/auth-actions";
import { useEffect, useRef, useState } from "react";

import { IoMdSunny, IoIosMoon } from "react-icons/io";

type Session = typeof auth.$Infer.Session;

export default function Navigation({ session }: { session: Session | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);

  // MODOS LIGHT Y DARK
  useEffect(() => {
    setMounted(true);
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  if (!mounted) {
    return <div className="p-2 w-6 h-6" />;
  }

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const changeLang = (lang: string) => {
    console.log('lang changed', lang)
    alert('Under Construction');
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    sessionStorage.clear();
    await signOut();
  };

  // RECARGA DE PÁGINA Properties
  const handleNavClick = () => {
    if (window.location.pathname === "/cms-manager") {
      if ('pending_urls' in sessionStorage) { sessionStorage.removeItem('pending_urls') };
      if ('last_id_results' in sessionStorage) { sessionStorage.removeItem('last_id_results') };
      if ('last_prov_results' in sessionStorage) { sessionStorage.removeItem('last_prov_results') };
      if ('last_search_results' in sessionStorage) { sessionStorage.removeItem('last_search_results') };
      if ('last_scroll_pos' in sessionStorage) { sessionStorage.removeItem('last_scroll_pos') };

      router.refresh();
      router.push('/cms-manager')

      window.scrollTo({
        top: 0,
        behavior: 'smooth' // 'smooth' para desplazamiento suave, 'instant' para salto inmediato
      });
    }
  };

  return (
    <header className="bgprimary txtprimary backdrop-blur-sm border-b border-zinc-700 sticky top-0 z-50">
      <div
        className="ancho-global"
        style={{ height: "var(--navbar-h)" }}
      >
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 min-w-0 shrink" onClick={closeMenu}>
            <div className="logobutton rounded-lg flex items-center justify-center shrink-0">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org"
              >
                {/* Casa: Subida ligeramente para despejar la base */}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2 9l10-8 10 8M4 8v7a1 1 0 001 1h14a1 1 0 001-1V8"
                />

                {/* Siglas RBE: Mantienen su tamaño pero con margen superior */}
                <text
                  x="12"
                  y="23"
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="900"
                  fill="currentColor"
                  strokeWidth="0"
                  style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '0.2px' }}
                >
                  RBE
                </text>
              </svg>
            </div>
            <div className="truncate font-semibold text-sm md:text-xl">Real Better Estate</div>
            {/* flex gap-4 overflow-hidden text-xl font-bold leading-4 */}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden nav:flex items-center space-x-1">
            {session && (
              <>
                <div className="flex flex-col items-end">
                  <p className="txtsecondaryfaded text-sm font-bold leading-4 text-right">{session.user.name.toUpperCase()}</p>
                  <p className="txtsecondaryfaded text-xs opacity-80 -mt-1 leading-4 text-right">{session.user.roleName.charAt(0).toUpperCase() + session.user.roleName.slice(1).toLowerCase()}</p>
                </div>
                <Link
                  href="/user-data"
                  title="Profile"
                  className={`${isActive("/user-data") ? "profileonbutton" : "profileoffbutton"}`}
                >
                  {session.user.name.charAt(0).toUpperCase()}
                </Link>
              </>
            )}
            <Link
              href="/#search"
              title="Search Properties"
              className={`${isActive("/") ? "navonbutton" : "navoffbutton"}`}
            >
              Search
            </Link>

            {session && (
              <>
                {inRange(session?.user.userRol, 10, 100) && (
                  <Link
                    href="/cms-manager"
                    onClick={handleNavClick}
                    title="My properties"
                    className={`${isActive("/cms-manager") ? "navonbutton" : "navoffbutton"}`}
                  >
                    Properties
                  </Link>
                )}
                {inRange(session?.user.userRol, 100, 1000) && (
                  <Link
                    href="/cms-admin"
                    title="My properties"
                    className={`${isActive("/cms-admin") ? "navonbutton" : "navoffbutton"}`}
                  >
                    Properties
                  </Link>
                )}
              </>
            )}
            <Link
              href="/paperwork"
              className={`${isActive("/paperwork") ? "navonbutton" : "navoffbutton"}`}
            >
              Paperwork
            </Link>
            {session && (
              <>
                <button onClick={handleLogout} className="navoffbutton cursor-pointer" title="Close session">
                  Go Out
                </button>
              </>
            )}

            {!session && (
              <Link
                href="/auth"
                title="Login"
                className={`${isActive("/auth") ? "navonbutton" : "navoffbutton"}`}
              >
                Go In
              </Link>
            )}
            <select
              className="field-select-lang"
              onChange={(e) => {
                const selectedValue = e.target.value;
                changeLang(selectedValue);
              }}
            >
              <option value="es">&#127466;&#127480;</option>
              <option value="en">&#127468;&#127463;</option>
              <option value="fr">&#127467;&#127479;</option>
            </select>
            <div onClick={toggleDarkMode} className="cursor-pointer pl-2">
              {darkMode ? (
                <IoMdSunny className="hover:scale-125 transition-transform duration-300" title="Light Mode" />
              ) : (
                <IoIosMoon className="hover:scale-125 transition-transform duration-300" title="Dark Mode" />
              )}
            </div>
          </nav>

          {/* Hamburger Button - visible below 500px */}
          <button
            onClick={toggleMenu}
            className="nav:hidden flex flex-col justify-center items-center w-10 h-10 cursor-pointer z-50"
            aria-label="Toggle menu"
          >
            <span
              className={`hamburger-line ${isMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
            />
            <span
              className={`hamburger-line my-1 ${isMenuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`hamburger-line ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu - Slide Down */}
      <div className={`nav:hidden mobile-menu ${isMenuOpen ? "mobile-menu-open" : ""}`}>
        <nav className="flex flex-col space-y-1 p-4 bgprimary border-t border-zinc-700">
          {session && (
            <div className="flex items-center justify-center">
              <Link
                href="/user-data"
                onClick={closeMenu}
                className={`${isActive("/user-data") ? "profileonbutton" : "profileoffbutton"}`}
              >
                {session.user.name.charAt(0).toUpperCase()}
              </Link>
            </div>
          )}
          <Link
            href="/#search"
            onClick={closeMenu}
            className={`${isActive("/") ? "navonbutton" : "navoffbutton"} text-center`}
          >
            Search
          </Link>

          {session && (
            <>
              {inRange(session?.user.userRol, 10, 100) && (
                <Link
                  href="/cms-manager"
                  onClick={() => {
                    closeMenu();
                    handleNavClick();
                  }}
                  className={`${isActive("/cms-manager") ? "navonbutton" : "navoffbutton"} text-center`}
                >
                  Properties
                </Link>
              )}
              {inRange(session?.user.userRol, 100, 1000) && (
                <Link
                  href="/cms-admin"
                  onClick={closeMenu}
                  className={`${isActive("/cms-admin") ? "navonbutton" : "navoffbutton"} text-center`}
                >
                  Properties
                </Link>
              )}
            </>
          )}
          <Link
            href="/paperwork"
            onClick={closeMenu}
            className={`${isActive("/paperwork") ? "navonbutton" : "navoffbutton"} text-center`}
          >
            Paperwork
          </Link>
          {session && (
            <>
              <button
                onClick={() => {
                  handleLogout();
                  closeMenu();
                }}
                className="navoffbutton cursor-pointer text-center"
              >
                Go Out
              </button>
            </>
          )}

          {!session && (
            <Link
              href="/auth"
              onClick={closeMenu}
              className={`${isActive("/auth") ? "navonbutton" : "navoffbutton"} text-center`}
            >
              Go In
            </Link>
          )}
          <select
            className="field-select-lang"
            onChange={(e) => {
              const selectedValue = e.target.value;
              changeLang(selectedValue);
              closeMenu();
            }}
          >
            <option value="es">&#127466;&#127480;</option>
            <option value="en">&#127468;&#127463;</option>
            <option value="fr">&#127467;&#127479;</option>
          </select>
          <div className="flex items-center justify-center">
            <div onClick={() => {
              toggleDarkMode();
              closeMenu();
            }} className="cursor-pointer">
              {darkMode ? (
                <IoMdSunny className="hover:scale-150 transition-transform duration-300" />
              ) : (
                <IoIosMoon className="hover:scale-150 transition-transform duration-300" />
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}