import React, { useState } from "react";
import Loading from "@/components/loading/loading";

const ExamplePage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleStartLoading = () => {
    setIsLoading(true);

    // Giả lập tải dữ liệu
    setTimeout(() => {
      setIsLoading(false);
    }, 15000); // 15 giây
  };

  const handleCancelLoading = () => {
    setIsLoading(false);
    console.log("Loading đã bị hủy!");
  };

  return (
    <div className="container">
      <h1 className="text-2xl font-bold">Trang Ví Dụ</h1>
      <button
        onClick={handleStartLoading}
        className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        Bắt đầu tải
      </button>

      {isLoading && <Loading onCancel={handleCancelLoading} />}
    </div>
  );
};

export default ExamplePage;
