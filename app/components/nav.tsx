"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeSwitch } from "./theme-switch";
import { metaData } from "../lib/config";
import { useEffect, useState, useRef } from "react";
import { Home, FolderOpen, Camera } from "lucide-react";

const navItems = {
  "/": { name: "Home", icon: Home },
  "/projects": { name: "Projects", icon: FolderOpen },
  "/photos": { name: "Photos", icon: Camera },
};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const handleScroll = () => {
      // Clear existing timeout to prevent rapid changes
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Debounce the scroll state change
      timeoutRef.current = setTimeout(() => {
        const scrollTop = window.scrollY;
        const newIsScrolled = scrollTop > 50; // Increased threshold for stability
        
        if (newIsScrolled !== isScrolled) {
          setIsScrolled(newIsScrolled);
        }
      }, 50); // 50ms debounce
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isScrolled]);

  return (
    <nav className={`transition-all duration-500 ease-out ${isScrolled ? 'py-1 sm:py-2' : 'py-2 sm:py-3'}`}>
      <div className="flex items-center justify-between">
        {/* Logo/Title */}
        <div className="flex items-center">
          <Link 
            href="/" 
            className={`flex items-center gap-2 font-semibold transition-all duration-500 ease-out select-none bg-transparent ${
              isScrolled ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
            }`}
          >
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={isScrolled ? 40 : 48} 
              height={isScrolled ? 40 : 48} 
              className="bg-transparent object-contain" 
            />
            <span className="bg-transparent">{metaData.title}</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex flex-row gap-6 items-center">
          {Object.entries(navItems).map(([path, { name, icon: Icon }]) => (
            <Link
              key={path}
              href={path}
              className="flex items-center gap-2 transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-400 text-slate-600 dark:text-gray-300 hover:scale-105 font-medium"
            >
              <Icon size={18} />
              {name}
            </Link>
          ))}
          <ThemeSwitch />
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden flex items-center gap-3">
          <ThemeSwitch />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors duration-200"
            aria-label="Toggle mobile menu"
          >
            <div className="w-5 h-5 flex flex-col justify-center items-center">
              <span className={`block h-0.5 w-5 bg-slate-600 dark:bg-gray-300 transition-all duration-300 ${
                isMobileMenuOpen ? 'rotate-45 translate-y-0.5' : ''
              }`}></span>
              <span className={`block h-0.5 w-5 bg-slate-600 dark:bg-gray-300 transition-all duration-300 mt-1 ${
                isMobileMenuOpen ? 'opacity-0' : ''
              }`}></span>
              <span className={`block h-0.5 w-5 bg-slate-600 dark:bg-gray-300 transition-all duration-300 mt-1 ${
                isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
              }`}></span>
            </div>
          </button>
        </div>
      </div>

              {/* Mobile Menu Dropdown */}
        <div className={`sm:hidden overflow-hidden transition-all duration-300 ease-out ${
          isMobileMenuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="pt-4 pb-2 space-y-3">
            {Object.entries(navItems).map(([path, { name, icon: Icon }]) => (
              <Link
                key={path}
                href={path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                <Icon size={18} />
                {name}
              </Link>
            ))}
          </div>
        </div>
    </nav>
  );
}
