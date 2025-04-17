"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export default function TimeAndBudgetStep({ form }) {

    return (
        <div className="space-y-6">
            <div className="text-2xl font-semibold text-center">Thời gian & kinh phí</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                    control={form.control}
                    name="thoiGianThucHien"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Thời gian thực hiện (số tháng) <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={1}
                                    placeholder="Nhập thời gian thực hiện"
                                    {...field}
                                    onChange={(e) => {
                                        const value = Number.parseInt(e.target.value) || 0
                                        field.onChange(value)

                                        // Update end year based on start date and duration
                                        const startDate = form.getValues("ngayBatDau")
                                        if (startDate) {
                                            const endYear = new Date(startDate).getFullYear() + Math.floor(value / 12)
                                            form.setValue("namKetThuc", endYear)
                                        }
                                    }}
                                />
                            </FormControl>
                            <FormDescription>Thời gian thực hiện đề tài tính theo tháng</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="namKetThuc"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Năm đề xuất <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={2023}
                                    placeholder="Nhập năm kết thúc"
                                    {...field}
                                    onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                />
                            </FormControl>
                            <FormDescription>Năm đề xuất đề tài</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Thông tin kinh phí</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="tongKinhPhi"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Tổng kinh phí (VNĐ) <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="Nhập tổng kinh phí"
                                        {...field}
                                        onChange={(e) => {
                                            const value = Number.parseInt(e.target.value) || 0
                                            field.onChange(value)
                                        }}
                                    />
                                </FormControl>
                                <FormDescription>Tổng kinh phí dự kiến cho đề tài</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="kinhPhiDuocDuyet"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kinh phí được duyệt (VNĐ)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="Nhập kinh phí được duyệt"
                                        {...field}
                                        onChange={(e) => {
                                            const value = Number.parseInt(e.target.value) || 0
                                            field.onChange(value)
                                        }}
                                    />
                                </FormControl>
                                <FormDescription>Kinh phí đã được duyệt (nếu có)</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex items-end gap-4 mt-4">
                    <FormField
                        control={form.control}
                        name="kinhPhiConLai"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Kinh phí còn lại (VNĐ)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="Kinh phí còn lại"
                                        {...field}
                                        onChange={(e) => {
                                            const value = Number.parseInt(e.target.value) || 0
                                            field.onChange(value)
                                        }}
                                        readOnly
                                    />
                                </FormControl>
                                <FormDescription>Kinh phí còn lại sau khi trừ kinh phí đã được duyệt</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    )
}
