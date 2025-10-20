import React, { useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/useTheme";
import ProgressBar from "./ProgressBar";
import DeviceConnectButton from "./DeviceConnectButton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Wrench,
  Hammer,
  Zap,
  Cog,
  Settings,
  Book,
  Bike,
  Info,
} from "lucide-react";
import MenuToggleButton from "./MenuToggleButton";

type NavItem = { path: string; label: string; icon: React.ElementType };

const PRIMARY: NavItem[] = [
  { path: "/", label: "Home", icon: Home },
  { path: "/guides", label: "Guides", icon: Book },
  { path: "/rides", label: "Rides", icon: Bike },
  { path: "/settings", label: "Settings", icon: Settings },
  { path: "/about", label: "About", icon: Info },
];

const SECONDARY: NavItem[] = [
  { path: "/diagnostics", label: "Diagnostics", icon: Wrench },
  { path: "/tuneup", label: "Tuneup", icon: Hammer },
  { path: "/boost", label: "Power Boost", icon: Zap },
  { path: "/parts", label: "Parts", icon: Cog },
  { path: "/maintenance", label: "Maintenance", icon: Wrench },
];

const segmentSets = { primary: PRIMARY, secondary: SECONDARY };
const mobileNavItems = [...PRIMARY, ...SECONDARY];

const Header: React.FC = () => {
  const { isDark, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [segment, setSegment] = useState<"primary" | "secondary">("primary");
  const prevSegmentRef = useRef<"primary" | "secondary">("primary");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const toggleSegment = () => {
    const newSegment = segment === "primary" ? "secondary" : "primary";
    prevSegmentRef.current = segment;
    setSegment(newSegment);
    const firstItem = segmentSets[newSegment][0];
    navigate(firstItem.path);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const visibleItems = segmentSets[segment];

  return (
    <header className="sticky top-0 z-50 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
      <ProgressBar />
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center space-x-3"
            aria-label="E-Bike Assistant Home">
            <img
              src="./public/ebike-icon.svg"
              alt="E-Bike Assistant"
              className="w-8 h-8 relative transform group-hover:scale-110 transition-transform duration-300"
            />
            <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent">
              E-Bike Assistant
            </span>
          </Link>

          {/* Desktop nav */}
          <div
            className="hidden md:flex items-center gap-2"
            role="navigation"
            aria-label="Desktop navigation">
            <div className="relative flex items-center px-3 py-2 rounded-2xl w-[460px] max-w-[calc(100vw-260px)]">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={segment}
                  initial={
                    prevSegmentRef.current === "primary"
                      ? { x: 40, opacity: 0 }
                      : { x: -40, opacity: 0 }
                  }
                  animate={{ x: 0, opacity: 1 }}
                  exit={
                    segment === "primary"
                      ? { x: -40, opacity: 0 }
                      : { x: 40, opacity: 0 }
                  }
                  transition={{ duration: 0.32, ease: "easeOut" }}
                  className="flex items-center justify-center w-full">
                  <div className="flex items-center justify-between gap-3 px-2">
                    {visibleItems.map(({ path, label, icon: Icon }) => {
                      const active = isActive(path);
                      return (
                        <Link
                          key={path}
                          to={path}
                          data-testid={`nav-${label
                            .toLowerCase()
                            .replace(" ", "-")}`}
                          className={`relative flex flex-col items-center justify-center w-20 h-20 rounded-lg text-sm transition-all duration-300 ${
                            active
                              ? "bg-gray-100 dark:bg-gray-800/40 text-gray-900 dark:text-gray-100 shadow-sm"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/30 hover:text-blue-600 dark:hover:text-green-400"
                          }`}
                          aria-label={label}
                          aria-current={active ? "page" : undefined}>
                          <Icon className="w-6 h-6 mb-1" />
                          <span className="text-xs font-medium">{label}</span>
                          {active && (
                            <span className="absolute -bottom-1 w-6 h-1 rounded-full bg-blue-500 dark:bg-green-400"></span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <MenuToggleButton
              segment={segment}
              onClick={toggleSegment}
              aria-label="Toggle segment"
            />
            <DeviceConnectButton aria-label="Connect device" />
          </div>

          {/* Theme + mobile buttons */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleDarkMode}
              className="relative p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-green-500/10 hover:from-blue-500/20 hover:to-green-500/20 
                     dark:from-blue-400/5 dark:to-green-400/5 dark:hover:from-blue-400/10 dark:hover:to-green-400/10
                     transition-all duration-300 group overflow-hidden"
              title="Toggle dark mode">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-green-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative transform transition-transform duration-500 rotate-0 dark:-rotate-180">
                {isDark ? (
                  <svg
                    aria-label="dark mode"
                    className="w-6 h-6 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg
                    aria-label="light mode"
                    className="w-6 h-6 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-green-500/10"
              aria-label="Toggle menu">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav
          className={`md:hidden mt-3 py-2 overflow-x-auto whitespace-nowrap scrollbar-thin ${
            isMobileMenuOpen ? "" : "hidden"
          }`}
          aria-label="Mobile navigation">
          <div className="flex space-x-2 px-2">
            {mobileNavItems.map(({ path, label, icon: Icon }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  to={path}
                  data-testid={`nav-${label.toLowerCase().replace(" ", "-")}`}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 flex flex-col items-center space-y-1
                    ${
                      active
                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 transform scale-105 shadow-lg"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-800 dark:hover:text-white"
                    }`}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}>
                  <Icon className="w-5 h-5" />
                  <span
                    className={`font-medium ${active ? "font-semibold" : ""}`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
