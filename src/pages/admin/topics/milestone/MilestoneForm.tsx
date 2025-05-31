import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Milestone, MilestoneStatus } from "@/models/milestone"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface MilestoneFormProps {
    topicId: string
    initialData?: Milestone
    onSubmit: (data: Milestone) => void
    onCancel: () => void
    isSubmitting: boolean
}

const formSchema = z.object({
    description: z.string().min(5, "Mô tả phải có ít nhất 5 ký tự"),
    expectedCompletionDate: z.date({
        required_error: "Vui lòng chọn ngày dự kiến hoàn thành",
    }),
    status: z.nativeEnum(MilestoneStatus),
})

const MilestoneForm: React.FC<MilestoneFormProps> = ({ topicId, initialData, onSubmit, onCancel, isSubmitting }) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData
            ? {
                description: initialData.description,
                expectedCompletionDate: new Date(initialData.expectedCompletionDate),
                status: initialData.status,
            }
            : {
                description: "",
                expectedCompletionDate: new Date(),
                status: MilestoneStatus.PENDING,
            },
    })

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        const milestoneData: Milestone = {
            ...initialData,
            topicId,
            description: values.description,
            expectedCompletionDate: values.expectedCompletionDate.toISOString().split("T")[0],
            status: values.status,
        }
        onSubmit(milestoneData)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mô tả giai đoạn</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Nhập mô tả giai đoạn" {...field} rows={3} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="expectedCompletionDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Ngày dự kiến hoàn thành</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                        >
                                            {field.value ? format(field.value, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Trạng thái</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value={MilestoneStatus.PENDING}>Chưa bắt đầu</SelectItem>
                                    <SelectItem value={MilestoneStatus.IN_PROGRESS}>Đang thực hiện</SelectItem>
                                    <SelectItem value={MilestoneStatus.COMPLETED}>Đã hoàn thành</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                                Đang xử lý...
                            </>
                        ) : initialData ? (
                            "Cập nhật"
                        ) : (
                            "Tạo mới"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default MilestoneForm
