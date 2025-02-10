import React from "react";

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: string;
  className?: string;
  ref?: React.RefObject<HTMLInputElement>;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder = "",
  value,
  onChange,
  type = "text",
  error,
  className,
  ref,
}) => {
  const defaultClass = `w-full px-4 py-2 border rounded-lg bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 ${
    error
      ? "border-red-500 focus:ring-red-500"
      : "border-gray-700 focus:ring-blue-500"
  } transition-all duration-200 ease-in-out`;

  const processedClasses = className
    ? defaultClass + " " + className
    : defaultClass;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={label}
          className="block text-sm font-medium text-gray-400 mb-1"
        >
          {label}
        </label>
      )}

      <input
        id={label}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={processedClasses}
        ref={ref}
      />

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
