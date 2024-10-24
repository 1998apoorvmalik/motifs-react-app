import React, { useState } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const [inputValue, setInputValue] = useState<string>(String(currentPage));

  // Handle input change for the page input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Handle page jump when the user presses Enter or changes the input value
  const handlePageJump = () => {
    const pageNumber = Number(inputValue);

    // Ensure the input value is a valid number within range
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    } else {
      setInputValue(String(currentPage)); // Reset the input if the value is invalid
    }
  };

  // Handle Enter key press in the input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handlePageJump();
    }
  };

  // Handle next and previous page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <div className="pagination">
      <button onClick={handlePreviousPage} disabled={currentPage === 1}>
        Previous
      </button>
      <span>
        Page{" "}
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handlePageJump} // Trigger jump when input loses focus
          onKeyDown={handleKeyDown} // Trigger jump when Enter is pressed
          style={{ width: "50px", textAlign: "center" }}
          min="1"
          max={totalPages}
        />{" "}
        of {totalPages}
      </span>
      <button onClick={handleNextPage} disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
  );
};

export default Pagination;
