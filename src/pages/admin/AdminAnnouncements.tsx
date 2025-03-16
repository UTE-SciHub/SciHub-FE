
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle } from 'lucide-react';

const AdminAnnouncements = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý thông báo</h1>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Tạo thông báo mới
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Tất cả thông báo</TabsTrigger>
          <TabsTrigger value="published">Đã xuất bản</TabsTrigger>
          <TabsTrigger value="draft">Bản nháp</TabsTrigger>
          <TabsTrigger value="scheduled">Đã lên lịch</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách thông báo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Đang xây dựng chức năng hiển thị danh sách tất cả thông báo...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="published">
          <Card>
            <CardHeader>
              <CardTitle>Thông báo đã xuất bản</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Đang xây dựng chức năng hiển thị danh sách thông báo đã xuất bản...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="draft">
          <Card>
            <CardHeader>
              <CardTitle>Thông báo bản nháp</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Đang xây dựng chức năng hiển thị danh sách thông báo bản nháp...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Thông báo đã lên lịch</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Đang xây dựng chức năng hiển thị danh sách thông báo đã lên lịch...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnnouncements;
