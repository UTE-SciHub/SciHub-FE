export interface BaseResponse<T> {
    code: number;
    timestamp: string;
    path: string;
    data: T;
    message: string;
    status: number;
}