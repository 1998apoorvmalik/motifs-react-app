import React, { useState } from "react";

interface ItemsPerPageProps {
  itemsPerPage: number;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

const ItemsPerPage: React.FC<ItemsPerPageProps> = ({
  itemsPerPage,
  onItemsPerPageChange,
}) => {
  const [inputValue, setInputValue] = useState<string>(String(itemsPerPage));

  // Handle input change for items per page
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Handle the change when user presses Enter or blurs the input
  const handleItemsChange = () => {
    const newItemsPerPage = Number(inputValue);

    // Ensure the input is a valid number and greater than zero
    if (!isNaN(newItemsPerPage) && newItemsPerPage > 0) {
      onItemsPerPageChange(newItemsPerPage);
    } else {
      setInputValue(String(itemsPerPage)); // Reset to the current itemsPerPage value if invalid
    }
  };

  // Handle Enter key press in the input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleItemsChange();
    }
  };

  return (
    <div className="items-per-page">
      <label htmlFor="itemsPerPage">Results per page:</label>
      <input
        type="number"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleItemsChange} // Trigger change when input loses focus
        onKeyDown={handleKeyDown} // Trigger change when Enter is pressed
        style={{width: '40px', textAlign: "center"}}
        min="1"
      />
    </div>
  );
};

export default ItemsPerPage;
