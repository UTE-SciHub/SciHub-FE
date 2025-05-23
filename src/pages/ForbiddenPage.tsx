import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

const ForbiddenPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <div className="space-y-5 max-w-md mx-auto animate-fade-in">
                <h1 className="text-7xl font-bold text-rose-600">403</h1>
                <h2 className="text-2xl font-semibold">Không có quyền truy cập</h2>
                <p className="text-muted-foreground">
                    Bạn không có quyền truy cập vào trang này. Vui lòng kiểm tra lại quyền của bạn hoặc liên hệ với quản trị viên.
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
                        variant='destructive'
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

export default ForbiddenPage;