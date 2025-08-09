import { useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronRight } from "lucide-react"

// Mock Topic interface for demo
interface Topic {
  vietnameseName: string
  principalInvestigator: string
}

const reviewSchema = z
  .object({
    councilDate: z.string().min(1, "Ngày họp là bắt buộc"),
    meetingLocation: z.string().min(1, "Địa điểm họp là bắt buộc"),
    councilDecisionNumber: z.string().min(1, "Số quyết định là bắt buộc"),
    totalMembers: z.number().min(1, "Tổng số thành viên phải lớn hơn 0"),
    totalPresent: z.number().min(0, "Số thành viên có mặt không được âm"),
    totalAbsent: z.number().min(0, "Số thành viên vắng mặt không được âm"),
    guests: z.string().optional(),
    approveCount: z.number().min(0, "Số phiếu đạt không được âm"),
    rejectCount: z.number().min(0, "Số phiếu không đạt không được âm"),
    approved: z.boolean(),
    topicCode: z.string().min(1, "Mã đề tài là bắt buộc"),
    passedCriteria: z.array(z.string()),
    comments: z.object({
      topicName: z.string().optional(),
      objectives: z.string().optional(),
      content: z.string().optional(),
      products: z.string().optional(),
      budget: z.string().optional(),
      additionalNotes: z.string().optional(),
    }),
  })
  .refine((data) => data.totalPresent + data.totalAbsent === data.totalMembers, {
    message: "Tổng số thành viên có mặt và vắng mặt phải bằng tổng số thành viên",
    path: ["totalPresent"],
  })
  .refine((data) => data.approveCount + data.rejectCount === data.totalPresent, {
    message: "Tổng số phiếu đạt và không đạt phải bằng số thành viên có mặt",
    path: ["approveCount"],
  })

type ReviewFormValues = z.infer<typeof reviewSchema>

interface ReviewFormProps {
  topic
  onNextStep: (data: any) => void
  formData?: any
  onChange?: (data: any) => void
}

