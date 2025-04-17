import { FormRichTextEditor } from "@/components/editor/text-editor"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function GeneralInformationStep({ form }) {

    const researchTypeOptions = [
        { value: "loai1", label: "Loại 1" },
        { value: "loai2", label: "Loại 2" },
        { value: "loai3", label: "Loại 3" },
        { value: "loai4", label: "Duy tu, bảo dưỡng, sửa chữa CSVC-KT và trang thiết bị KH&CN" },
    ]

    const khoaOptions = [
        { value: "CNTT", label: "Khoa Công nghệ thông tin" },
        { value: "DDT", label: "Khoa Điện - Điện tử" },
        { value: "CK", label: "Khoa Cơ khí" },
        { value: "XD", label: "Khoa Xây dựng" },
    ]

    const loaiHinhNghienCuuOptions = [
        { value: "NCCB", label: "Nghiên cứu cơ bản" },
        { value: "NCUD", label: "Nghiên cứu ứng dụng" },
        { value: "PTCN", label: "Phát triển công nghệ" },
    ]

    const linhVucOptions = [
        { value: "CNTT", label: "Công nghệ thông tin" },
        { value: "DTVT", label: "Điện tử viễn thông" },
        { value: "KHTN", label: "Khoa học tự nhiên" },
        { value: "KHXH", label: "Khoa học xã hội" },
    ]

    return (
        <div className="space-y-6">
            <div className="text-2xl font-semibold text-center">Thông tin chung</div>

            <FormField
                control={form.control}
                name="vietNameseName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Tên tiếng Việt <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                            <Input placeholder="Nhập tên tiếng Việt đề tài" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="englishName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Tên tiếng Anh <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                            <Input placeholder="Nhập tên tiếng Anh đề tài" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="maKhoa"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Loại đề tài <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại đề tài" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {researchTypeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="maLinhVuc"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Lĩnh vực <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn lĩnh vực" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {linhVucOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>Lĩnh vực chuyên môn của đề tài</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="maKhoa"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Khoa <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn khoa" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {khoaOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>Khoa chủ quản của đề tài</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="maLoaiHinhNghienCuu"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Loại hình nghiên cứu <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại hình nghiên cứu" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {loaiHinhNghienCuuOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>Loại hình nghiên cứu của đề tài</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="mucTieu"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>
                            Mục tiêu nghiên cứu <span className="text-destructive">*</span>
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
                        <FormDescription>Mô tả rõ mục tiêu tổng quát và mục tiêu cụ thể của đề tài</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="noiDungChinh"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>
                            Nội dung chính <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                            <FormRichTextEditor
                                label="Nhập nội dung"
                                field={field}
                                placeholder="Nhập nội dung chính của đề tài"
                                height="400px"
                                maxLength={5000}
                                fieldState={fieldState}
                            />
                        </FormControl>
                        <FormDescription>Mô tả chi tiết các nội dung chính sẽ thực hiện trong đề tài</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />


        </div>
    )
}
