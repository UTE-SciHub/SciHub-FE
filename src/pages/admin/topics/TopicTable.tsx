import DataTable from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Column } from "@/models/column";
import { Topic } from "@/models/topic";
import { Check, Eye, MoreHorizontal, Save } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatVND } from "@/utils/common";
import { getBadge, getStatusClass, TopicStatus } from "@/models/enums/topic-status.enum";

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
    onViewDetail: (topicId: string, status: TopicStatus) => void;
    onAssign: (topicId: string) => void;
    onReview: (topicId: string) => void;
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
    onViewDetail,
    onAssign,
    onReview,
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
            width: "150px",
            sortable: true,
        },
        {
            key: "department",
            title: "Đơn vị",
            width: "200px",
            render: (_, record) => record.department?.name || "Chưa phân công",
        },
        {
            key: "status",
            title: "Trạng thái",
            width: "120px",
            render: (status) => (
                <span className={getStatusClass(status)}>{getBadge(status)}</span>
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
                        <DropdownMenuItem onClick={() => onViewDetail(record.id, record.status)} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                        </DropdownMenuItem>
                        {record.status === TopicStatus.SUBMITTED && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onReview(record.id)} className="cursor-pointer">
                                    <Check className="mr-2 h-4 w-4" />
                                    Đánh giá đề tài
                                </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onAssign(record.id)} className="cursor-pointer">
                            <Save className="mr-2 h-4 w-4" />
                            Phân công đề tài
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

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