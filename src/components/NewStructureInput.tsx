import React, { useState, useEffect } from 'react';

interface NewStructureInputProps {
  placeholder?: string;
  onInputSubmit?: (inputValue: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

const NewStructureInput: React.FC<NewStructureInputProps> = ({
  placeholder = "Type here...",
  onInputSubmit,
  isVisible,
  onClose,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    // Allow only '(', ')', and '.'
    const filteredValue = value.replace(/[^().]/g, '');
    setInputValue(filteredValue);
  };

  const handleInputSubmit = () => {
    if (onInputSubmit) {
      onInputSubmit(inputValue);
    }
    setInputValue(""); // Clear input after submit
    onClose(); // Close dialog after submit
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (event.target && (event.target as HTMLElement).id === 'overlay') {
      onClose();
    }
  };

  useEffect(() => {
    if (isVisible) {
      document.addEventListener('click', handleOutsideClick);
      document.body.style.overflow = 'hidden'; // Disable background scrolling
    } else {
      document.body.style.overflow = ''; // Enable background scrolling
      document.removeEventListener('click', handleOutsideClick);
      setInputValue(""); // Clear input when dialog closes
    }

    return () => {
      document.body.style.overflow = ''; // Ensure scrolling is re-enabled on cleanup
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div id="overlay" className="overlay">
      <div className="dialog-box">
        <button onClick={onClose} className="close-button">
          <i className="fas fa-times"></i>
        </button>
        <h2>Find Motifs in a New Structure</h2>
        <textarea
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          className="dialog-input"
        />
        <button onClick={handleInputSubmit} className="submit-button">
          Submit
        </button>
      </div>
    </div>
  );
};

export default NewStructureInput;
