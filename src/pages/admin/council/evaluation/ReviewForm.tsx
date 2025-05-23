"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Info } from "lucide-react"
import { CRITERIA_DETAILS, getTotalMaxScore, getTotalMinScore } from "@/models/evaluation-detail"
import useUserStore from "@/store/userStore"
import { getPrincipalInvestigatorName } from "@/models/topic-member"

const scoreSchema = Object.fromEntries(
    CRITERIA_DETAILS.map((criteria) => [
        criteria.id,
        z
            .number({
                required_error: `Điểm ${criteria.name} là bắt buộc`,
            })
            .min(criteria.minScore)
            .max(criteria.maxScore),
    ]),
)

const formSchema = z.object({
    ...scoreSchema,
    additionalComments: z.string().optional(),
})

interface ReviewFormProps {
    topic: any
    onNextStep: (data: any) => void
    formData: any
}

export default function ReviewForm({ topic, onNextStep, formData }: ReviewFormProps) {
    const user = useUserStore((state) => state.user)
    const [totalScore, setTotalScore] = useState(0)
    const minRequiredScore = getTotalMinScore()
    const maxPossibleScore = getTotalMaxScore()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: formData || Object.fromEntries(CRITERIA_DETAILS.map((criteria) => [criteria.id, criteria.minScore])),
        mode: "onChange",
    })

    // Reset form with formData when it changes
    useEffect(() => {
        if (formData) {
            form.reset(formData)
        }
    }, [formData, form])

    // Calculate total score whenever form values change
    const watchAllFields = form.watch()
    useEffect(() => {
        const sum = CRITERIA_DETAILS.reduce((total, criteria) => total + (watchAllFields[criteria.id] || 0), 0)
        setTotalScore(sum)
    }, [watchAllFields])

    const handleSubmit = (data: z.infer<typeof formSchema>) => {
        // Calculate final total score
        const finalScore = CRITERIA_DETAILS.reduce((total, criteria) => total + data[criteria.id], 0)

        // Prepare review data to pass to next step
        const reviewData = {
            ...data,
            totalScore: finalScore,
            passedAssessment: finalScore >= minRequiredScore,
            councilDate: new Date().toISOString(),
        }

        onNextStep(reviewData)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-6">
                {/* Topic Information Summary */}
                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Người đánh giá</CardTitle>
                        <CardDescription>
                            {user.name} - {user.email}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-medium">Tên đề tài:</h3>
                                <p className="text-sm">{topic.vietnameseName}</p>
                            </div>
                            <div>
                                <h3 className="font-medium">Mã đề tài:</h3>
                                <p className="text-sm">{topic.topicCode}</p>
                            </div>
                            <div>
                                <h3 className="font-medium">Chủ nhiệm đề tài:</h3>
                                <p className="text-sm">{getPrincipalInvestigatorName(topic)}</p>
                            </div>
                            <div>
                                <h3 className="font-medium">Lĩnh vực:</h3>
                                <p className="text-sm">{topic.field?.name || "Chưa phân loại"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Scoring Table */}
                <div className="bg-white rounded-lg border overflow-hidden mb-6">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="w-12 text-center">STT</TableHead>
                                <TableHead>Nội dung đánh giá</TableHead>
                                <TableHead className="w-32 text-center">Điểm tối thiểu</TableHead>
                                <TableHead className="w-32 text-center">Điểm tối đa</TableHead>
                                <TableHead className="w-32 text-center">Điểm đánh giá</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {CRITERIA_DETAILS.map((criteria, index) => (
                                <TableRow key={criteria.id}>
                                    <TableCell className="text-center">{index + 1}</TableCell>
                                    <TableCell>{criteria.name}</TableCell>
                                    <TableCell className="text-center">{criteria.minScore}</TableCell>
                                    <TableCell className="text-center">{criteria.maxScore}</TableCell>
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={criteria.id as any}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <input
                                                            type="number"
                                                            min={criteria.minScore}
                                                            max={criteria.maxScore}
                                                            {...field}
                                                            onChange={(e) => field.onChange(Number.parseInt(e.target.value, 10) || 0)}
                                                            className="w-full text-center px-3 py-2 border rounded-md"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow className="font-bold bg-muted/20">
                                <TableCell colSpan={2} className="text-right">
                                    Cộng
                                </TableCell>
                                <TableCell className="text-center">{minRequiredScore}</TableCell>
                                <TableCell className="text-center">{maxPossibleScore}</TableCell>
                                <TableCell className="text-center">{totalScore}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <div className="bg-amber-50 border-t p-3 text-sm">
                        <div className="flex gap-2 items-center text-amber-800">
                            <Info className="h-4 w-4" />
                            <span>
                                Ghi chú: Phê duyệt: ≥ {minRequiredScore} điểm (trong đó, không có tiêu chí nào dưới điểm tối thiểu);
                                Không phê duyệt: &lt; {minRequiredScore} điểm
                            </span>
                        </div>
                    </div>
                </div>

                {/* Additional Comments */}
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="additionalComments"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ý kiến khác:</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Nhập ý kiến đánh giá bổ sung (nếu có)..."
                                        className="min-h-[120px] resize-y"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </form>
        </Form>
    )
}
