import React from "react";

interface ProgressBarProps {
  isLoading: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ isLoading }) => {
  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50">
      {isLoading && (
        <div className="h-full bg-green-500 animate-[progress_2s_ease-in-out_infinite]"></div>
      )}
    </div>
  );
};

export default ProgressBar;
