import React, { useState, useEffect } from "react";

interface LoadingProps {
  onCancel?: () => void;
}

const Loading: React.FC<LoadingProps> = ({ onCancel }) => {
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCancel(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin">
          <img src="/public/logo/UTE.png" alt="Loading" className="h-20 w-20" />
        </div>
        <button
          onClick={onCancel}
          className={`mt-4 px-4 py-2 text-sm block font-medium text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 ${
            showCancel ? "opacity-1" : "opacity-0"
          }`}
        >
          Hủy
        </button>
      </div>
    </div>
  );
};

export default Loading;
