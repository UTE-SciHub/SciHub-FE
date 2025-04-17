import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

// Mock data for displaying labels
const getLinhVucLabel = (value) => {
    const options = {
        CNTT: "Công nghệ thông tin",
        DTVT: "Điện tử viễn thông",
        KHTN: "Khoa học tự nhiên",
        KHXH: "Khoa học xã hội",
    }
    return options[value] || value
}

const getLoaiHinhNghienCuuLabel = (value) => {
    const options = {
        NCCB: "Nghiên cứu cơ bản",
        NCUD: "Nghiên cứu ứng dụng",
        PTCN: "Phát triển công nghệ",
    }
    return options[value] || value
}

const getKhoaLabel = (value) => {
    const options = {
        CNTT: "Khoa Công nghệ thông tin",
        DDT: "Khoa Điện - Điện tử",
        CK: "Khoa Cơ khí",
        XD: "Khoa Xây dựng",
    }
    return options[value] || value
}

const getHoiDongLabel = (value) => {
    const options = {
        HD01: "Hội đồng Khoa học Công nghệ thông tin",
        HD02: "Hội đồng Khoa học Điện - Điện tử",
        HD03: "Hội đồng Khoa học Cơ khí",
    }
    return options[value] || value
}

const getDotDangKyLabel = (value) => {
    const options = {
        DK2023_1: "Đợt đăng ký 1 năm 2023",
        DK2023_2: "Đợt đăng ký 2 năm 2023",
        DK2024_1: "Đợt đăng ký 1 năm 2024",
    }
    return options[value] || value
}

export default function ReviewStep({ form, formValues }) {
    return (
        <div className="space-y-6">
            <div className="text-2xl font-semibold text-center">Xác nhận & hoàn tất</div>

            <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Xác nhận thông tin</AlertTitle>
                <AlertDescription>
                    Vui lòng kiểm tra lại thông tin đề tài trước khi gửi. Sau khi gửi, bạn sẽ không thể chỉnh sửa thông tin cho
                    đến khi được phê duyệt.
                </AlertDescription>
            </Alert>

            <div className="space-y-6">
                <div className="border rounded-md p-4">
                    <h3 className="font-medium text-lg mb-4">1. Thông tin chung</h3>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Tiêu đề đề tài</h4>
                            <p className="font-medium">{formValues.tieuDe}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Mục tiêu nghiên cứu</h4>
                            <p className="whitespace-pre-line">{formValues.mucTieu}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Nội dung chính</h4>
                            <p className="whitespace-pre-line">{formValues.noiDungChinh}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Sản phẩm dự kiến</h4>
                            <p className="whitespace-pre-line">{formValues.sanPhamDuKien}</p>
                        </div>
                    </div>
                </div>

                <div className="border rounded-md p-4">
                    <h3 className="font-medium text-lg mb-4">2. Thông tin chuyên môn & tổ chức</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Hình thức chuyển giao</h4>
                            <p className="font-medium">{formValues.hinhThucChuyenGiao || "Không có"}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Lĩnh vực</h4>
                            <p className="font-medium">{getLinhVucLabel(formValues.maLinhVuc)}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Loại hình nghiên cứu</h4>
                            <p className="font-medium">{getLoaiHinhNghienCuuLabel(formValues.maLoaiHinhNghienCuu)}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Khoa</h4>
                            <p className="font-medium">{getKhoaLabel(formValues.maKhoa)}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Hội đồng</h4>
                            <p className="font-medium">{getHoiDongLabel(formValues.maHoiDong)}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Đợt đăng ký</h4>
                            <p className="font-medium">{getDotDangKyLabel(formValues.maDotDangKy)}</p>
                        </div>
                    </div>
                </div>

                <div className="border rounded-md p-4">
                    <h3 className="font-medium text-lg mb-4">3. Thời gian & kinh phí</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Ngày bắt đầu</h4>
                            <p className="font-medium">
                                {formValues.ngayBatDau ? format(formValues.ngayBatDau, "dd/MM/yyyy", { locale: vi }) : "Chưa chọn"}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Thời gian thực hiện</h4>
                            <p className="font-medium">{formValues.thoiGianThucHien} tháng</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Năm kết thúc</h4>
                            <p className="font-medium">{formValues.namKetThuc}</p>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-2">Thông tin kinh phí</h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Tổng kinh phí</h4>
                                <p className="font-medium">{formValues.tongKinhPhi?.toLocaleString()} VNĐ</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Kinh phí được duyệt</h4>
                                <p className="font-medium">{formValues.kinhPhiDuocDuyet?.toLocaleString() || 0} VNĐ</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Kinh phí còn lại</h4>
                                <p className="font-medium">{formValues.kinhPhiConLai?.toLocaleString() || 0} VNĐ</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border rounded-md p-4">
                    <h3 className="font-medium text-lg mb-4">4. Trạng thái đề tài</h3>

                    <FormField
                        control={form.control}
                        name="trangThai"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Chọn trạng thái đề tài</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="DRAFT" id="draft" />
                                            <label
                                                htmlFor="draft"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Lưu nháp - Có thể chỉnh sửa sau
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="PENDING" id="pending" />
                                            <label
                                                htmlFor="pending"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Gửi đề tài - Chờ phê duyệt
                                            </label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    )
}
