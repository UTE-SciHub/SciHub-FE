import { useState, useEffect } from "react";
import { Loader2, Check, X, Plus, FolderPlus, ListFilter, AlertCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Category } from "@/models/category";
import { Topic } from "@/models/topic";
import { toast } from "@/hooks/use-toast";
import { TopicService } from "@/service/topic-service";
import { CategoryService } from "@/service/category-service";
import CreateCategoryModal from "@/pages/admin/category/CreateCategoryModal";
import { Badge } from "@/components/ui/badge";

interface AssignCategoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
    selectedTopicIds: string[];
    selectedTopics: Topic[];
    onCategoryAssigned: () => void;
}

const AssignCategoryModal: React.FC<AssignCategoryModalProps> = ({
    open,
    onOpenChange,
    categories: initialCategories,
    selectedTopicIds,
    selectedTopics,
    onCategoryAssigned,
}) => {
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
    const [updatedCategories, setUpdatedCategories] = useState<Category[]>(initialCategories);

    // Reload categories list when needed (after creating a new one)
    const fetchCategories = async () => {
        try {
            const response = await CategoryService.getAll({
                p: 1,
                s: 1000,
                sort: "name",
                order: "asc",
                delFlag: false,
            });
            setUpdatedCategories(response.data.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách danh mục. Vui lòng thử lại.",
                variant: "error",
            });
        }
    };

    useEffect(() => {
        setUpdatedCategories(initialCategories);
    }, [initialCategories]);

    const handleCategoryAdded = () => {
        setIsCreateCategoryModalOpen(false);
        fetchCategories(); // Refresh categories list
        onCategoryAssigned();
    };

    const handleAssignCategory = async () => {
        if (!selectedCategory) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn một danh mục để gán.",
                variant: "error",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await TopicService.assignCategory({
                topicIds: selectedTopicIds,
                categoryId: Number(selectedCategory),
            });

            if (response.status !== 200 || response.data.code !== 1000) {
                toast({
                    title: "Lỗi",
                    description: response.data.message || "Đã xảy ra lỗi khi gán danh mục.",
                    variant: "error",
                });
                return;
            }

            toast({
                title: "Thành công",
                description: "Đã gán danh mục cho các đề tài được chọn.",
            });

            onCategoryAssigned();
            onOpenChange(false);
            setSelectedCategory("");
        } catch (error) {
            console.error("Error assigning category:", error);
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi khi gán danh mục. Vui lòng thử lại.",
                variant: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader className="space-y-3 pb-2">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <ListFilter className="h-5 w-5 text-primary" />
                            </div>
                            <DialogTitle className="text-xl">Xác định danh mục đề tài</DialogTitle>
                        </div>
                        <DialogDescription>
                            Chọn danh mục để gán cho{" "}
                            <Badge variant="outline" className="font-medium bg-primary/5">
                                {selectedTopicIds.length} đề tài
                            </Badge>{" "}
                            đã được chọn.

                            <div className="flex items-center p-4 gap-2 mt-4 rounded-md bg-yellow-50 text-yellow-700">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <p className="">
                                    Chỉ những đề tài đã được duyệt mới có thể gán danh mục. Nếu bạn không thấy đề tài nào trong danh sách, hãy kiểm tra lại trạng thái của chúng.
                                </p>
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2 space-y-5">
                        {/* Selected Topics List */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Các đề tài được chọn</label>
                            <div className="max-h-40 overflow-y-auto border rounded-md p-3 bg-gray-50 dark:bg-gray-800/30">
                                {selectedTopics.length > 0 ? (
                                    <ul className="space-y-2">
                                        {selectedTopics.map((topic) => (
                                            <li key={topic.id} className="text-sm text-gray-700 dark:text-gray-300">
                                                {topic.vietnameseName} - {topic.topicCode}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Không có đề tài nào được chọn.</p>
                                )}
                            </div>
                        </div>

                        {/* Selection Area */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Chọn danh mục</label>
                            <div className="grid grid-cols-1 gap-4">
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="w-full h-11 border-gray-300">
                                        <SelectValue placeholder="Chọn danh mục" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {updatedCategories.length > 0 ? (
                                            updatedCategories.map((cat) => (
                                                <SelectItem key={cat.id} value={String(cat.id)}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="" disabled>
                                                Không có danh mục nào
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Add New Category Section */}
                        <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-md">
                            <div className="flex items-center justify-between gap-2">
                                <div className="space-y-1">
                                    <h4 className="font-medium text-sm">Không tìm thấy danh mục phù hợp?</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Bạn có thể tạo một danh mục mới để phân loại đề tài
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCreateCategoryModalOpen(true)}
                                    className="gap-1.5"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Tạo danh mục mới
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="border-gray-300 text-rose-500"
                        >
                            <X className="h-4 w-4" /> Hủy bỏ
                        </Button>
                        <Button
                            type="button"
                            className="bg-primary text-white hover:bg-primary/90"
                            onClick={handleAssignCategory}
                            disabled={isSubmitting || !selectedCategory}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4" /> Xác nhận
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <CreateCategoryModal
                open={isCreateCategoryModalOpen}
                onOpenChange={setIsCreateCategoryModalOpen}
                onCategoryAdded={handleCategoryAdded}
            />
        </>
    );
};

export default AssignCategoryModal;