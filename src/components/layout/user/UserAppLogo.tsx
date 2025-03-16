import React from "react";
import { useNavigate } from "react-router-dom";

const UserAppLogo = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center gap-2 cursor-pointer"
      onClick={() => navigate("/")}
    >
      <div className="w-10 h-10 relative">
        <img
          src="/logo/UTE.png"
          alt="UTE Logo"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col items-start">
        <span className="font-bold text-xl tracking-tight text-primary-900">
          SciHub
        </span>
        <span className="text-xs text-muted-foreground">
          Quản lý nghiên cứu khoa học
        </span>
      </div>
    </div>
  );
};

export default UserAppLogo;
