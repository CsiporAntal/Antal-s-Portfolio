"use client";
import * as React from "react";
import { useTheme } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { FaCircleHalfStroke } from "react-icons/fa6";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export const ThemeSwitch: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  if (!mounted) {
    return (
      <FaCircleHalfStroke
        className="h-[18px] w-[18px] text-gray-300"
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      id="theme-toggle"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      onClick={toggleTheme}
      className="flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer p-2 rounded-lg hover:bg-white/10"
    >
      <FaCircleHalfStroke
        className={`h-[18px] w-[18px] transition-colors duration-300 ${
          theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"
        }`}
      />
    </button>
  );
};
