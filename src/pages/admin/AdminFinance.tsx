
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminFinance = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý tài chính</h1>
        <Button>Tạo phiếu chi mới</Button>
      </div>

      <Tabs defaultValue="budgets" className="w-full">
        <TabsList>
          <TabsTrigger value="budgets">Ngân sách đề tài</TabsTrigger>
          <TabsTrigger value="payments">Phiếu chi</TabsTrigger>
          <TabsTrigger value="reports">Báo cáo tài chính</TabsTrigger>
        </TabsList>
        <TabsContent value="budgets">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý ngân sách đề tài</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Đang xây dựng chức năng quản lý ngân sách đề tài...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý phiếu chi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Đang xây dựng chức năng quản lý phiếu chi...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo tài chính</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Đang xây dựng chức năng báo cáo tài chính...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFinance;
