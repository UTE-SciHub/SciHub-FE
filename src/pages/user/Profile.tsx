import { useState } from "react"
import {
    User,
    Pencil,
    Mail,
    Phone,
    Building,
    MapPin,
    Calendar,
    CreditCard,
    DollarSign,
    Tag,
    FileText,
    AtSign,
    Plus,
    Briefcase,
    GraduationCap,
    Award,
} from "lucide-react"
import ProfileEditModal from "./ProfileModal"

export interface ProfileData {
    name: string
    title: string
    level: string
    avatar: string
    academicTitle: string
    academicTitleYear: string
    academicDegree: string
    academicDegreeYear: string
    department: string
    laboratory: string
    position: string
    researchDirections: string[]
    contactInfo: {
        email: {
            organization: string
            personal: string
        }
        phone: {
            organization: string
            personal: string
        }
        address: {
            organization: string
            personal: string
        }
        workplace: string
        orcid: string
    }
    basicInfo: {
        gender: string
        birthDate: string
        idNumber: string
        issueDate: string
        issuePlace: string
    }
    financialInfo: {
        taxId: string
        accountNumber: string
        bank: string
        bankBranch: string
    }
}

const ProfilePage: React.FC = () => {
    const [profileData, setProfileData] = useState<ProfileData>({
        name: "tuan lethanh",
        title: "Nhà khoa học",
        level: "Đại học",
        avatar: "",
        academicTitle: "",
        academicTitleYear: "",
        academicDegree: "Đại học",
        academicDegreeYear: "",
        department: "",
        laboratory: "",
        position: "",
        researchDirections: [],
        contactInfo: {
            email: {
                organization: "",
                personal: "thanhtuanle0209@gmail.com",
            },
            phone: {
                organization: "",
                personal: "",
            },
            address: {
                organization: "Trường Đại học Công nghệ Thông tin",
                personal: "",
            },
            workplace: "Trường Đại học Công nghệ Thông tin",
            orcid: "",
        },
        basicInfo: {
            gender: "",
            birthDate: "",
            idNumber: "",
            issueDate: "",
            issuePlace: "",
        },
        financialInfo: {
            taxId: "",
            accountNumber: "",
            bank: "",
            bankBranch: "",
        },
    })

    const [activeTab, setActiveTab] = useState("information")
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const handleEditProfile = () => {
        setIsEditModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsEditModalOpen(false)
    }

    const handleUpdateProfile = (updatedData: ProfileData) => {
        setProfileData(updatedData)
        setIsEditModalOpen(false)
    }

    return (
        <>
            <div className="p-4 bg-white rounded-xl shadow-sm">
                {/* Header section with profile info and avatar */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 border-b border-gray-100">
                    <div className="relative group">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:opacity-90">
                            {profileData.avatar ? (
                                <img
                                    src={profileData.avatar || "/placeholder.svg"}
                                    alt={profileData.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User size={64} className="text-gray-400" />
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-[#0056a6] text-white p-1.5 rounded-full cursor-pointer shadow-md hover:bg-[#00417e] transition-colors">
                            <Pencil size={16} />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-opacity-20 transition-all duration-300">
                            <span className="text-white text-xs font-medium">Thay đổi ảnh</span>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 capitalize">{profileData.name}</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[#0056a6] bg-blue-50 px-3 py-1 rounded-full text-sm font-medium">
                                    {profileData.title}
                                </span>
                            </div>
                        </div>
                        <div className="mt-1 text-[#00b8d4] font-medium">{profileData.level}</div>

                        <div className="mt-4 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleEditProfile}
                                className="flex items-center gap-2 bg-[#00b8d4] hover:bg-[#00a0b8] text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <Pencil size={16} />
                                Chỉnh sửa thông tin
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 overflow-x-auto">
                        <button
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === "information"
                                ? "border-[#0056a6] text-[#0056a6]"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            onClick={() => setActiveTab("information")}
                        >
                            <User size={18} />
                            Thông tin
                        </button>
                        <button
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === "projects"
                                ? "border-[#0056a6] text-[#0056a6]"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            onClick={() => setActiveTab("projects")}
                        >
                            <FileText size={18} />
                            Đề tài nghiên cứu
                        </button>
                        <button
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === "publications"
                                ? "border-[#0056a6] text-[#0056a6]"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            onClick={() => setActiveTab("publications")}
                        >
                            <FileText size={18} />
                            Công bố khoa học
                        </button>
                    </nav>
                </div>

                {/* Content */}
                {activeTab === "information" && (
                    <div className="py-6 px-4">
                        {/* Academic Information */}
                        <div className="mb-8 bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <GraduationCap size={18} className="text-[#0056a6]" />
                                Thông tin học thuật
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Học hàm:</div>
                                    <div className="flex items-center gap-2">
                                        <Award size={16} className="text-gray-400" />
                                        <span>{profileData.academicTitle || "Chưa cập nhật"}</span>
                                        {profileData.academicTitleYear && (
                                            <span className="text-sm text-gray-500">({profileData.academicTitleYear})</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Học vị:</div>
                                    <div className="flex items-center gap-2">
                                        <GraduationCap size={16} className="text-gray-400" />
                                        <span>{profileData.academicDegree}</span>
                                        {profileData.academicDegreeYear && (
                                            <span className="text-sm text-gray-500">({profileData.academicDegreeYear})</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Bộ môn:</div>
                                    <div className="flex items-center gap-2">
                                        <Briefcase size={16} className="text-gray-400" />
                                        <span>{profileData.department || "Chưa cập nhật"}</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Phòng thí nghiệm:</div>
                                    <div className="flex items-center gap-2">
                                        <Building size={16} className="text-gray-400" />
                                        <span>{profileData.laboratory || "Chưa cập nhật"}</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Chức vụ:</div>
                                    <div className="flex items-center gap-2">
                                        <Briefcase size={16} className="text-gray-400" />
                                        <span>{profileData.position || "Chưa cập nhật"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Research Directions */}
                        <div className="mb-8 bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <FileText size={18} className="text-[#0056a6]" />
                                Các hướng nghiên cứu
                            </h3>

                            {profileData.researchDirections && profileData.researchDirections.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16"
                                                >
                                                    TT
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Hướng nghiên cứu
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {profileData.researchDirections.map((direction, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{direction}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    <p>Chưa có hướng nghiên cứu nào được thêm</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Contact Information */}
                            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Mail size={18} className="text-[#0056a6]" />
                                    Thông tin liên lạc
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Email cá nhân:</div>
                                        <div className="flex items-center gap-2">
                                            <Mail size={16} className="text-gray-400" />
                                            <a
                                                href={`mailto:${profileData.contactInfo.email.personal}`}
                                                className="text-[#0056a6] hover:underline"
                                            >
                                                {profileData.contactInfo.email.personal || "Chưa cập nhật"}
                                            </a>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Email cơ quan:</div>
                                        <div className="flex items-center gap-2">
                                            <Mail size={16} className="text-gray-400" />
                                            <a
                                                href={`mailto:${profileData.contactInfo.email.organization}`}
                                                className="text-[#0056a6] hover:underline"
                                            >
                                                {profileData.contactInfo.email.organization || "Chưa cập nhật"}
                                            </a>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Điện thoại cá nhân:</div>
                                        <div className="flex items-center gap-2">
                                            <Phone size={16} className="text-gray-400" />
                                            <span>{profileData.contactInfo.phone.personal || "Chưa cập nhật"}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Điện thoại cơ quan:</div>
                                        <div className="flex items-center gap-2">
                                            <Phone size={16} className="text-gray-400" />
                                            <span>{profileData.contactInfo.phone.organization || "Chưa cập nhật"}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Địa chỉ cá nhân:</div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-400" />
                                            <span>{profileData.contactInfo.address.personal || "Chưa cập nhật"}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Địa chỉ cơ quan:</div>
                                        <div className="flex items-center gap-2">
                                            <Building size={16} className="text-gray-400" />
                                            <span>{profileData.contactInfo.address.organization || "Chưa cập nhật"}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Mã ORCID:</div>
                                        <div className="flex items-center gap-2">
                                            <AtSign size={16} className="text-gray-400" />
                                            <span>{profileData.contactInfo.orcid || "Chưa cập nhật"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Basic Information */}
                            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <User size={18} className="text-[#0056a6]" />
                                    Thông tin cơ bản
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Giới tính:</div>
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-gray-400" />
                                            <span>{profileData.basicInfo.gender || "Chưa cập nhật"}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Ngày sinh:</div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-400" />
                                            <span>{profileData.basicInfo.birthDate || "Chưa cập nhật"}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Số CCCD:</div>
                                        <div className="flex items-center gap-2">
                                            <CreditCard size={16} className="text-gray-400" />
                                            <span>{profileData.basicInfo.idNumber || "Chưa cập nhật"}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Ngày cấp:</div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-400" />
                                            <span>{profileData.basicInfo.issueDate || "Chưa cập nhật"}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Nơi cấp:</div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-400" />
                                            <span>{profileData.basicInfo.issuePlace || "Chưa cập nhật"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Information */}
                            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <DollarSign size={18} className="text-[#0056a6]" />
                                    Thông tin tài chính
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Mã số thuế cá nhân:</div>
                                        <div className="flex items-center gap-2">
                                            <Tag size={16} className="text-gray-400" />
                                            <span>{profileData.financialInfo.taxId || "Chưa cập nhật"}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Số tài khoản:</div>
                                        <div className="flex items-center gap-2">
                                            <CreditCard size={16} className="text-gray-400" />
                                            <span>{profileData.financialInfo.accountNumber || "Chưa cập nhật"}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Tại ngân hàng:</div>
                                        <div className="flex items-center gap-2">
                                            <Building size={16} className="text-gray-400" />
                                            <span>{profileData.financialInfo.bank || "Chưa cập nhật"}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Chi nhánh ngân hàng:</div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-400" />
                                            <span>{profileData.financialInfo.bankBranch || "Chưa cập nhật"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "projects" && (
                    <div className="py-8 px-4 text-center text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium mb-2">Chưa có đề tài nghiên cứu</h3>
                        <p>Các đề tài nghiên cứu của bạn sẽ hiển thị ở đây</p>
                        <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0056a6] hover:bg-[#004080] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0056a6]">
                            <Plus className="mr-2 h-4 w-4" /> Thêm đề tài nghiên cứu
                        </button>
                    </div>
                )}

                {activeTab === "publications" && (
                    <div className="py-8 px-4 text-center text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium mb-2">Chưa có công bố khoa học</h3>
                        <p>Các công bố khoa học của bạn sẽ hiển thị ở đây</p>
                        <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0056a6] hover:bg-[#004080] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0056a6]">
                            <Plus className="mr-2 h-4 w-4" /> Thêm công bố khoa học
                        </button>
                    </div>
                )}
            </div>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <ProfileEditModal profileData={profileData} onClose={handleCloseModal} onSave={handleUpdateProfile} />
            )}
        </>
    )
}

export default ProfilePage
