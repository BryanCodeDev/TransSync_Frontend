import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "light";
  });

  const [isSystemTheme, setIsSystemTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return !savedTheme; // Si no hay tema guardado, está usando el del sistema
  });

  // Detectar tema del sistema
  const getSystemTheme = useCallback(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, []);

  // Aplicar tema al DOM
  useEffect(() => {
    const applyTheme = (themeToApply) => {
      if (themeToApply === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    if (isSystemTheme) {
      const systemTheme = getSystemTheme();
      applyTheme(systemTheme);
    } else {
      applyTheme(theme);
    }
  }, [theme, isSystemTheme, getSystemTheme]);

  // Guardar tema en localStorage
  useEffect(() => {
    if (isSystemTheme) {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", theme);
    }
  }, [theme, isSystemTheme]);

  // Escuchar cambios en el tema del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (e) => {
      if (isSystemTheme) {
        const systemTheme = e.matches ? "dark" : "light";
        if (systemTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [isSystemTheme]);

  const setThemeMode = useCallback((newTheme) => {
    if (newTheme === "system") {
      setIsSystemTheme(true);
      const systemTheme = getSystemTheme();
      if (systemTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      setIsSystemTheme(false);
      setTheme(newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [getSystemTheme]);

  const toggleTheme = useCallback(() => {
    if (isSystemTheme) {
      const systemTheme = getSystemTheme();
      setThemeMode(systemTheme === "dark" ? "light" : "dark");
    } else {
      setThemeMode(theme === "dark" ? "light" : "dark");
    }
  }, [theme, isSystemTheme, setThemeMode, getSystemTheme]);

  return (
    <ThemeContext.Provider value={{
      theme: isSystemTheme ? getSystemTheme() : theme,
      setThemeMode,
      toggleTheme,
      isSystemTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
