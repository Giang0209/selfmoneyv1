"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Định nghĩa kiểu dữ liệu cho giao diện: Sáng (light) hoặc Tối (dark)
type Theme = "light" | "dark";

// Khai báo kiểu dữ liệu cho Context quản lý giao diện
type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void; // Hàm hỗ trợ chuyển đổi nhanh giữa hai chế độ
};

// Khởi tạo Context với giá trị ban đầu là undefined
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Component Provider để bao bọc và cung cấp trạng thái giao diện cho toàn bộ ứng dụng
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark"); // Chế độ mặc định là giao diện tối (dark)

  // Đồng bộ giao diện đã lưu từ localStorage khi component được tải lần đầu (Client-side)
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme("dark");
    }
  }, []);

  // Hàm áp dụng class CSS tương ứng lên thẻ body của tài liệu
  const applyTheme = (t: Theme) => {
    if (t === "light") {
      document.body.classList.add("light"); // Thêm class "light" để kích hoạt style giao diện sáng
    } else {
      document.body.classList.remove("light"); // Xóa class "light" để quay về mặc định giao diện tối
    }
  };

  // Hàm thiết lập giao diện mới và lưu lại cấu hình vào localStorage
  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
    applyTheme(t);
  };

  // Hàm chuyển đổi qua lại nhanh chóng giữa chế độ sáng và tối
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook tiện ích giúp các component con dễ dàng truy cập và thao tác với Context giao diện
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

