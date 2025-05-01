import MultiFileUpload from "@/components/multiple-upload-file/multiple-upload-file";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Download } from "lucide-react";

export default function AttachedDocuments({ form }) {
    return (
        <div className="space-y-6">
            <div className="text-2xl font-semibold text-center">Kết quả nghiên cứu dự kiến</div>

            {/* Tài liệu đính kèm */}
            <FormField
                control={form.control}
                name="attachedDocuments"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tài liệu đính kèm</FormLabel>
                        {/* Danh sách biểu mẫu */}
                        <div className="mt-2 space-y-2">
                            <p className="font-semibold">Các biểu mẫu cần được cung cấp:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>
                                    BM.01-QT.01-KHCN Đề xuất đề tài:{" "}
                                    <a href="/form/BM.01-QT.01-KHCN Đề xuất đề tài.doc" className="text-blue-600 underline inline-flex items-center gap-1">
                                        <Download className="h-4 w-4" />
                                        Tải về
                                    </a>
                                </li>

                                <li>
                                    BM.02-QT.01-KHCN Giấy xác nhận tiếp nhận và sử dụng sản phẩm đề tài: {" "}
                                    <a href="/form/BM.02-QT.01-KHCN Giấy xác nhận tiếp nhận và sử dụng sản phẩm đề tài.doc" className="text-blue-600 underline inline-flex items-center gap-1">
                                        <Download className="h-4 w-4" />
                                        Tải về
                                    </a>
                                </li>
                                <li>
                                    BM.03-QT.01-KHCN Danh mục đề tài: {" "}
                                    <a href="/form/BM.03-QT.01-KHCN Danh mục đề tài.doc" className="text-blue-600 underline inline-flex items-center gap-1">
                                        <Download className="h-4 w-4" />
                                        Tải về
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <FormControl>
                            <MultiFileUpload
                                form={form}
                                field={field}
                                accept=".pdf,.docx,.doc"
                                maxSize={10}
                                label="Tài liệu đính kèm"
                                placeholder="Chọn file"
                                description="Kéo thả file vào đây để tải lên. (Chỉ chấp nhận file PDF)"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}