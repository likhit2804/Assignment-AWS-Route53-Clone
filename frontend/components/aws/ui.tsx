"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "blue" | "gray" | "orange" | "red";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "gray", className = "" }) => {
  const variants = {
    green: "bg-green-100 text-green-800 border-green-200",
    blue: "bg-blue-50 text-aws-blue border-blue-200",
    gray: "bg-gray-100 text-gray-600 border-gray-200",
    orange: "bg-orange-50 text-aws-orange border-orange-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "secondary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  ...props
}) => {
  const base = "inline-flex items-center justify-center gap-1.5 font-semibold border rounded transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-1.5 text-xs",
  };

  const variants = {
    primary: "bg-aws-orange hover:bg-aws-orangeHover text-white border-transparent focus:ring-aws-orange shadow-sm",
    secondary: "bg-white hover:bg-gray-50 text-gray-800 border-gray-300 focus:ring-aws-blue shadow-sm",
    danger: "bg-white hover:bg-red-50 text-red-700 border-red-300 focus:ring-red-400 shadow-sm",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600 border-transparent focus:ring-gray-300",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
};
