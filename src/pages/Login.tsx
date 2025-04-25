import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { useId } from "react";
import { z } from "zod";
import Loading from "@/components/loading/loading";
import { login, introspectToken, refreshToken } from "@/service/auth-service";
import Cookies from "js-cookie";
import { toast } from "@/hooks/use-toast";
import useUserStore from "@/store/userStore";
import { Roles } from "@/models/enums/roles.enum";
import { EyeIcon, EyeOff } from "lucide-react";
import { UserService } from "@/service/user-service";

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

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const emailId = useId();
    const passwordId = useId();
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: "",
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    useEffect(() => {
        const checkTokens = async () => {
            const accessToken = Cookies.get("access-token");
            const refreshTokenValue = Cookies.get("refresh-token");

            // Case 1: No tokens, show login page
            if (!accessToken || !refreshTokenValue) {
                setShowLogin(true);
                setIsLoading(false);
                return;
            }

            try {
                // Case 2: Check access token validity
                const accessTokenResponse = await introspectToken(accessToken);
                if (accessTokenResponse.status === 200 && accessTokenResponse.data) {
                    // Access token is valid, fetch user and redirect
                    const userResponse = await UserService.getCurrentUsers({ token: accessToken });
                    if (userResponse.code === 1000) {
                        const user = userResponse.data;
                        useUserStore.getState().setUser(user);

                        const roles = user.roles || [];
                        const from = location.state?.from?.pathname || "/";

                        if (roles.includes(Roles.TEACHER) || roles.includes(Roles.ADMIN)) {
                            navigate(from.includes("/admin") ? from : "/admin", { replace: true });
                        } else {
                            navigate(from.includes("/admin") ? "/" : from, { replace: true });
                        }
                    }
                    return;
                }

                // Case 3: Access token invalid, check refresh token
                const refreshTokenResponse = await introspectToken(refreshTokenValue);
                if (refreshTokenResponse.status === 200 && refreshTokenResponse.data) {
                    // Refresh token is valid, refresh access token
                    const refreshResponse = await refreshToken({ refreshToken: refreshTokenValue });
                    if (refreshResponse.status === 200 || refreshResponse.data.code === 1000) {
                        Cookies.set("access-token", refreshResponse.data.accessToken, { secure: true, sameSite: "Strict" });
                        Cookies.set("refresh-token", refreshResponse.data.refreshToken, { secure: true, sameSite: "Strict" });

                        const userResponse = await UserService.getCurrentUsers({ token: refreshResponse.data.accessToken });
                        if (userResponse.code === 1000) {
                            const user = userResponse.data;
                            useUserStore.getState().setUser(user);

                            const roles = user.roles || [];
                            const from = location.state?.from?.pathname || "/";

                            if (roles.includes(Roles.TEACHER) || roles.includes(Roles.ADMIN)) {
                                navigate(from.includes("/admin") ? from : "/admin", { replace: true });
                            } else {
                                navigate(from.includes("/admin") ? "/" : from, { replace: true });
                            }
                        }
                    }
                } else {
                    // Case 4: Both tokens invalid, show login with session expired message
                    Cookies.remove("access-token");
                    Cookies.remove("refresh-token");
                    setShowLogin(true);
                    toast({
                        title: "Phiên đăng nhập hết hạn",
                        description: "Vui lòng đăng nhập lại.",
                        variant: "error",
                        duration: 3000,
                    });
                }
            } catch (error) {
                console.error("Token check failed:", error);
                Cookies.remove("access-token");
                Cookies.remove("refresh-token");
                setShowLogin(true);
                toast({
                    title: "Phiên đăng nhập hết hạn",
                    description: "Vui lòng đăng nhập lại.",
                    variant: "error",
                    duration: 3000,
                });
            } finally {
                setIsLoading(false);
            }
        };

        checkTokens();
    }, [navigate, location]);

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
        email?: string;
        password?: string;
    }>({});

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
        });
    };

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
            loginSchema.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors: Record<string, string> = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        formattedErrors[err.path[0] as string] = err.message;
                    }
                });
                setErrors(formattedErrors);
            }
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            if (formData.remember) {
                localStorage.setItem("email", formData.email);
            } else {
                localStorage.removeItem("email");
            }
            const response = await login({
                email: formData.email.trim(),
                password: formData.password,
            });

            if (response.status === 200 || response.code === 1000) {
                Cookies.set("access-token", response.data.accessToken, { secure: true, sameSite: "Strict" });
                Cookies.set("refresh-token", response.data.refreshToken, { secure: true, sameSite: "Strict" });

                const res = await UserService.getCurrentUsers({ token: response.data.accessToken });
                if (res.status === 200 || res.code === 1000) {
                    const user = res.data;
                    useUserStore.getState().setUser(user);

                    toast({
                        description: "Đăng nhập thành công!",
                        variant: "success",
                        duration: 2000,
                    });

                    const roles = user.roles || [];
                    const from = location.state?.from?.pathname || "/";

                    if (roles.includes(Roles.TEACHER) || roles.includes(Roles.ADMIN)) {
                        navigate(from.includes("/admin") ? from : "/admin", { replace: true });
                    } else {
                        navigate(from.includes("/admin") ? "/" : from, { replace: true });
                    }
                }
            } else if (response.status === 401 || response.code === 1401) {
                setIsError(true);
                toast({
                    title: "Thông báo",
                    description: response.message,
                    variant: "error",
                    duration: 2000,
                });
            }
        } catch (error) {
            toast({
                title: "Thông báo",
                description: "Thông tin đăng nhập không chính xác!",
                variant: "error",
            });
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelLoading = () => {
        setIsLoading(false);
    };

    if (!showLogin) {
        return <Loading onCancel={handleCancelLoading} />;
    }

    return (
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
            {isLoading && <Loading onCancel={handleCancelLoading} />}
            <section className="hidden lg:flex flex-col items-center justify-center bg-[#f0f9ff] p-8">
                <div className="max-w-[500px] text-center">
                    <Link to="/">
                        <img
                            src="/logo/UTE.png"
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
                                src="/logo/UTE.png"
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

                        <div className="space-y-2 relative">
                            <Label htmlFor={passwordId} className="text-gray-700">
                                Mật khẩu
                            </Label>
                            <Input
                                id={passwordId}
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleInputChange}
                                onBlur={(e) => validateField(e.target.name, e.target.value)}
                                placeholder="••••••••"
                                className={`h-11 border-gray-200 ${errors.password && "border-red-500"}`}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <EyeIcon className="h-4 w-4" />
                                )}
                            </button>
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
                    </form>
                </div>
            </section>
        </div>
    );
}