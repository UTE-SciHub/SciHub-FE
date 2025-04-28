import { FormRichTextEditor } from "@/components/editor/text-editor"
import KeywordsInput from "@/components/multiple-select/keyword-input"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Category } from "@/models/category"
import { Department } from "@/models/department"
import { ResearchField } from "@/models/research-field"
import { ResearchType } from "@/models/research-type"
import { TopicService } from "@/service/topic-service"
import { useState } from "react"

interface GeneralInformationStepProps {
    form: any;
    departmentOptions: Department[];
    researchTypeOptions: ResearchType[];
    researchFieldOptions: ResearchField[];
    categoriesOptions: Category[];
    isLoadingOptions: boolean;
}

export default function GeneralInformationStep({
    form,
    departmentOptions,
    researchTypeOptions,
    researchFieldOptions,
    categoriesOptions,
    isLoadingOptions,
}: GeneralInformationStepProps) {

    return (
        <div className="space-y-6">
            <div className="text-2xl font-semibold text-center">Thông tin chung</div>

            {/* Vietnamese Name */}
            <FormField
                control={form.control}
                name="vietnameseName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Tên tiếng Việt <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                            <Input placeholder="Nhập tên đề tài bằng tiếng Việt" {...field} />
                        </FormControl>
                        <FormDescription>Tên của đề tài bằng tiếng Việt</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* English Name */}
            <FormField
                control={form.control}
                name="englishName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Tên tiếng Anh <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                            <Input placeholder="Nhập tên đề tài bằng tiếng Anh" {...field} />
                        </FormControl>
                        <FormDescription>Tên của đề tài bằng tiếng Anh</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Principal Investigator */}
            <FormField
                control={form.control}
                name="principalInvestigator"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Chủ nhiệm đề tài <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                            <Input placeholder="Nhập họ tên chủ nhiệm đề tài" {...field} />
                        </FormControl>
                        <FormDescription>Họ tên và học vị của người đứng đầu đề tài</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department */}
                <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Khoa <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingOptions}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isLoadingOptions ? "Đang tải..." : "Chọn khoa"} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {departmentOptions.length === 0 && !isLoadingOptions && (
                                        <SelectItem value="" disabled>
                                            Không có khoa nào khả dụng
                                        </SelectItem>
                                    )}
                                    {departmentOptions.map((option) => (
                                        <SelectItem key={option.id} value={String(option.id)}>
                                            {option.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>Khoa quản lý đề tài</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Field */}
                <FormField
                    control={form.control}
                    name="field"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Lĩnh vực <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                                onValueChange={field.onChange} value={field.value} disabled={isLoadingOptions}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isLoadingOptions ? "Đang tải..." : "Chọn lĩnh vực nghiên cứu"} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {researchFieldOptions.length === 0 && !isLoadingOptions && (
                                        <SelectItem value="" disabled>
                                            Không có lĩnh vực nào khả dụng
                                        </SelectItem>
                                    )}
                                    {researchFieldOptions.map((option) => (
                                        <SelectItem key={option.id} value={String(option.id)}>
                                            {option.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>Lĩnh vực nghiên cứu của đề tài</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Research Type */}
                <FormField
                    control={form.control}
                    name="researchType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Loại hình nghiên cứu <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                                onValueChange={field.onChange} value={field.value} disabled={isLoadingOptions}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isLoadingOptions ? "Đang tải..." : "Chọn loại hình nghiên cứu"} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {researchTypeOptions.length === 0 && !isLoadingOptions && (
                                        <SelectItem value="" disabled>
                                            Không có loại hình nào khả dụng
                                        </SelectItem>
                                    )}
                                    {researchTypeOptions.map((option) => (
                                        <SelectItem key={option.id} value={String(option.id)}>
                                            {option.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>Loại hình nghiên cứu của đề tài</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Category */}
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Loại đề tài <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                                onValueChange={field.onChange} value={field.value} disabled={isLoadingOptions}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isLoadingOptions ? "Đang tải..." : "Chọn loại đề tài"} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categoriesOptions.length === 0 && !isLoadingOptions && (
                                        <SelectItem value="" disabled>
                                            Không có loại đề tài nào khả dụng
                                        </SelectItem>
                                    )}
                                    {categoriesOptions.map((option) => (
                                        <SelectItem key={option.id} value={String(option.id)}>
                                            {option.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Keywords */}
            <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Từ khóa <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                            <KeywordsInput
                                form={form}
                                field={field}
                                placeholder="Nhập từ khóa"
                                description="Các từ khóa liên quan đến đề tài"
                                required={true}
                            />
                        </FormControl>
                        <FormDescription>Các từ khóa liên quan đến đề tài</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Objectives */}
            <FormField
                control={form.control}
                name="objectives"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>
                            Mục tiêu <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                            <FormRichTextEditor
                                label="Nhập mục tiêu nghiên cứu"
                                field={field}
                                placeholder="Nhập chi tiết mục tiêu nghiên cứu"
                                height="400px"
                                maxLength={5000}
                                fieldState={fieldState}
                            />
                        </FormControl>
                        <FormDescription>Mô tả mục tiêu chung và cụ thể của đề tài</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Main Content */}
            <FormField
                control={form.control}
                name="mainContent"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>
                            Nội dung chính <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                            <FormRichTextEditor
                                label="Nhập nội dung chính"
                                field={field}
                                placeholder="Nhập nội dung chính của đề tài"
                                height="400px"
                                maxLength={5000}
                                fieldState={fieldState}
                            />
                        </FormControl>
                        <FormDescription>Mô tả chi tiết nội dung sẽ thực hiện trong đề tài</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Novelty */}
            <FormField
                control={form.control}
                name="novelty"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>
                            Điểm mới và sáng tạo <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                            <FormRichTextEditor
                                label="Nhập tính mới"
                                field={field}
                                placeholder="Mô tả tính mới và đóng góp khoa học"
                                height="400px"
                                maxLength={5000}
                                fieldState={fieldState}
                            />
                        </FormControl>
                        <FormDescription>Mô tả tính mới và đóng góp khoa học của đề tài</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}