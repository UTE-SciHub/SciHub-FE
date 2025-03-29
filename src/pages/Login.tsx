import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Checkbox } from "../components/ui/checkbox"
import { useId } from "react"
import { z } from "zod"
import Loading from "@/components/loading/loading";
import { login } from "@/service/auth-service"
import Cookies from 'js-cookie';
import { toast } from "@/hooks/use-toast";
import { getCurrentUsers } from "@/service/user-service";
import useUserStore from "@/store/userStore";

const loginSchema = z.object({
    email: z
        .string()
        .min(1, { message: "Email là bắt buộc" })
        .email({ message: "Email không hợp lệ" })
        .refine((email) => email.endsWith("ute.udn.vn"), {
            message: "Email phải thuộc domain ute.udn.vn",
        }),
    password: z
        .string()
        .min(1, { message: "Mật khẩu là bắt buộc" })
        .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
    remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>

export default function Login() {
    const navigate = useNavigate()
    const emailId = useId()
    const passwordId = useId()
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: "",
        remember: false,
    })

    useEffect(() => {
        const savedEmail = localStorage.getItem("email");
        if (savedEmail) {
            setFormData((prev) => ({
                ...prev,
                email: savedEmail,
                remember: true,
            }));
        }
    }, []);

    const [errors, setErrors] = useState<{
        email?: string
        password?: string
    }>({})

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        if (errors[name as keyof typeof errors]) {
            setErrors({
                ...errors,
                [name]: undefined,
            });
        }
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData({
            ...formData,
            remember: checked,
        })
    }

    const validateField = (name: string, value: string) => {
        try {
            z.object({ [name]: loginSchema.shape[name] }).parse({ [name]: value });
            setErrors((prevErrors) => ({
                ...prevErrors,
                [name]: undefined,
            }));
        } catch (error) {
            if (error instanceof z.ZodError) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    [name]: error.errors[0]?.message,
                }));
            }
        }
    };

    const validateForm = () => {
        try {
            loginSchema.parse(formData)
            setErrors({})
            return true
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors: Record<string, string> = {}
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        formattedErrors[err.path[0] as string] = err.message
                    }
                })
                setErrors(formattedErrors)
            }
            return false
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            if (formData.remember) {
                localStorage.setItem("email", formData.email)
            }
            const response = await login({
                email: formData.email.trim(),
                password: formData.password,
            });

            if (response.status === 200 || response.code == 1000) {
                Cookies.set('access-token', response.data.accessToken, { secure: true, sameSite: 'Strict' });
                Cookies.set("refresh-token", response.data.refreshToken, { secure: true, sameSite: 'Strict' });

                const res = await getCurrentUsers({ token: response.data.accessToken });
                if (res.status === 200 || res.code == 1000) {
                    const user = res.data;

                    const setUser = useUserStore.getState().setUser;
                    setUser(user);

                    toast({
                        description: "Đăng nhập thành công!",
                        variant: "success",
                        duration: 2000,
                    })

                    navigate("/admin")
                }
            } else if (response.status === 401 || response.code == 1401) {
                setIsError(true)
                toast({
                    title: "Thông báo",
                    description: response.message,
                    variant: "error",
                    duration: 2000,
                })
            }
        } catch (error) {
            toast({
                title: "Thông báo",
                description: "Thông tin đăng nhập không chính xác!",
                variant: "error",
            })
            setIsError(true)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancelLoading = () => {
        setIsLoading(false);
    };

    return (
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
            {isLoading && <Loading onCancel={handleCancelLoading} />}
            <section className="hidden lg:flex flex-col items-center justify-center bg-[#f0f9ff] p-8">
                <div className="max-w-[500px] text-center">
                    <Link to="/">
                        <img
                            src="public/logo/UTE.png"
                            alt="UTE Logo"
                            width={300}
                            height={300}
                            className="mx-auto mb-8"
                        />
                    </Link>
                    <h1 className="text-3xl font-bold text-[#0056a6] mb-4">
                        Hệ Thống Quản Lý Đề Tài Nghiên Cứu Khoa Học và Công Nghệ
                    </h1>
                    <p className="text-lg text-[#0056a6]/80">
                        Nền tảng quản lý hiệu quả các đề tài nghiên cứu khoa học và công nghệ tại Trường Đại Học Sư Phạm Kỹ Thuật
                    </p>
                </div>
            </section>

            <section className="flex items-center justify-center bg-white p-6">
                <div className="w-full max-w-[400px] space-y-6">
                    <div className="flex flex-col items-center mb-8">
                        <Link to="/" className="lg:hidden">
                            <img
                                src="public/logo/UTE.png"
                                alt="UTE Logo"
                                width={150}
                                height={150}
                                className="mb-6"
                            />
                        </Link>
                        <h2 className="text-[32px] font-bold uppercase text-[#0056a6]">Đăng nhập</h2>
                        <p className="text-base text-gray-600">Chào mừng trở lại! Vui lòng nhập thông tin đăng nhập.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isError && (
                            <p className="text-md text-red-500">
                                Thông tin đăng nhập không chính xác!
                            </p>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor={emailId} className="text-gray-700">
                                Email
                            </Label>
                            <Input
                                id={emailId}
                                name="email"
                                type="text"
                                value={formData.email}
                                onChange={handleInputChange}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                                placeholder="Nhập email của bạn"
                                className={`h-11 border-gray-200 ${errors.email && "border-red-500"}`}
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={passwordId} className="text-gray-700">
                                Mật khẩu
                            </Label>
                            <Input
                                id={passwordId}
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                                placeholder="••••••••"
                                className={`h-11 border-gray-200 ${errors.password && "border-red-500"}`}
                            />
                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember"
                                    checked={formData.remember}
                                    onCheckedChange={handleCheckboxChange}
                                    className="border-gray-200 rounded data-[state=checked]:bg-[#0056a6] data-[state=checked]:border-[#0056a6]"
                                />
                                <Label htmlFor="remember" className="text-sm text-gray-600">
                                    Ghi nhớ đăng nhập
                                </Label>
                            </div>
                            <Link to="/forgot-password" className="text-sm text-[#0056a6] hover:underline">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <Button type="submit" className="w-full h-11 bg-[#0056a6] hover:bg-[#0056a6]/90" disabled={isLoading}>
                            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </Button>

                        {/* <div className="relative flex items-center justify-center my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative z-10 px-4 bg-white text-sm text-gray-500">Hoặc đăng nhập với</div>
                        </div> */}

                        {/* <div className="grid grid-cols-2 gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 border-gray-200 text-gray-700 hover:bg-gray-50"
                                onClick={() => handleSocialLogin("Google")}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-2">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Google
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 border-gray-200 text-gray-700 hover:bg-gray-50"
                                onClick={() => handleSocialLogin("Microsoft")}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" className="w-5 h-5 mr-2">
                                    <path fill="#f25022" d="M1 1h10v10H1z" />
                                    <path fill="#00a4ef" d="M1 12h10v10H1z" />
                                    <path fill="#7fba00" d="M12 1h10v10H12z" />
                                    <path fill="#ffb900" d="M12 12h10v10H12z" />
                                </svg>
                                Microsoft
                            </Button>
                        </div>

                        <p className="text-center text-sm text-gray-600">
                            Chưa có tài khoản?{" "}
                            <Link to="/register" className="text-[#0056a6] hover:underline">
                                Đăng ký
                            </Link>
                        </p> */}
                    </form>
                </div>
            </section>
        </div>
    )
}

