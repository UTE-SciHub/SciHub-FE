
import React from 'react';
import { FileSignature } from 'lucide-react';

const Contracts = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Hợp đồng & Tài chính</h1>
          <p className="text-muted-foreground">Quản lý hợp đồng và tài chính cho các đề tài nghiên cứu</p>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileSignature className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-1">Tính năng đang phát triển</h3>
        <p className="text-muted-foreground">Tính năng này sẽ được cập nhật trong phiên bản tiếp theo</p>
      </div>
    </div>
  );
};

export default Contracts;
