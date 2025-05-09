import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, Check, ChevronRight, Loader2, Plus, Save, Search, Trash2, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CouncilMemberRole, CouncilType, CreateCouncilRequest } from "@/models/council"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/hooks/use-toast"
import { CouncilService } from "@/service/council-service"
import { User } from "@/models/user"
import { Topic } from "@/models/topic"
import { TopicService } from "@/service/topic-service"
import { UserService } from "@/service/user-service"
import { TopicStatus } from "@/models/enums/topic-status.enum"
import { RegistrationPeriod } from "@/models/registraion-period"
import { RegistrationService } from "@/service/registration-service"
import { RegistrationPeriodStatus } from "@/models/enums/registration-period-status"

// Custom useDebounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

// Define the form schema for council creation
const councilFormSchema = z.object({
    name: z.string().min(3, {
        message: "Tên hội đồng phải có ít nhất 3 ký tự",
    }),
    decisionNumber: z.string().min(1, {
        message: "Số quyết định không được để trống",
    }),
    establishmentDate: z.date({
        required_error: "Vui lòng chọn ngày thành lập",
    }),
    startDate: z.date({
        required_error: "Vui lòng chọn ngày bắt đầu",
    }),
    endDate: z.date({
        required_error: "Vui lòng chọn ngày kết thúc",
    }),
    type: z.nativeEnum(CouncilType, {
        required_error: "Vui lòng chọn loại hội đồng",
    }),
    notes: z.string().optional(),
})

