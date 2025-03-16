import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminContracts = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý hợp đồng</h1>
        <Button>Tạo hợp đồng mới</Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Tất cả hợp đồng</TabsTrigger>
          <TabsTrigger value="pending">Chờ ký</TabsTrigger>
          <TabsTrigger value="active">Đang thực hiện</TabsTrigger>
          <TabsTrigger value="completed">Đã thanh lý</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách hợp đồng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Đang xây dựng chức năng hiển thị danh sách tất cả hợp đồng...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Hợp đồng chờ ký</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Đang xây dựng chức năng hiển thị danh sách hợp đồng chờ ký...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Hợp đồng đang thực hiện</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Đang xây dựng chức năng hiển thị danh sách hợp đồng đang thực
                hiện...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Hợp đồng đã thanh lý</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Đang xây dựng chức năng hiển thị danh sách hợp đồng đã thanh
                lý...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContracts;
