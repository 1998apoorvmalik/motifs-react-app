import React, { useState, useEffect } from "react";

interface NewStructureInputProps {
  placeholder?: string;
  onInputSubmit?: (inputValue: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

const predefinedStructures = {
  "Sample 1": "(.(.(...)...))",
  "Sample 2": "(.(...(...)..)..)",
  // "Sample 3": ".((......((......))......((......((......))......((......))......))......)).....",
};

const NewStructureInput: React.FC<NewStructureInputProps> = ({
  placeholder = "Type here...",
  onInputSubmit,
  isVisible,
  onClose,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Determine the selected structure based on inputValue
  const selectedStructureKey =
    Object.keys(predefinedStructures).find(
      (key) =>
        predefinedStructures[key as keyof typeof predefinedStructures] ===
        inputValue
    ) || "";

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value
      .replace(/[^().{}[\]<>]/g, "")
      .replace(/[{}[\]<>]/g, ".");
    setInputValue(value);
    setIsValid(true);
    setErrorMessage("");
  };

  const handleInputSubmit = () => {
    if (isValidRNAStructure(inputValue)) {
      setIsValid(true);
      setErrorMessage("");
      if (onInputSubmit) onInputSubmit(inputValue);
      setInputValue("");
      onClose();
    } else {
      setIsValid(false);
      setErrorMessage(
        "Invalid RNA structure: Ensure each '(' has a matching ')'"
      );
    }
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (event.target && (event.target as HTMLElement).id === "overlay") {
      onClose();
    }
  };

  const handleStructureSelect = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const structure = event.target.value as keyof typeof predefinedStructures;
    if (predefinedStructures[structure]) {
      setInputValue(predefinedStructures[structure]);
      setIsValid(true);
      setErrorMessage("");
    }
  };

  const isValidRNAStructure = (structure: string): boolean => {
    let balance = 0;
    for (const char of structure) {
      if (char === "(") balance++;
      else if (char === ")") balance--;
      if (balance < 0) return false;
    }
    return balance === 0;
  };

  useEffect(() => {
    if (isVisible) {
      document.addEventListener("click", handleOutsideClick);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("click", handleOutsideClick);
      setInputValue("");
      setIsValid(true);
      setErrorMessage("");
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div id="overlay" className="overlay">
      <div className="dialog-box">
        <button onClick={onClose} className="close-button">
          <i className="fas fa-times"></i>
        </button>
        <h2 style={{marginBottom: '6px'}}>Find Motifs in a New Structure</h2>
        <p className="p-nomargin info" style={{marginBottom: '6px'}}>
          (Pseudoknots are not allowed. Brackets other than '(' or ')' will be
          replaced with a dot)
        </p>
        <select
          onChange={handleStructureSelect}
          className="structure-select"
          value={selectedStructureKey} // Set the selected option based on inputValue
        >
          <option value="" disabled hidden>
            Select a sample structure
          </option>
          {Object.keys(predefinedStructures).map((structure) => (
            <option key={structure} value={structure}>
              {structure}
            </option>
          ))}
        </select>
        <textarea
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          className={`dialog-input ${isValid ? "" : "invalid-input"}`}
        />
        {!isValid && <p className="error-message">{errorMessage}</p>}
        <button onClick={handleInputSubmit} className="submit-button">
          Submit
        </button>
      </div>
    </div>
  );
};

export default NewStructureInput;
