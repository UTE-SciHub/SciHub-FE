import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Template {
  id: string;
  code: string;
  name: string;
  description?: string;
  fileUrl?: string;
}

interface TemplateDisplayTableProps {
  templates: Template[];
  onDownload: (template: Template) => void;
}

const TemplateDisplayTable: React.FC<TemplateDisplayTableProps> = ({ 
  templates,
  onDownload
}) => {
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[80px] font-bold">STT</TableHead>
            <TableHead className="w-[150px] font-bold">Ký hiệu biểu mẫu</TableHead>
            <TableHead className="font-bold">Tên biểu mẫu</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template, index) => (
            <TableRow key={template.id}>
              <TableCell className="text-center">{index + 1}</TableCell>
              <TableCell className="font-medium">{template.code}</TableCell>
              <TableCell>
                <div className="flex items-center justify-between">
                  <span>{template.name}</span>
                  {template.description && (
                    <div className="text-sm text-muted-foreground hidden md:block max-w-md truncate">
                      {template.description}
                    </div>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onDownload(template)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <span className="underline mr-1">Tải về</span>
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TemplateDisplayTable;