export default function CreateCouncilPage() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("council-info")
    const [selectedTopics, setSelectedTopics] = useState<Topic[]>([])
    const [councilMembers, setCouncilMembers] = useState<Array<{ user: User; role: CouncilMemberRole }>>([])
    const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false)
    const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false)
    const [topicSearchTerm, setTopicSearchTerm] = useState("")
    const [memberSearchTerm, setMemberSearchTerm] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [decisionFile, setDecisionFile] = useState<File | null>(null)
    const [registrationPeriods, setRegistrationPeriods] = useState<RegistrationPeriod[]>([])
    const [selectedPeriodId, setSelectedPeriodId] = useState<string>("all")
    const [filteredTopics, setFilteredTopics] = useState<Topic[]>([])
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const [isLoadingTopics, setIsLoadingTopics] = useState(false)
    const [isLoadingUsers, setIsLoadingUsers] = useState(false)
    const [selectedRoles, setSelectedRoles] = useState<Record<string, CouncilMemberRole>>({})

    // Debounce search terms
    const debouncedTopicSearchTerm = useDebounce(topicSearchTerm, 500)
    const debouncedMemberSearchTerm = useDebounce(memberSearchTerm, 500)

    // Initialize form
    const form = useForm<z.infer<typeof councilFormSchema>>({
        resolver: zodResolver(councilFormSchema),
        defaultValues: {
            name: "",
            decisionNumber: "",
            type: CouncilType.SELECT_CNDT,
            notes: "",
        },
    })

    // Fetch registration periods
    useEffect(() => {
        const fetchPeriods = async () => {
            try {
                const response = await RegistrationService.getAll({
                    p: 1,
                    s: 1000,
                    sort: "startDate",
                    order: "desc",
                    status: RegistrationPeriodStatus.OPEN,
                })
                setRegistrationPeriods(Array.isArray(response.data.data) ? response.data.data : [])
            } catch (error) {
                console.error("Lỗi khi lấy danh sách đợt:", error)
                toast({
                    title: "Lỗi khi tải dữ liệu",
                    description: "Không thể tải danh sách đợt. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
                    variant: "error",
                })
            }
        }

        fetchPeriods()
    }, [])

    // Fetch topics based on debounced search term and period ID
    useEffect(() => {
        const fetchTopics = async () => {
            setIsLoadingTopics(true)
            try {
                const response = await TopicService.getAll({
                    p: 1,
                    s: 1000,
                    q: debouncedTopicSearchTerm,
                    periodId: selectedPeriodId !== "all" ? selectedPeriodId : undefined,
                    status: TopicStatus.IN_CATALOG
                })
                const topics = Array.isArray(response.data.data) ? response.data.data : []
                setFilteredTopics(topics)
            } catch (error) {
                console.error("Lỗi khi lấy danh sách đề tài:", error)
                toast({
                    title: "Lỗi khi tải dữ liệu",
                    description: "Không thể tải danh sách đề tài. Vui lòng thử lại.",
                    variant: "error",
                })
                setFilteredTopics([])
            } finally {
                setIsLoadingTopics(false)
            }
        }

        fetchTopics()
    }, [debouncedTopicSearchTerm, selectedPeriodId])

    // Fetch users based on debounced search term
    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoadingUsers(true)
            try {
                const response = await UserService.getAllUserNotStudent({ q: debouncedMemberSearchTerm })
                const users = Array.isArray(response.data.data) ? response.data.data : []
                setFilteredUsers(users)
            } catch (error) {
                console.error("Lỗi khi lấy danh sách người dùng:", error)
                toast({
                    title: "Lỗi khi tải dữ liệu",
                    description: "Không thể tải danh sách người dùng. Vui lòng thử lại.",
                    variant: "error",
                })
                setFilteredUsers([])
            } finally {
                setIsLoadingUsers(false)
            }
        }

        fetchUsers()
    }, [debouncedMemberSearchTerm])

    // Check if a topic is already selected
    const isTopicSelected = (topicId: string) => {
        return (selectedTopics || []).some((topic) => topic.id === topicId)
    }

    // Add a topic to the selected list
    const addTopic = (topic: Topic) => {
        if (!isTopicSelected(topic.id)) {
            setSelectedTopics((prev) => [...prev, topic])
        }
    }

    // Remove a topic from the selected list
    const removeTopic = (topicId: string) => {
        setSelectedTopics((prev) => prev.filter((topic) => topic.id !== topicId))
    }

    // Check if a user is already a member
    const isUserMember = (userId: string) => {
        return councilMembers.some((member) => member.user.id === userId)
    }

    // Add a member to the council
    const addMember = (user: User, userId: string) => {
        if (!isUserMember(userId)) {
            const role = selectedRoles[userId] || CouncilMemberRole.MEMBER
            setCouncilMembers([...councilMembers, { user, role }])
            setIsMemberDialogOpen(false)
        }
    }

    // Remove a member from the council
    const removeMember = (userId: string) => {
        setCouncilMembers(councilMembers.filter((member) => member.user.id !== userId))
    }

    // Update a member's role
    const updateMemberRole = (userId: string, role: CouncilMemberRole) => {
        setCouncilMembers(councilMembers.map((member) => (member.user.id === userId ? { ...member, role } : member)))
    }

    // Update selected role for a user
    const updateSelectedRole = (userId: string, role: CouncilMemberRole) => {
        setSelectedRoles((prev) => ({
            ...prev,
            [userId]: role
        }))
    }

    // Handle file upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setDecisionFile(e.target.files[0])
        }
    }

    // Handle period change
    const handlePeriodChange = (value: string) => {
        setSelectedPeriodId(value)
    }

    // Handle form submission
    const onSubmit = async (data: z.infer<typeof councilFormSchema>) => {
        if (!(selectedTopics || []).length) {
            toast({
                title: "Thiếu thông tin",
                description: "Vui lòng chọn ít nhất một đề tài cho hội đồng",
                variant: "error",
            })
            return
        }

        if (councilMembers.length === 0) {
            toast({
                title: "Thiếu thông tin",
                description: "Vui lòng thêm ít nhất một thành viên vào hội đồng",
                variant: "error",
            })
            return
        }

        // Check if there's a chairman
        const hasChairman = councilMembers.some((member) => member.role === CouncilMemberRole.CHAIRMAN)
        if (!hasChairman) {
            toast({
                title: "Thiếu thông tin",
                description: "Hội đồng phải có ít nhất một chủ tịch",
                variant: "error",
            })
            return
        }

        setIsSubmitting(true)

        try {
            // Format dates to ISO string
            const establishmentDate = data.establishmentDate.toISOString().split("T")[0]
            const startDate = data.startDate.toISOString().split("T")[0]
            const endDate = data.endDate.toISOString().split("T")[0]

            const councilData: CreateCouncilRequest = {
                name: data.name,
                decisionNumber: data.decisionNumber,
                establishmentDate: establishmentDate,
                startDate: startDate,
                endDate: endDate,
                notes: data.notes,
                type: data.type,
                members: councilMembers.map((member) => ({
                    userId: member.user.id,
                    role: member.role,
                })),
                topics: selectedTopics.map((topic) => topic.id),
            }

            // // If there's a decision file, upload it first
            // if (decisionFile) {
            //     console.log("Uploading decision file:", decisionFile.name)
            //     await new Promise((resolve) => setTimeout(resolve, 500))
            // }

            const result = await CouncilService.create(councilData)

            if (result.status === 201 && result.data.code === 1000) {
                toast({
                    title: "Thành công",
                    description: "Hội đồng đã được tạo thành công",
                    variant: "success",
                })
                // navigate("/councils")
            } else {
                toast({
                    title: "Lỗi",
                    description: result.data.message || "Có lỗi xảy ra khi tạo hội đồng. Vui lòng thử lại.",
                    variant: "error",
                })
            }
        } catch (error) {
            console.error("Error creating council:", error)
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi tạo hội đồng. Vui lòng thử lại.",
                variant: "error",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Navigate to next tab
    const goToNextTab = () => {
        if (activeTab === "council-info") {
            const isValid = form.trigger(["name", "decisionNumber", "establishmentDate", "startDate", "endDate", "type"])
            if (isValid) {
                setActiveTab("topics")
            }
        } else if (activeTab === "topics") {
            if (!(selectedTopics || []).length) {
                toast({
                    title: "Thiếu thông tin",
                    description: "Vui lòng chọn ít nhất một đề tài cho hội đồng",
                    variant: "error",
                })
            } else {
                setActiveTab("members")
            }
        }
    }

    // Navigate to previous tab
    const goToPreviousTab = () => {
        if (activeTab === "topics") {
            setActiveTab("council-info")
        } else if (activeTab === "members") {
            setActiveTab("topics")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Thành lập Hội đồng Xét duyệt</h1>
                    <p className="text-slate-600 mt-1">Tạo hội đồng mới để xét duyệt chủ nhiệm đề tài</p>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50 border-b border-slate-200">
                    <CardTitle>Thông tin hội đồng</CardTitle>
                    <CardDescription>Điền đầy đủ thông tin để thành lập hội đồng mới</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-3 w-full rounded-none border-b bg-slate-50">
                            <TabsTrigger
                                value="council-info"
                                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                            >
                                1. Thông tin cơ bản
                            </TabsTrigger>
                            <TabsTrigger
                                value="topics"
                                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                            >
                                2. Chọn đề tài
                            </TabsTrigger>
                            <TabsTrigger
                                value="members"
                                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                            >
                                3. Thành viên hội đồng
                            </TabsTrigger>
                        </TabsList>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <TabsContent value="council-info" className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tên hội đồng</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nhập tên hội đồng" {...field} />
                                                    </FormControl>
                                                    <FormDescription>Tên đầy đủ của hội đồng xét duyệt</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="decisionNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Số quyết định</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nhập số quyết định" {...field} />
                                                    </FormControl>
                                                    <FormDescription>Số quyết định thành lập hội đồng</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Loại hội đồng</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Chọn loại hội đồng" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value={CouncilType.SELECT_CNDT}>Hội đồng xét duyệt</SelectItem>
                                                            <SelectItem value={CouncilType.EVALUATE_TOPIC}>Hội đồng đánh giá</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>Loại hội đồng quyết định chức năng và nhiệm vụ</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="md:col-span-2">
                                            <FormLabel>Tệp quyết định</FormLabel>
                                            <div className="mt-2 flex items-center gap-4">
                                                <Input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="flex-1" />
                                                {decisionFile && (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                                                        {decisionFile.name}
                                                    </Badge>
                                                )}
                                            </div>
                                            <FormDescription className="mt-1">
                                                Tải lên tệp quyết định thành lập hội đồng (PDF, DOC, DOCX)
                                            </FormDescription>
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="establishmentDate"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Ngày thành lập</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    type="button"
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground",
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "dd/MM/yyyy", { locale: vi })
                                                                    ) : (
                                                                        <span>Chọn ngày</span>
                                                                    )}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) => date < new Date("1900-01-01")}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormDescription>Ngày ra quyết định thành lập hội đồng</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="startDate"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Ngày bắt đầu</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    type="button"
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground",
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "dd/MM/yyyy", { locale: vi })
                                                                    ) : (
                                                                        <span>Chọn ngày</span>
                                                                    )}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) => date < new Date("1900-01-01")}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormDescription>Ngày hội đồng bắt đầu làm việc</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="endDate"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Ngày kết thúc</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    type="button"
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground",
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "dd/MM/yyyy", { locale: vi })
                                                                    ) : (
                                                                        <span>Chọn ngày</span>
                                                                    )}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) => date < new Date("1900-01-01")}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormDescription>Ngày hội đồng kết thúc làm việc</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="notes"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel>Ghi chú</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Nhập ghi chú về hội đồng (nếu có)"
                                                            className="min-h-[100px]"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>Thông tin bổ sung về hội đồng</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="flex justify-end mt-6">
                                        <Button type="button" onClick={goToNextTab}>
                                            Tiếp theo
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="topics" className="p-6">
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-lg font-medium">Danh sách đề tài</h3>
                                                <p className="text-sm text-slate-500">Chọn các đề tài mà hội đồng sẽ xét duyệt</p>
                                            </div>
                                            <Button type="button" onClick={() => setIsTopicDialogOpen(true)}>
                                                <Plus className="h-4 w-4" />
                                                Thêm đề tài
                                            </Button>
                                        </div>

                                        {(selectedTopics || []).length > 0 ? (
                                            <div className="border rounded-md">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-[100px]">Mã đề tài</TableHead>
                                                            <TableHead>Tên đề tài</TableHead>
                                                            <TableHead className="w-[150px]">Lĩnh vực</TableHead>
                                                            <TableHead className="w-[100px]"></TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {selectedTopics.map((topic) => (
                                                            <TableRow key={topic.id}>
                                                                <TableCell className="font-medium">{topic.topicCode}</TableCell>
                                                                <TableCell>{topic.vietnameseName}</TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline" className="bg-slate-50">
                                                                        {topic.field?.name}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => removeTopic(topic.id)}
                                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <div className="border rounded-md p-8 text-center">
                                                <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                                    <Search className="h-6 w-6 text-slate-400" />
                                                </div>
                                                <h3 className="text-lg font-medium text-slate-900 mb-1">Chưa có đề tài nào</h3>
                                                <p className="text-slate-500 max-w-md mx-auto mb-4">
                                                    Vui lòng thêm ít nhất một đề tài để hội đồng xét duyệt
                                                </p>
                                                <Button type="button" onClick={() => setIsTopicDialogOpen(true)}>
                                                    <Plus className="h-4 w-4" />
                                                    Thêm đề tài
                                                </Button>
                                            </div>
                                        )}

                                        <div className="flex justify-between mt-6">
                                            <Button type="button" variant="outline" onClick={goToPreviousTab}>
                                                Quay lại
                                            </Button>
                                            <Button type="button" onClick={goToNextTab}>
                                                Tiếp theo
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="members" className="p-6">
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-lg font-medium">Thành viên hội đồng</h3>
                                                <p className="text-sm text-slate-500">Thêm và phân công vai trò cho các thành viên</p>
                                            </div>
                                            <Button type="button" onClick={() => setIsMemberDialogOpen(true)}>
                                                <Plus className="h-4 w-4" />
                                                Thêm thành viên
                                            </Button>
                                        </div>

                                        {councilMembers.length > 0 ? (
                                            <div className="border rounded-md">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Họ và tên</TableHead>
                                                            <TableHead>Email</TableHead>
                                                            <TableHead className="w-[180px]">Vai trò</TableHead>
                                                            <TableHead className="w-[80px]"></TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {councilMembers.map((member) => (
                                                            <TableRow key={member.user.id}>
                                                                <TableCell className="font-medium">{member.user.name}</TableCell>
                                                                <TableCell>{member.user.email}</TableCell>
                                                                <TableCell>
                                                                    <Select
                                                                        value={member.role}
                                                                        onValueChange={(value) =>
                                                                            updateMemberRole(member.user.id, value as CouncilMemberRole)
                                                                        }
                                                                    >
                                                                        <SelectTrigger className="w-full">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value={CouncilMemberRole.CHAIRMAN}>Chủ tịch</SelectItem>
                                                                            <SelectItem value={CouncilMemberRole.SECRETARY}>Thư ký</SelectItem>
                                                                            <SelectItem value={CouncilMemberRole.REVIEWER}>Phản biện</SelectItem>
                                                                            <SelectItem value={CouncilMemberRole.MEMBER}>Ủy viên</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => removeMember(member.user.id)}
                                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <div className="border rounded-md p-8 text-center">
                                                <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                                    <Users className="h-6 w-6 text-slate-400" />
                                                </div>
                                                <h3 className="text-lg font-medium text-slate-900 mb-1">Chưa có thành viên nào</h3>
                                                <p className="text-slate-500 max-w-md mx-auto mb-4">
                                                    Vui lòng thêm thành viên và phân công vai trò trong hội đồng
                                                </p>
                                                <Button type="button" onClick={() => setIsMemberDialogOpen(true)}>
                                                    <Plus className="h-4 w-4" />
                                                    Thêm thành viên
                                                </Button>
                                            </div>
                                        )}

                                        <div className="flex justify-between mt-6">
                                            <Button type="button" variant="outline" onClick={goToPreviousTab}>
                                                Quay lại
                                            </Button>
                                            <Button type="submit" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Đang xử lý...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4" />
                                                        Lưu hội đồng
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>
                            </form>
                        </Form>
                    </Tabs>
                </CardContent>
            </Card>

            <Dialog open={isTopicDialogOpen} onOpenChange={setIsTopicDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b">
                        <DialogTitle>Chọn đề tài</DialogTitle>
                        <DialogDescription>Tìm kiếm và chọn đề tài cho hội đồng xét duyệt</DialogDescription>
                    </DialogHeader>

                    <div className="p-6 border-b">
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Tìm kiếm theo mã hoặc tên đề tài..."
                                    className="pl-10"
                                    value={topicSearchTerm}
                                    onChange={(e) => setTopicSearchTerm(e.target.value)}
                                />
                            </div>

                            <div>
                                <Select value={selectedPeriodId} onValueChange={handlePeriodChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn đợt đăng ký" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả đợt đăng ký</SelectItem>
                                        {registrationPeriods.map((period) => (
                                            <SelectItem key={period.id} value={period.id}>
                                                {period.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <ScrollArea className="h-[400px]">
                        <div className="p-6">
                            {isLoadingTopics ? (
                                <div className="flex justify-center items-center h-40">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Mã đề tài</TableHead>
                                            <TableHead>Tên đề tài</TableHead>
                                            <TableHead className="w-[150px]">Lĩnh vực</TableHead>
                                            <TableHead className="w-[100px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTopics.length > 0 ? (
                                            filteredTopics.map((topic) => (
                                                <TableRow key={topic.id}>
                                                    <TableCell className="font-medium">{topic.topicCode}</TableCell>
                                                    <TableCell>{topic.vietnameseName}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="bg-slate-50">
                                                            {topic.field?.name}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {isTopicSelected(topic.id) ? (
                                                            <Button type="button" variant="ghost" size="sm" className="w-full" disabled>
                                                                <Check className="h-4 w-4" />
                                                                Đã chọn
                                                            </Button>
                                                        ) : (
                                                            <Button type="button" variant="default" size="sm" className="w-full" onClick={() => addTopic(topic)}>
                                                                Chọn
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-6">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <Search className="h-8 w-8 text-slate-300 mb-2" />
                                                        <p className="text-slate-500">Không tìm thấy đề tài nào</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </ScrollArea>

                    <DialogFooter className="px-6 py-4 border-t bg-slate-50">
                        <Button type="button" variant="outline" onClick={() => setIsTopicDialogOpen(false)}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b">
                        <DialogTitle>Thêm thành viên</DialogTitle>
                        <DialogDescription>Tìm kiếm và thêm thành viên vào hội đồng</DialogDescription>
                    </DialogHeader>

                    <div className="p-6 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Tìm kiếm theo tên hoặc email..."
                                className="pl-10"
                                value={memberSearchTerm}
                                onChange={(e) => setMemberSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <ScrollArea className="h-[400px]">
                        <div className="p-6">
                            {isLoadingUsers ? (
                                <div className="flex justify-center items-center h-40">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Họ và tên</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead className="w-[180px]">Vai trò</TableHead>
                                            <TableHead className="w-[100px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user) => {
                                                const isMember = isUserMember(user.id)
                                                return (
                                                    <TableRow key={user.id}>
                                                        <TableCell className="font-medium">{user.name}</TableCell>
                                                        <TableCell>{user.email}</TableCell>
                                                        <TableCell>
                                                            <Select
                                                                value={selectedRoles[user.id] || CouncilMemberRole.MEMBER}
                                                                onValueChange={(value) => updateSelectedRole(user.id, value as CouncilMemberRole)}
                                                                disabled={isMember}
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value={CouncilMemberRole.CHAIRMAN}>Chủ tịch</SelectItem>
                                                                    <SelectItem value={CouncilMemberRole.SECRETARY}>Thư ký</SelectItem>
                                                                    <SelectItem value={CouncilMemberRole.REVIEWER}>Phản biện</SelectItem>
                                                                    <SelectItem value={CouncilMemberRole.MEMBER}>Ủy viên</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </TableCell>
                                                        <TableCell>
                                                            {isMember ? (
                                                                <Button type="button" variant="ghost" size="sm" className="w-full" disabled>
                                                                    <Check className="h-4 w-4" />
                                                                    Đã thêm
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    type="button"
                                                                    variant="default"
                                                                    size="sm"
                                                                    className="w-full"
                                                                    onClick={() => addMember(user, user.id)}
                                                                >
                                                                    Thêm
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-6">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <Search className="h-8 w-8 text-slate-300 mb-2" />
                                                        <p className="text-slate-500">Không tìm thấy người dùng nào</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </ScrollArea>

                    <DialogFooter className="px-6 py-4 border-t bg-slate-50">
                        <Button type="button" variant="outline" onClick={() => setIsMemberDialogOpen(false)}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}