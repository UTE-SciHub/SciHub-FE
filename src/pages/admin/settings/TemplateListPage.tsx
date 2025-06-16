import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Biểu mẫu interface
interface AcceptanceTemplate {
  code: string;
  name: string;
  fileUrl: string;
}

const mockAcceptanceTemplates: AcceptanceTemplate[] = [
  { code: "BM.01-QT.01-KHCN", name: "Đơn đề nghị nghiệm thu", fileUrl: "/templates/BM.01-QT.01-KHCN.docx" },
  { code: "BM.02-QT.01-KHCN", name: "Báo cáo tổng kết đề tài", fileUrl: "/templates/BM.02-QT.01-KHCN.docx" },
  { code: "BM.03-QT.01-KHCN", name: "Biên bản nghiệm thu", fileUrl: "/templates/BM.03-QT.01-KHCN.docx" },
  { code: "BM.04-QT.01-KHCN", name: "Phiếu đánh giá của hội đồng", fileUrl: "/templates/BM.04-QT.01-KHCN.docx" },
  { code: "BM.05-QT.01-KHCN", name: "Quyết định thành lập hội đồng", fileUrl: "/templates/BM.05-QT.01-KHCN.docx" },
  { code: "BM.06-QT.01-KHCN", name: "Danh sách thành viên hội đồng", fileUrl: "/templates/BM.06-QT.01-KHCN.docx" },
  { code: "BM.07-QT.01-KHCN", name: "Nhận xét của phản biện", fileUrl: "/templates/BM.07-QT.01-KHCN.docx" },
  { code: "BM.21-QT.01-KHCN", name: "Biên bản bàn giao sản phẩm", fileUrl: "/templates/BM.21-QT.01-KHCN.docx" },
];

const TemplateListPage: React.FC = () => {
  const [templates, setTemplates] = useState<AcceptanceTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setTemplates(mockAcceptanceTemplates);
      setLoading(false);
    }, 400);
  }, []);

  const handleDownload = (template: AcceptanceTemplate) => {
    toast({
      title: "Đang tải xuống",
      description: `Đang tải xuống biểu mẫu \"${template.name}\"`,
      variant: "success",
    });
    // Thực tế sẽ trigger download ở đây
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center">
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <Card className="mx-auto">
        <CardHeader className="">
          <CardTitle className="text-center text-2xl">
            Danh mục biểu mẫu
            <p className="text-center text-sm italic">
              (Lưu hành nội bộ)
            </p>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-10 pb-10 pt-2">
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-300 text-white">
                  <TableHead className="w-[60px] text-center border-r border-gray-300 py-4">STT</TableHead>
                  <TableHead className="w-[220px] text-center border-r border-gray-300 py-4">Ký hiệu biểu mẫu</TableHead>
                  <TableHead className="text-center py-4 pl-4">Tên biểu mẫu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template, idx) => (
                  <TableRow key={template.code} className="border-b border-gray-300">
                    <TableCell className="text-center align-middle py-5 border-r border-gray-300 text-lg">{idx + 1}</TableCell>
                    <TableCell className="text-center align-middle py-5 border-r border-gray-300 text-blue-700 text-base">{template.code}</TableCell>
                    <TableCell className="align-middle py-5 pl-4">
                      <span className="text-sm">{template.name}</span>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleDownload(template)}
                        className="text-blue-600 hover:text-blue-800 p-0 h-auto font-normal text-sm ml-2 align-baseline"
                        style={{ verticalAlign: "baseline" }}
                      >
                         Tải về <Download className="h-4 w-4 inline align-baseline" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateListPage;
