import React, { ReactElement, Ref } from "react";

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
  ref
}) => {
  const defaultClass = `w-full px-4 py-2 border  focus:outline-none focus:ring-2 ${
    error
      ? "border-red-500 focus:ring-red-300"
      : "border-gray-300 focus:ring-blue-300"
  }`;

  const processedClasses = className
    ? defaultClass + " " + className
    : defaultClass;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={label}
          className="block text-sm font-medium text-gray-700 mb-1"
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
