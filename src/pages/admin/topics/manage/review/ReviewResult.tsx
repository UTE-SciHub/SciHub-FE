import { forwardRef } from "react";
import { Topic } from "@/models/topic";

const ReviewResult = forwardRef<HTMLDivElement, { topic: Topic; reviewData: any }>(({ topic, reviewData }, ref) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    return (
        <div className="space-y-6 w-full">

            <div className="p-6">
                <div ref={ref} className="w-full mx-auto bg-white p-8 font-times">
                    {/* Header */}
                    <div className="grid grid-cols-2 mb-8">
                        <div className="text-center">
                            <p className="uppercase font-semibold">ĐẠI HỌC ĐÀ NẴNG</p>
                            <p className="uppercase font-bold">TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT</p>
                        </div>
                        <div className="text-center">
                            <p className="uppercase font-semibold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                            <p>Độc lập - Tự do - Hạnh phúc</p>
                            <p className="text-xs">&#8727;</p>
                            <p>Đà Nẵng, ngày {reviewData.councilDate ? formatDate(reviewData.councilDate) : "...."}</p>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <p className="uppercase font-bold text-lg">BIÊN BẢN HỌP HỘI ĐỒNG XÁC ĐỊNH DANH MỤC</p>
                        <p className="uppercase font-bold text-lg">ĐỀ TÀI KHOA HỌC & CÔNG NGHỆ CẤP TRƯỜNG</p>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        <div>
                            <p><span className="font-semibold">1. Tên đề tài:</span> {topic.vietnameseName}</p>
                        </div>

                        <div>
                            <p><span className="font-semibold">2. Chủ nhiệm đề tài:</span> {topic.principalInvestigator}</p>
                        </div>

                        <div>
                            <p>
                                <span className="font-semibold">3. Ngày họp:</span> {reviewData.councilDate ? formatDate(reviewData.councilDate) : ""}
                                <span className="ml-4">Địa điểm: {reviewData.meetingLocation || ""}</span>
                            </p>
                        </div>

                        <div>
                            <p><span className="font-semibold">4. Quyết định thành lập hội đồng số:</span> ............ ngày ........ tháng ........ năm ........</p>
                        </div>

                        <div>
                            <p>
                                <span className="font-semibold">5. Thành viên Hội đồng:</span> Tổng số: {reviewData.totalPresent + reviewData.totalAbsent || "........"}
                                <span className="ml-4">Có mặt: {reviewData.totalPresent || "........"}</span>
                                <span className="ml-4">Vắng mặt: {reviewData.totalAbsent || "........"}</span>
                            </p>
                        </div>

                        <div>
                            <p><span className="font-semibold">6. Khách mời dự:</span> .................................</p>
                        </div>

                        <div>
                            <p className="font-semibold">7. Kết quả bỏ phiếu đánh giá:</p>
                            <ul className="list-disc ml-8">
                                <li>Số phiếu đánh giá ở mức "Đạt": {reviewData.approveCount || "........"}</li>
                                <li>Số phiếu đánh giá ở mức "Không đạt": {reviewData.rejectCount || "........"}</li>
                                <li>Điểm số chung: {reviewData.approved ? "Đạt" : "Không đạt"} ☐</li>
                            </ul>
                            <p className="text-xs italic ml-4">
                                <span className="font-semibold">Ghi chú:</span> Đánh giá chung được xếp loại "Đạt" nếu trên 2/3 thành viên có mặt của hội đồng xếp loại "Đạt"
                            </p>
                        </div>

                        <div>
                            <p className="font-semibold">8. Kết luận của Hội đồng:</p>
                            <p className="ml-4">
                                8.1 Đề tài đưa vào danh mục tuyển chọn đề tài KHCN cấp Trường:
                                <span className="mx-2">
                                    {reviewData.approved ? "Có ☒" : "Có ☐"}
                                </span>
                                <span className="mx-2">
                                    {!reviewData.approved ? "Không ☒" : "Không ☐"}
                                </span>
                            </p>

                            <div className="ml-4 mt-2">
                                <p>8.2 Các nội dung sửa đổi, bổ sung (nếu cần):</p>
                                <table className="w-full border-collapse border border-gray-400 mt-2">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-400 p-2 text-center w-12">TT</th>
                                            <th className="border border-gray-400 p-2 text-center">Nội dung</th>
                                            <th className="border border-gray-400 p-2 text-center w-1/2">Nội dung sửa đổi, bổ sung<br />(ghi chi tiết yêu cầu)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border border-gray-400 p-2 text-center">1</td>
                                            <td className="border border-gray-400 p-2">Tên đề tài</td>
                                            <td className="border border-gray-400 p-2">{reviewData.comments?.topicName || ""}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-400 p-2 text-center">2</td>
                                            <td className="border border-gray-400 p-2">Mục tiêu</td>
                                            <td className="border border-gray-400 p-2">{reviewData.comments?.objectives || ""}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-400 p-2 text-center">3</td>
                                            <td className="border border-gray-400 p-2">Nội dung nghiên cứu</td>
                                            <td className="border border-gray-400 p-2">{reviewData.comments?.content || ""}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-400 p-2 text-center">4</td>
                                            <td className="border border-gray-400 p-2">
                                                Sản phẩm<br />
                                                <span className="text-xs italic">(sản phẩm khoa học, sản phẩm đào tạo, sản phẩm ứng dụng)</span>
                                            </td>
                                            <td className="border border-gray-400 p-2">{reviewData.comments?.products || ""}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-400 p-2 text-center">5</td>
                                            <td className="border border-gray-400 p-2">Kinh phí</td>
                                            <td className="border border-gray-400 p-2">{reviewData.comments?.budget || ""}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <p className="font-semibold">9. Ý kiến khác:</p>
                            <p className="ml-4 min-h-[60px] border-b border-dotted border-gray-400">
                                {reviewData.comments?.additionalNotes || ""}
                            </p>
                        </div>

                        {/* Signatures */}
                        <div className="grid grid-cols-2 mt-8">
                            <div className="text-center">
                                <p className="font-bold">Chủ tịch Hội đồng</p>
                                <p className="text-xs italic">(Ký, họ và tên)</p>
                                <div className="h-24"></div>
                            </div>
                            <div className="text-center">
                                <p className="font-bold">Thư ký</p>
                                <p className="text-xs italic">(Ký, họ và tên)</p>
                                <div className="h-24"></div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center mt-8">
                            <p className="font-bold uppercase text-lg">XÁC NHẬN CỦA TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

ReviewResult.displayName = "ReviewResult";
export default ReviewResult;