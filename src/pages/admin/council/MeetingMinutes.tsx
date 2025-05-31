import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import CouncilMeetingMinutes from "@/pages/admin/council/CouncilMeetingMinutes";

const MeetingMinutesPage = () => {
    // Example data
    const exampleData = {
        topicName: "Nghiên cứu và phát triển hệ thống quản lý đề tài nghiên cứu khoa học",
        principalInvestigator: "Nguyễn Văn A",
        councilDecisionNumber: "123/QĐ-ĐHSPKT ngày 15/01/2025",
        meetingDate: "20/05/2025",
        meetingLocation: "Phòng họp A1-103, Trường ĐHSPKT",
        totalMembers: 7,
        presentMembers: 6,
        absentMembers: 1,
        guests: "Ông Phạm Văn B - Đại diện Phòng KHCN",
        initialAverageScore: 75.5,
        qualifiedVotes: 6,
        unqualifiedVotes: 0,
        qualifiedTotal: 450,
        finalAverageScore: 75.0,
        councilConclusions: "Hội đồng thống nhất phê duyệt đề tài và đề xuất chủ nhiệm đề tài với số điểm đánh giá cao.",
        chairmanName: "PGS.TS. Trần Văn C",
        secretaryName: "ThS. Lê Thị D"
    };

    return (
        <div className="">
            <Card>
                <CardContent className="p-6">
                    <CouncilMeetingMinutes {...exampleData} />
                </CardContent>
            </Card>
        </div>
    );
};

export default MeetingMinutesPage;