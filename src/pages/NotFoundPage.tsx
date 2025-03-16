
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="space-y-5 max-w-md mx-auto animate-fade-in">
        <h1 className="text-7xl font-bold text-primary-600">404</h1>
        <h2 className="text-2xl font-semibold">Trang không tồn tại</h2>
        <p className="text-muted-foreground">
          Trang bạn đang tìm kiếm có thể đã bị xóa, di chuyển hoặc không tồn tại.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <Button 
            className="gap-2"
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4" />
            Trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
