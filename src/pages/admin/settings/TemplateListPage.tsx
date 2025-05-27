import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Template interface
interface Template {
  id: string;
  code: string;
  title: string;
  items: TemplateItem[];
}

interface TemplateItem {
  name: string;
  fileUrl?: string;
}

const TemplateListPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock templates data based on the image
  const mockTemplates: Template[] = [
    {
      id: "1",
      code: "R01",
      title: "Đề xuất",
      items: [
        { name: "Đề xuất đề tài KHCN", fileUrl: "/templates/R01_KHCN.docx" },
        { name: "Đề xuất đề án khoa học", fileUrl: "/templates/R01_DeAn.docx" },
        { name: "Đề xuất dự án sản xuất thử nghiệm", fileUrl: "/templates/R01_DuAn.docx" }
      ]
    },
    {
      id: "2", 
      code: "R02",
      title: "Thuyết minh",
      items: [
        { name: "Thuyết minh đề tài KHCN", fileUrl: "/templates/R02_KHCN.docx" },
        { name: "Thuyết minh đề án khoa học", fileUrl: "/templates/R02_DeAn.docx" },
        { name: "Thuyết minh dự án sản xuất thử nghiệm", fileUrl: "/templates/R02_DuAn.docx" }
      ]
    },
    {
      id: "3",
      code: "R02",
      title: "Kèm theo thuyết minh",
      items: [
        { name: "Dự toán đề tài/đề án", fileUrl: "/templates/R02_DuToan.docx" },
        { name: "Lý lịch khoa học", fileUrl: "/templates/R02_LyLich.docx" },
        { name: "Xác nhận phối hợp thực hiện", fileUrl: "/templates/R02_XacNhan.docx" },
        { name: "Giải trình hoàn thiện hồ sơ", fileUrl: "/templates/R02_GiaiTrinh.docx" },
        { name: "Biên bản kiểm tra hồ sơ đăng ký/giao nhiệm vụ", fileUrl: "/templates/R02_BienBan.docx" }
      ]
    },
    {
      id: "4",
      code: "R03", 
      title: "Hợp đồng",
      items: [
        { name: "Hợp đồng đề tài cấp ĐHQG-HCM loại A, B", fileUrl: "/templates/R03_A_B.docx" },
        { name: "Hợp đồng đề tài cấp ĐHQG-HCM loại C", fileUrl: "/templates/R03_C.docx" },
        { name: "Hợp đồng đề án khoa học", fileUrl: "/templates/R03_DeAn.docx" },
        { name: "Hợp đồng dự án sản xuất thử nghiệm", fileUrl: "/templates/R03_DuAn.docx" }
      ]
    }
  ];

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        // In a real application, this would be an API call
        // For now, we'll use the mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        setTemplates(mockTemplates);
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách biểu mẫu. Vui lòng thử lại sau.",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleDownload = (item: TemplateItem, templateCode: string) => {
    // In a real application, this would trigger a file download
    toast({
      title: "Đang tải xuống",
      description: `Đang tải xuống biểu mẫu "${item.name}"`,
      variant: "success",
    });
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
      <Card className="max-w-6xl mx-auto">
        <CardHeader className="pb-6">
          <CardTitle className="text-center text-2xl font-bold text-gray-800">
            DANH MỤC CÁC BIỂU MẪU
          </CardTitle>
          <CardDescription className="text-center text-sm text-gray-600 italic">
            (Lưu hành nội bộ)
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-300 text-white">
                  <TableHead className="w-[80px] text-center font-bold border-r border-gray-300 py-3">
                    STT
                  </TableHead>
                  <TableHead className="w-[150px] text-center font-bold border-r border-gray-300 py-3">
                    Ký hiệu biểu mẫu
                  </TableHead>
                  <TableHead className="font-bold py-3">
                    Tên biểu mẫu
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template, index) => (
                  <TableRow key={template.id} className="border-b border-gray-300">
                    <TableCell className="text-center align-top py-4 border-r border-gray-300 font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-center align-top py-4 border-r border-gray-300 font-medium">
                      {template.code}
                    </TableCell>
                    <TableCell className="py-4 align-top">
                      <div className="space-y-3">
                        <div className="font-medium text-gray-800">
                          {template.title}
                        </div>
                        <ul className="space-y-2 ml-4">
                          {template.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-center group">
                              <div className="flex items-start">
                                <span className="text-gray-600 mr-2">•</span>
                                <span className="text-sm text-gray-700 leading-relaxed">
                                  {item.name}:
                                </span>
                              </div>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => handleDownload(item, template.code)}
                                className="text-blue-600 hover:text-blue-800 p-0 h-auto font-normal text-sm ml-2 opacity-80 group-hover:opacity-100 transition-opacity"
                              >
                                <Download className="h-3 w-3" />
                                Tải về
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
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
