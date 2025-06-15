"use client"

import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Checkbox } from "../components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { EyeIcon, EyeOff } from "lucide-react"
import Loading from "@/components/loading/loading"
import { login, introspectToken, refreshToken } from "@/service/auth-service"
import Cookies from "js-cookie"
import { toast } from "@/hooks/use-toast"
import useUserStore from "@/store/userStore"
import { Roles } from "@/models/enums/roles.enum"
import { UserService } from "@/service/user-service"

// Schema validation với zod
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
})

type LoginFormData = z.infer<typeof loginSchema>

export default function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const [isLoading, setIsLoading] = useState(true)
    const [showLogin, setShowLogin] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Sử dụng react-hook-form để quản lý form
    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: localStorage.getItem("email") || "",
            password: "",
            remember: !!localStorage.getItem("email"),
        },
        mode: "onBlur",
    })

    const redirectBasedOnRoles = (roles: string[], from: string) => {
        if (!roles.length || roles.includes(Roles.STUDENT)) {
            navigate(from.includes("/admin") ? "/" : from, { replace: true })
        } else {
            navigate(from.includes("/admin") ? from : "/admin", { replace: true })
        }
    }

    useEffect(() => {
        const checkTokens = async () => {
            const accessToken = Cookies.get("access-token")
            const refreshTokenValue = Cookies.get("refresh-token")

            // Case 1: Không có token, hiển thị trang login
            if (!accessToken || !refreshTokenValue) {
                setShowLogin(true)
                setIsLoading(false)
                return
            }

            try {
                // Case 2: Kiểm tra access token
                const accessTokenResponse = await introspectToken(accessToken)
                if (accessTokenResponse.status === 200 && accessTokenResponse.data) {
                    const userResponse = await UserService.getCurrentUsers({ token: accessToken })
                    if (userResponse.code === 1000) {
                        const user = userResponse.data
                        useUserStore.getState().setUser(user)

                        const roles = (user.roles || []).map((role: { id: number; name: string }) => role.name)
                        const from = location.state?.from?.pathname || "/"
                        redirectBasedOnRoles(roles, from)
                    }
                    return
                }

                // Case 3: Access token không hợp lệ, kiểm tra refresh token
                const refreshTokenResponse = await introspectToken(refreshTokenValue)
                if (refreshTokenResponse.status === 200 && refreshTokenResponse.data) {
                    const refreshResponse = await refreshToken({ refreshToken: refreshTokenValue })
                    if (refreshResponse.status === 200 && refreshResponse.data.code === 1000) {
                        Cookies.set("access-token", refreshResponse.data.accessToken, { secure: true, sameSite: "Strict" })
                        Cookies.set("refresh-token", refreshResponse.data.refreshToken, { secure: true, sameSite: "Strict" })

                        const userResponse = await UserService.getCurrentUsers({ token: refreshResponse.data.accessToken })
                        if (userResponse.code === 1000) {
                            const user = userResponse.data
                            useUserStore.getState().setUser(user)

                            const roles = (user.roles || []).map((role: { id: number; name: string }) => role.name)
                            const from = location.state?.from?.pathname || "/"
                            redirectBasedOnRoles(roles, from)
                        }
                    }
                } else {
                    // Case 4: Cả hai token không hợp lệ
                    handleInvalidSession()
                }
            } catch (error) {
                console.error("Token check failed:", error)
                handleInvalidSession()
            } finally {
                setIsLoading(false)
            }
        }

        checkTokens()
    }, [navigate, location])

    // Xử lý khi session không hợp lệ
    const handleInvalidSession = () => {
        Cookies.remove("access-token")
        Cookies.remove("refresh-token")
        setShowLogin(true)
        toast({
            title: "Phiên đăng nhập hết hạn",
            description: "Vui lòng đăng nhập lại.",
            variant: "error",
            duration: 3000,
        })
    }

    // Xử lý submit form đăng nhập
    const handleSubmit = async (data: LoginFormData) => {
        setIsLoading(true)
        try {
            if (data.remember) {
                localStorage.setItem("email", data.email)
            } else {
                localStorage.removeItem("email")
            }

            const response = await login({
                email: data.email.trim(),
                password: data.password,
            })

            if (response.status === 200 || response.code === 1000) {
                Cookies.set("access-token", response.data.accessToken, { secure: true, sameSite: "Strict" })
                Cookies.set("refresh-token", response.data.refreshToken, { secure: true, sameSite: "Strict" })

                const userResponse = await UserService.getCurrentUsers({ token: response.data.accessToken })
                if (userResponse.status === 200 || userResponse.code === 1000) {
                    const user = userResponse.data
                    useUserStore.getState().setUser(user)

                    toast({
                        title: "Thông báo",
                        description: "Đăng nhập thành công!",
                        variant: "success",
                        duration: 2000,
                    })

                    const roles = (user.roles || []).map((role: { id: number; name: string }) => role.name)
                    const from = location.state?.from?.pathname || "/"
                    redirectBasedOnRoles(roles, from)
                }
            } else if (response.status === 401 || response.code === 1401) {
                toast({
                    title: "Thông báo",
                    description: response.message || "Thông tin đăng nhập không chính xác!",
                    variant: "error",
                    duration: 2000,
                })
            }
        } catch (error) {
            toast({
                title: "Thông báo",
                description: "Thông tin đăng nhập không chính xác!",
                variant: "error",
                duration: 2000,
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (!showLogin) {
        return <Loading onCancel={() => setIsLoading(false)} />
    }

    return (
        <div className="flex min-h-screen">
            {isLoading && <Loading onCancel={() => setIsLoading(false)} />}

            {/* Left side - Blue background with illustration */}
            <div className="hidden md:flex flex-col w-1/2 bg-[#1e3a8a] relative overflow-hidden">
                <div className="flex flex-col justify-center items-center h-full px-12 z-10">
                    <div className="max-w-md">
                        <div className="mb-12 cursor-pointer">
                            <Link to="/">
                                <img src="/logo/favicon.ico" alt="Login illustration" className="mx-auto" />
                            </Link>
                        </div>
                        <h2 className="text-white text-3xl font-semibold mb-4">Hệ thống quản lý đề tài</h2>
                    </div>
                </div>

                {/* Curved edge */}
                <div
                    className="absolute right-0 top-0 h-full w-24 bg-white"
                    style={{
                        clipPath: "polygon(100% 0, 0% 100%, 100% 100%)",
                    }}
                ></div>
            </div>

            {/* Right side - Login form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="md:hidden mb-8 text-center">
                        <Link to="/">
                            <img src="/logo/UTE.png" alt="UTE Logo" className="h-12 mx-auto" />
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl p-8 shadow-lg">
                        <h1 className="text-[#1e3a8a] text-2xl font-bold text-center mb-6">Đăng nhập</h1>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700">Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="example@ute.udn.vn"
                                                    className="h-11 border-gray-300 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700">Mật khẩu</FormLabel>
                                            <FormControl>
                                                <div className="relative h-11">
                                                    <Input
                                                        {...field}
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="••••••••••"
                                                        className="h-full pr-10 border-gray-300 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex items-center justify-between">
                                    <FormField
                                        control={form.control}
                                        name="remember"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-2">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="border-gray-300 rounded data-[state=checked]:bg-[#1e3a8a] data-[state=checked]:border-[#1e3a8a]"
                                                    />
                                                </FormControl>
                                                <FormLabel className="text-sm text-gray-600">Ghi nhớ đăng nhập</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <Link to="/forgot-password" className="text-sm text-[#1e3a8a] hover:underline">
                                        Quên mật khẩu?
                                    </Link>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-medium"
                                    disabled={isLoading}
                                >
                                    Đăng nhập
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    )
}
