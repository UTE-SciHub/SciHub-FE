import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { CalendarIcon, Save, Undo2, X, InfoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FormRichTextEditor } from "@/components/editor/text-editor";
import { FormFileUploadPreview } from "@/components/file-upload-preview/file-upload-preview";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { create } from "@/service/registration-service";
import { toast } from "@/hooks/use-toast";
import Loading from "@/components/loading/loading";

const formSchema = z
  .object({
    title: z
      .string()
      .min(5, "Tiêu đề phải có ít nhất 5 ký tự")
      .max(100, "Tiêu đề không được vượt quá 100 ký tự")
      .refine((val) => /^[\p{L}\p{N}\s\-_.,()]+$/u.test(val), {
        message:
          "Tiêu đề chỉ được chứa chữ cái, số và các ký tự đặc biệt thông dụng",
      }),
    decisionNumber: z
      .string()
      .min(3, "Số quyết định không được để trống")
      .max(50, "Số quyết định không được vượt quá 50 ký tự")
      .refine((val) => /^[A-Za-z0-9\-/]+$/.test(val), {
        message:
          "Số quyết định chỉ được chứa chữ cái, số, dấu gạch ngang và dấu gạch chéo",
      }),
    decisionFile: z.string().min(1, "Vui lòng tải lên file quyết định"),
    startDate: z.date({
      required_error: "Vui lòng chọn ngày bắt đầu",
    }),
    endDate: z.date({
      required_error: "Vui lòng chọn ngày kết thúc",
    }),
    description: z
      .string()
      .min(10, "Mô tả phải có ít nhất 10 ký tự")
      .max(5000, "Mô tả không được vượt quá 5000 ký tự"),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      const diffTime = Math.abs(
        data.endDate.getTime() - data.startDate.getTime()
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 7;
    },
    {
      message: "Thời gian đăng ký phải kéo dài ít nhất 7 ngày",
      path: ["endDate"],
    }
  );

export default function CreateRegistrationPeriod() {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      decisionNumber: "",
      decisionFile: "",
      description: "",
    },
  });

  const handleFileChange = (file: File | null) => {
    setUploadedFile(file);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const formattedData = {
        title: values.title,
        decisionNumber: values.decisionNumber,
        startDate: format(new Date(values.startDate), "yyyy-MM-dd"),
        endDate: format(new Date(values.endDate), "yyyy-MM-dd"),
        description: values.description,
      };
      const formData = new FormData();
      const jsonBlob = new Blob([JSON.stringify(formattedData)], {
        type: "application/json",
      });
      formData.append("data", jsonBlob);

      if (uploadedFile) {
        formData.append("decisionFile", uploadedFile, uploadedFile.name);
      }

      const response = await create(formData);

      let variant: "success" | "error" | "info" | "warning" = "error";
      if (response.status === 201 && response.data.code === 1000) {
        variant = "success";
      } else {
        variant = "error";
      }

      toast({
        title: response.data.message,
        variant: variant,
      });
    } catch (error) {
      console.error("Error:", error);

      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi, vui lòng thử lại sau",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelLoading = () => {
    setIsLoading(false);
  };

  return (
    <div className="container">
      {isLoading && <Loading onCancel={handleCancelLoading} />}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Tạo đợt đăng ký mới
        </h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <Undo2 />
          Quay lại
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Thông tin đợt đăng ký</CardTitle>
          <CardDescription>
            Điền đầy đủ thông tin để tạo đợt đăng ký mới
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tiêu đề
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 ml-1 text-muted-foreground inline-block cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Tiêu đề của đợt đăng ký, tối đa 100 ký tự</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tiêu đề đợt đăng ký"
                        {...field}
                        className="transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </FormControl>
                    <FormDescription>
                      Tiêu đề sẽ được hiển thị cho người dùng khi đăng ký
                    </FormDescription>
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
                      <Input
                        placeholder="Nhập số quyết định (VD: QĐ-2025-0123)"
                        {...field}
                        className="transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </FormControl>
                    <FormDescription>
                      Số quyết định phê duyệt đợt đăng ký
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="decisionFile"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>File quyết định</FormLabel>
                    <FormControl>
                      <FormFileUploadPreview
                        field={field}
                        fieldState={fieldState}
                        accept=".pdf,.doc,.docx"
                        maxSize={10}
                        placeholder="Tải lên file quyết định"
                        onFileChange={handleFileChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Tải lên file quyết định phê duyệt (PDF, DOC, DOCX, tối đa
                      10MB)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal transition-all",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "yyyy-MM-dd")
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
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Ngày bắt đầu đợt đăng ký
                      </FormDescription>
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
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal transition-all",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "yyyy-MM-dd")
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
                            initialFocus
                            disabled={(date) => {
                              const startDate = form.getValues("startDate");
                              return startDate && date <= startDate;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Ngày kết thúc đợt đăng ký (ít nhất 7 ngày sau ngày bắt
                        đầu)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <FormRichTextEditor
                        label="Mô tả chi tiết thông báo"
                        field={field}
                        placeholder="Nhập mô tả chi tiết về đợt đăng ký..."
                        height="400px"
                        maxLength={5000}
                        fieldState={fieldState}
                      />
                    </FormControl>
                    <FormDescription>
                      Mô tả chi tiết về đợt đăng ký, yêu cầu và hướng dẫn
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="transition-all text-red-500 hover:bg-muted"
                >
                  <X />
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="transition-all"
                  disabled={form.formState.isSubmitting}
                >
                  <Save />
                  {form.formState.isSubmitting
                    ? "Đang xử lý..."
                    : "Tạo đợt đăng ký"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
