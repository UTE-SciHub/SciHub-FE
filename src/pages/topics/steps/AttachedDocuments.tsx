import MultiFileUpload from "@/components/multiple-upload-file/multiple-upload-file";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Download, FileText, Trash2 } from "lucide-react";

interface AttachedDocumentsProps {
    form: any;
    readOnly?: boolean;
}

export default function AttachedDocuments({
    form,
    readOnly = false
}: AttachedDocumentsProps) {
    return (
        <div className="space-y-6">
            <div className="text-2xl font-semibold text-center">Biểu mẫu đính kèm</div>

            {/* Attached Documents */}
            <FormField
                control={form.control}
                name="attachedDocuments"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tài liệu đính kèm</FormLabel>
                        {/* List of Required Templates */}
                        <div className="mt-2 space-y-2">
                            <p className="font-semibold">Các biểu mẫu cần được cung cấp:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>
                                    BM.01-QT.01-KHCN Đề xuất đề tài:{" "}
                                    <a
                                        href="/form/BM.01-QT.01-KHCN Đề xuất đề tài.doc"
                                        className={`inline-flex items-center gap-1 text-blue-600 underline cursor-pointer`}
                                    >
                                        <Download className="h-4 w-4" />
                                        Tải về
                                    </a>
                                </li>
                                <li>
                                    BM.02-QT.01-KHCN Giấy xác nhận tiếp nhận và sử dụng sản phẩm đề tài:{" "}
                                    <a
                                        href="/form/BM.02-QT.01-KHCN Giấy xác nhận tiếp nhận và sử dụng sản phẩm đề tài.doc"
                                        className={`inline-flex items-center gap-1 text-blue-600 underline cursor-pointer`}
                                    >
                                        <Download className="h-4 w-4" />
                                        Tải về
                                    </a>
                                </li>
                                <li>
                                    BM.03-QT.01-KHCN Danh mục đề tài:{" "}
                                    <a
                                        href="/form/BM.03-QT.01-KHCN Danh mục đề tài.doc"
                                        className={`inline-flex items-center gap-1 text-blue-600 underline cursor-pointer`}
                                    >
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
                                readOnly={readOnly}
                            />
                        </FormControl>

                        {field.value && field.value.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <p className="text-sm text-gray-600">
                                    Kéo thả file vào đây để tải lên. (Chỉ chấp nhận file PDF)
                                </p>
                                {field.value
                                    .map((doc, index) => ({ doc, index }))
                                    .filter(({ doc }) => doc.url)
                                    .map(({ doc, index }) => (
                                        <div
                                            key={doc.id || index}
                                            className="flex items-center justify-between p-2 border rounded-md bg-gray-50"
                                        >
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-5 w-5" />
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline"
                                                >
                                                    {doc.originalFileName || doc.description || "Tài liệu đính kèm"}
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}