import React from "react";

interface InputProps {
  name?: string;
  id: string;
  type: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  className?: string;
}

const Input = ({
  name,
  id,
  type,
  placeholder,
  value,
  onChange,
  label,
  className = "",
}: InputProps) => {
  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={name}
          className="block text-gray-200 text-sm font-bold mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${className}`}
      />
    </div>
  );
};

export default Input;