export default function ReviewForm({ topic, onNextStep, formData, onChange }: ReviewFormProps) {
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    mode: "onSubmit",
    defaultValues: formData || {
      councilDate: new Date().toISOString().split("T")[0],
      meetingLocation: "Phòng họp Khoa học Công nghệ - Đại học Sư phạm Kỹ thuật Đà Nẵng",
      councilDecisionNumber: "",
      totalMembers: 1,
      totalPresent: 0,
      totalAbsent: 0,
      guests: "",
      approveCount: 0,
      rejectCount: 0,
      approved: false,
      topicCode: "",
      passedCriteria: [],
      comments: {
        topicName: "",
        objectives: "",
        content: "",
        products: "",
        budget: "",
        additionalNotes: "",
      },
    },
  })

  // Reset form when formData changes
  useEffect(() => {
    if (formData) {
      Object.entries(formData).forEach(([key, value]) => {
        form.setValue(key as any, value, { shouldValidate: false })
      })
    }
  }, [formData, form])

  const onSubmit = (data: ReviewFormValues) => {
    onNextStep(data)
  }

  const handleFormChange = () => {
    const currentData = form.getValues()
    onChange?.(currentData)
  }

  // Watch form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      handleFormChange()
    })
    return () => subscription.unsubscribe()
  }, [form, onChange])

  // Auto-calculate totalAbsent when totalMembers or totalPresent changes
  const totalMembers = form.watch("totalMembers")
  const totalPresent = form.watch("totalPresent")
  const approveCount = form.watch("approveCount")

  useEffect(() => {
    const absent = totalMembers - totalPresent
    if (absent >= 0) {
      form.setValue("totalAbsent", absent, { shouldValidate: false })
    }
  }, [totalMembers, totalPresent, form])

  // Auto-calculate rejectCount when totalPresent or approveCount changes
  useEffect(() => {
    const reject = totalPresent - approveCount
    if (reject >= 0) {
      form.setValue("rejectCount", reject, { shouldValidate: false })
    }
  }, [totalPresent, approveCount, form])

  return (
    <div className="p-6" style={{ fontFamily: "Times New Roman" }}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm">ĐẠI HỌC ĐÀ NẴNG</p>
              <p className="text-sm font-semibold">TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT</p>
              <p className="text-center mt-6 font-semibold">BIÊN BẢN HỌP HỘI ĐỒNG XÁC ĐỊNH DANH MỤC</p>
              <p className="text-center font-semibold">ĐỀ TÀI KHOA HỌC & CÔNG NGHỆ CẤP TRƯỜNG</p>
            </div>

            <div className="space-y-4 mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">1. Tên đề tài:</p>
                  <p className="ml-4">{topic.vietnameseName}</p>
                </div>
                <div>
                  <p className="font-medium">2. Chủ nhiệm đề tài:</p>
                  <p className="ml-4">{topic.principalInvestigator}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="topicCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>3. Mã đề tài:</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập mã đề tài" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="councilDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>4. Ngày họp:</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="meetingLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>5. Địa điểm họp:</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập địa điểm họp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="councilDecisionNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>6. Số quyết định:</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập số quyết định" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalMembers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>7. Thành viên Hội đồng: Tổng số:</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value) || 0
                            field.onChange(value)
                          }}
                          min={0}
                          placeholder="Số thành viên"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="totalPresent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Có mặt:</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => {
                              const value = Number.parseInt(e.target.value) || 0
                              field.onChange(value)
                            }}
                            min={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalAbsent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vắng mặt:</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value} min={0} readOnly className="bg-gray-50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <p className="font-medium">8. Khách mời dự:</p>
                <FormField
                  control={form.control}
                  name="guests"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder="Nhập danh sách khách mời (nếu có)" className="mt-2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <p className="font-medium">9. Kết quả bỏ phiếu đánh giá:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                  <FormField
                    control={form.control}
                    name="approveCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số phiếu đánh giá ở mức "Đạt":</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => {
                              const value = Number.parseInt(e.target.value) || 0
                              field.onChange(value)
                            }}
                            min={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rejectCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số phiếu đánh giá ở mức "Không đạt":</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value} min={0} readOnly className="bg-gray-50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="ml-4 flex items-center space-x-4">
                  <p>Điểm số chung:</p>
                  <FormField
                    control={form.control}
                    name="approved"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Đề tài đạt yêu cầu</FormLabel>
                          <FormDescription>Đánh dấu nếu đề tài đạt yêu cầu và được phép triển khai</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <p className="text-xs italic ml-4">
                  Ghi chú: Đánh giá chung được xếp loại "Đạt" nếu trên 2/3 thành viên có mặt của hội đồng xếp loại "Đạt"
                </p>
              </div>

              <div className="space-y-4">
                <p className="font-medium">10. Kết luận của Hội đồng:</p>
                <div className="ml-4">
                  <FormField
                    control={form.control}
                    name="approved"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormLabel className="text-base font-normal">
                          10.1 Đề tài đưa vào danh mục tuyển chọn đề tài KHCN cấp Trường:
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                checked={field.value === true}
                                onChange={() => field.onChange(true)}
                              />
                              <span>Có</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                checked={field.value === false}
                                onChange={() => field.onChange(false)}
                              />
                              <span>Không</span>
                            </label>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="ml-4">
                  <p className="font-medium">10.2 Các nội dung sửa đổi, bổ sung (nếu cần):</p>
                  <Table className="mt-2 border-collapse border border-gray-200">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="border border-gray-200 text-center w-12">TT</TableHead>
                        <TableHead className="border border-gray-200">Nội dung</TableHead>
                        <TableHead className="border border-gray-200 w-1/2">
                          Nội dung sửa đổi, bổ sung <br />
                          (ghi chi tiết yêu cầu)
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="border border-gray-200 text-center">1</TableCell>
                        <TableCell className="border border-gray-200">Tên đề tài</TableCell>
                        <TableCell className="border border-gray-200">
                          <FormField
                            control={form.control}
                            name="comments.topicName"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea placeholder="Nhập yêu cầu sửa đổi (nếu có)" {...field} rows={2} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="border border-gray-200 text-center">2</TableCell>
                        <TableCell className="border border-gray-200">Mục tiêu</TableCell>
                        <TableCell className="border border-gray-200">
                          <FormField
                            control={form.control}
                            name="comments.objectives"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea placeholder="Nhập yêu cầu sửa đổi (nếu có)" {...field} rows={2} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="border border-gray-200 text-center">3</TableCell>
                        <TableCell className="border border-gray-200">Nội dung nghiên cứu</TableCell>
                        <TableCell className="border border-gray-200">
                          <FormField
                            control={form.control}
                            name="comments.content"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea placeholder="Nhập yêu cầu sửa đổi (nếu có)" {...field} rows={2} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="border border-gray-200 text-center">4</TableCell>
                        <TableCell className="border border-gray-200">
                          Sản phẩm
                          <br />
                          <span className="text-xs italic">
                            (sản phẩm khoa học, sản phẩm đào tạo, sản phẩm ứng dụng)
                          </span>
                        </TableCell>
                        <TableCell className="border border-gray-200">
                          <FormField
                            control={form.control}
                            name="comments.products"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea placeholder="Nhập yêu cầu sửa đổi (nếu có)" {...field} rows={2} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="border border-gray-200 text-center">5</TableCell>
                        <TableCell className="border border-gray-200">Kinh phí</TableCell>
                        <TableCell className="border border-gray-200">
                          <FormField
                            control={form.control}
                            name="comments.budget"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea placeholder="Nhập yêu cầu sửa đổi (nếu có)" {...field} rows={2} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium">11. Ý kiến khác:</p>
                <FormField
                  control={form.control}
                  name="comments.additionalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Nhập ý kiến khác (nếu có)" className="min-h-[100px]" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="my-4" />

              <div className="flex justify-end">
                <Button type="submit" className="bg-primary text-white hover:bg-primary/90">
                  <ChevronRight className="h-4 w-4" /> Xem trước kết quả
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}