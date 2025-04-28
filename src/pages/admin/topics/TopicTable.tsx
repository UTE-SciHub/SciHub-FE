import DataTable from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Column } from "@/models/column";
import { Topic } from "@/models/topic";
import { Eye, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatVND } from "@/utils/common";

interface TopicsTableProps {
    topics: Topic[];
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    loading: boolean;
    selectedRowKeys: string[];
    selectedRows: any[];
    onPageChange: (pageNumber: number) => void;
    onPageSizeChange: (newPageSize: number) => void;
    onSortChange: (field: string, order: string) => void;
    onSelectionChange: (keys: string[], rows: any[]) => void;
}

const TopicsTable = ({
    topics,
    totalItems,
    itemsPerPage,
    currentPage,
    loading,
    selectedRowKeys,
    selectedRows,
    onPageChange,
    onPageSizeChange,
    onSortChange,
    onSelectionChange,
}: TopicsTableProps) => {
    const columns: Column[] = [
        {
            key: "topicCode",
            title: "Mã đề tài",
            width: "100px",
            sortable: true,
        },
        {
            key: "vietnameseName",
            title: "Tên đề tài",
            width: "300px",
            sortable: true,
        },
        {
            key: "principalInvestigator",
            title: "Chủ nhiệm",
            width: "200px",
            sortable: true,
        },
        {
            key: "department",
            title: "Đơn vị",
            width: "150px",
            render: (_, record) => record.department?.name,
        },
        {
            key: "status",
            title: "Trạng thái",
            width: "120px",
            render: (status) => (
                <span className={getStatusClass(status)}>{getStatusName(status)}</span>
            ),
        },
        {
            key: "startDate",
            title: "Ngày bắt đầu",
            width: "130px",
            sortable: true,
        },
        {
            key: "durationInMonths",
            title: "Thời gian (tháng)",
            width: "100px",
            align: "center",
        },
        {
            key: "totalBudget",
            title: "Kinh phí",
            width: "150px",
            align: "left",
            render: (value) => formatVND(value),
        },
        {
            key: "actions",
            title: "Thao tác",
            width: "80px",
            render: (_, record) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const getStatusClass = (status: string): string => {
        const classes = {
            "DRAFT": "bg-gray-100 text-gray-800 px-2 py-1 rounded",
            "SUBMITTED": "bg-blue-100 text-blue-800 px-2 py-1 rounded",
            "IN_PROGRESS": "bg-indigo-100 text-indigo-800 px-2 py-1 rounded",
            "COMPLETED": "bg-green-100 text-green-800 px-2 py-1 rounded",
            "REJECTED": "bg-red-100 text-red-800 px-2 py-1 rounded",
        };
        return classes[status as keyof typeof classes] || "bg-gray-100 text-gray-800 px-2 py-1 rounded";
    };

    const getStatusName = (status: string): string => {
        const statusNames = {
            "DRAFT": "Nháp",
            "SUBMITTED": "Đã nộp",
            "IN_PROGRESS": "Đang thực hiện",
            "COMPLETED": "Hoàn thành",
            "REJECTED": "Từ chối",
        };
        return statusNames[status as keyof typeof statusNames] || status;
    };

    return (
        <DataTable
            minHeight="380px"
            loading={loading}
            columns={columns}
            data={topics}
            itemsPerPage={itemsPerPage}
            pagination={true}
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            selectable={true}
            selectedRowKeys={selectedRowKeys}
            onSelectionChange={onSelectionChange}
            onSortChange={onSortChange}
            emptyMessage="Không tìm thấy đề tài nào"
        />
    );
};

export default TopicsTable;