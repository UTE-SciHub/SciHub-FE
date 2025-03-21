import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import Cookies from 'js-cookie';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

const handleRequestSuccess = async (config) => {
    const token = Cookies.get('access-token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
};

const handleRequestErr = (err) => {
    return Promise.reject(err);
};

const handleResponseSuccess = (res) => {
    return res;
};

const handleResponseErr = async (err) => {
    const originalRequest = err.config;

    if (err.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = Cookies.get('refresh-token');

        if (!refreshToken) {
            toast({
                title: "Thông báo",
                description: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!",
                variant: "error",
            })
            window.location.href = '/login';
            return Promise.reject(err);
        }

        try {
            const res = await axiosClient.post('auth/refresh-token', {
                token: refreshToken
            });

            const newAccessToken = res.data.accessToken;
            Cookies.set('access-token', newAccessToken, { secure: true, sameSite: 'Strict' });
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return axiosClient(originalRequest);
        } catch (error) {
            Cookies.remove('access-token');
            Cookies.remove('refresh-token');

            toast({
                title: "Thông báo",
                description: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!",
                variant: "error",
            })

            window.location.href = '/login';
            return Promise.reject(error);
        }
    }
};

axiosClient.interceptors.request.use(
    (config) => handleRequestSuccess(config),
    (err) => handleRequestErr(err)
);

axiosClient.interceptors.response.use(
    (config) => handleResponseSuccess(config),
    (err) => handleResponseErr(err)
);

export default axiosClient;