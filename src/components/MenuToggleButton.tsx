"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export type MenuToggleButtonProps = {
  segment: "primary" | "secondary";
  onClick: () => void;
};

const MenuToggleButton: React.FC<MenuToggleButtonProps> = ({ segment, onClick }) => {
  const [rotating, setRotating] = useState(false);

  const handleClick = () => {
    setRotating(true);
    onClick();
    setTimeout(() => setRotating(false), 400); // match animation duration
  };

  const displayText = segment === "primary" ? "Maintenance" : "Experience";

  return (
    <button
      onClick={handleClick}
       aria-label="Toggle segment"
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all shadow-sm
                 bg-gray-200/15 text-gray-700 dark:bg-gray-800/15 dark:text-gray-300
                 border border-gray-400/40 hover:bg-gray-300/20 dark:hover:bg-gray-700/30
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <span>{displayText}</span>
      <motion.svg
        className="w-5 h-5 text-gray-500 dark:text-gray-300"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ rotate: rotating ? 180 : 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Circular rotation icon */}
        <path d="M2 12a10 10 0 0110-10v4" />
        <path d="M22 12a10 10 0 01-10 10v-4" />
      </motion.svg>
    </button>
  );
};

export default MenuToggleButton;
