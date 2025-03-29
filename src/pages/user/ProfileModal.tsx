import { useState } from "react"
import { X, Calendar, Plus, Trash2 } from "lucide-react"
import type { ProfileData } from "./Profile"

interface ProfileEditModalProps {
    profileData: ProfileData
    onClose: () => void
    onSave: (updatedData: ProfileData) => void
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ profileData, onClose, onSave }) => {
    const [formData, setFormData] = useState<ProfileData>({ ...profileData })
    const [activeTab, setActiveTab] = useState("basic")
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [researchDirectionInput, setResearchDirectionInput] = useState("")

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
        section?: string,
        subsection?: string,
    ) => {
        const { name, value } = e.target

        if (section && subsection) {
            setFormData({
                ...formData,
                [section]: {
                    ...formData[section as keyof ProfileData],
                    [subsection]: {
                        ...(formData[section as keyof ProfileData] as any)[subsection],
                        [name]: value,
                    },
                },
            })
        } else if (section) {
            setFormData({
                ...formData,
                [section]: {
                    ...formData[section as keyof ProfileData],
                    [name]: value,
                },
            })
        } else {
            setFormData({
                ...formData,
                [name]: value,
            })
        }

        // Clear error when user types
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: "",
            })
        }
    }

    const handleAddResearchDirection = () => {
        if (researchDirectionInput.trim()) {
            setFormData({
                ...formData,
                researchDirections: [...formData.researchDirections, researchDirectionInput.trim()],
            })
            setResearchDirectionInput("")
        }
    }

    const handleRemoveResearchDirection = (index: number) => {
        const updatedDirections = [...formData.researchDirections]
        updatedDirections.splice(index, 1)
        setFormData({
            ...formData,
            researchDirections: updatedDirections,
        })
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        // Required fields validation
        if (!formData.name) {
            newErrors.name = "Họ và tên là bắt buộc"
        }

        if (!formData.academicDegree) {
            newErrors.academicDegree = "Học vị là bắt buộc"
        }

        if (!formData.basicInfo.idNumber) {
            newErrors.idNumber = "Số CCCD là bắt buộc"
        }

        if (!formData.basicInfo.issueDate) {
            newErrors.issueDate = "Ngày cấp là bắt buộc"
        }

        if (!formData.basicInfo.issuePlace) {
            newErrors.issuePlace = "Nơi cấp là bắt buộc"
        }

        if (!formData.financialInfo.taxId) {
            newErrors.taxId = "Mã số thuế cá nhân là bắt buộc"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (validateForm()) {
            onSave(formData)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Chỉnh sửa thông tin</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex border-b">
                    <button
                        className={`px-4 py-3 font-medium text-sm ${activeTab === "basic"
                            ? "border-b-2 border-[#0056a6] text-[#0056a6]"
                            : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab("basic")}
                    >
                        Thông tin cơ bản
                    </button>
                    <button
                        className={`px-4 py-3 font-medium text-sm ${activeTab === "academic"
                            ? "border-b-2 border-[#0056a6] text-[#0056a6]"
                            : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab("academic")}
                    >
                        Thông tin học thuật
                    </button>
                    <button
                        className={`px-4 py-3 font-medium text-sm ${activeTab === "contact"
                            ? "border-b-2 border-[#0056a6] text-[#0056a6]"
                            : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab("contact")}
                    >
                        Thông tin liên lạc
                    </button>
                    <button
                        className={`px-4 py-3 font-medium text-sm ${activeTab === "financial"
                            ? "border-b-2 border-[#0056a6] text-[#0056a6]"
                            : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab("financial")}
                    >
                        Thông tin tài chính
                    </button>
                    <button
                        className={`px-4 py-3 font-medium text-sm ${activeTab === "research"
                            ? "border-b-2 border-[#0056a6] text-[#0056a6]"
                            : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab("research")}
                    >
                        Hướng nghiên cứu
                    </button>
                </div>

                <div className="overflow-y-auto p-6 flex-1">
                    <form onSubmit={handleSubmit}>
                        {/* Basic Information Tab */}
                        {activeTab === "basic" && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Họ và tên (Đầy đủ và đúng theo giấy tờ để làm hợp đồng) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange(e)}
                                            className={`w-full px-3 py-2 border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]`}
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                                        <select
                                            name="gender"
                                            value={formData.basicInfo.gender}
                                            onChange={(e) => handleInputChange(e, "basicInfo")}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]"
                                        >
                                            <option value="">Chọn giới tính</option>
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                            <option value="Khác">Khác</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                name="birthDate"
                                                value={formData.basicInfo.birthDate}
                                                onChange={(e) => handleInputChange(e, "basicInfo")}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <Calendar size={18} className="text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Số CCCD <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="idNumber"
                                            value={formData.basicInfo.idNumber}
                                            onChange={(e) => handleInputChange(e, "basicInfo")}
                                            className={`w-full px-3 py-2 border ${errors.idNumber ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]`}
                                        />
                                        {errors.idNumber && <p className="mt-1 text-sm text-red-500">{errors.idNumber}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ngày cấp <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                name="issueDate"
                                                value={formData.basicInfo.issueDate}
                                                onChange={(e) => handleInputChange(e, "basicInfo")}
                                                className={`w-full px-3 py-2 border ${errors.issueDate ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]`}
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <Calendar size={18} className="text-gray-400" />
                                            </div>
                                        </div>
                                        {errors.issueDate && <p className="mt-1 text-sm text-red-500">{errors.issueDate}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nơi cấp <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="issuePlace"
                                        value={formData.basicInfo.issuePlace}
                                        onChange={(e) => handleInputChange(e, "basicInfo")}
                                        className={`w-full px-3 py-2 border ${errors.issuePlace ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]`}
                                    />
                                    {errors.issuePlace && <p className="mt-1 text-sm text-red-500">{errors.issuePlace}</p>}
                                </div>
                            </div>
                        )}

                        {/* Academic Information Tab */}
                        {activeTab === "academic" && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Học hàm</label>
                                        <select
                                            name="academicTitle"
                                            value={formData.academicTitle}
                                            onChange={(e) => handleInputChange(e)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]"
                                        >
                                            <option value="">Chọn học hàm</option>
                                            <option value="Giáo sư">Giáo sư</option>
                                            <option value="Phó Giáo sư">Phó Giáo sư</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Năm phong</label>
                                        <input
                                            type="text"
                                            name="academicTitleYear"
                                            value={formData.academicTitleYear}
                                            onChange={(e) => handleInputChange(e)}
                                            placeholder="Ví dụ: 2020"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Học vị <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="academicDegree"
                                            value={formData.academicDegree}
                                            onChange={(e) => handleInputChange(e)}
                                            className={`w-full px-3 py-2 border ${errors.academicDegree ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]`}
                                        >
                                            <option value="">Chọn học vị</option>
                                            <option value="Tiến sĩ">Tiến sĩ</option>
                                            <option value="Thạc sĩ">Thạc sĩ</option>
                                            <option value="Đại học">Đại học</option>
                                        </select>
                                        {errors.academicDegree && <p className="mt-1 text-sm text-red-500">{errors.academicDegree}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Năm đạt</label>
                                        <input
                                            type="text"
                                            name="academicDegreeYear"
                                            value={formData.academicDegreeYear}
                                            onChange={(e) => handleInputChange(e)}
                                            placeholder="Ví dụ: 2018"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bộ môn</label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={(e) => handleInputChange(e)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phòng thí nghiệm</label>
                                    <input
                                        type="text"
                                        name="laboratory"
                                        value={formData.laboratory}
                                        onChange={(e) => handleInputChange(e)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                                    <input
                                        type="text"
                                        name="position"
                                        value={formData.position}
                                        onChange={(e) => handleInputChange(e)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Contact Information Tab */}
                        {activeTab === "contact" && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Thông tin liên lạc</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email cá nhân</label>
                                        <input
                                            type="email"
                                            name="personal"
                                            value={formData.contactInfo.email.personal}
                                            onChange={(e) => handleInputChange(e, "contactInfo", "email")}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email cơ quan</label>
                                        <input
                                            type="email"
                                            name="organization"
                                            value={formData.contactInfo.email.organization}
                                            onChange={(e) => handleInputChange(e, "contactInfo", "email")}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại cá nhân</label>
                                        <input
                                            type="tel"
                                            name="personal"
                                            value={formData.contactInfo.phone.personal}
                                            onChange={(e) => handleInputChange(e, "contactInfo", "phone")}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại cơ quan</label>
                                        <input
                                            type="tel"
                                            name="organization"
                                            value={formData.contactInfo.phone.organization}
                                            onChange={(e) => handleInputChange(e, "contactInfo", "phone")}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cá nhân</label>
                                    <input
                                        type="text"
                                        name="personal"
                                        value={formData.contactInfo.address.personal}
                                        onChange={(e) => handleInputChange(e, "contactInfo", "address")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cơ quan</label>
                                    <input
                                        type="text"
                                        name="organization"
                                        value={formData.contactInfo.address.organization}
                                        onChange={(e) => handleInputChange(e, "contactInfo", "address")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã ORCID</label>
                                    <input
                                        type="text"
                                        name="orcid"
                                        value={formData.contactInfo.orcid}
                                        onChange={(e) => handleInputChange(e, "contactInfo")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Financial Information Tab */}
                        {activeTab === "financial" && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mã số thuế cá nhân <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="taxId"
                                        value={formData.financialInfo.taxId}
                                        onChange={(e) => handleInputChange(e, "financialInfo")}
                                        className={`w-full px-3 py-2 border ${errors.taxId ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]`}
                                    />
                                    {errors.taxId && <p className="mt-1 text-sm text-red-500">{errors.taxId}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={formData.financialInfo.accountNumber}
                                        onChange={(e) => handleInputChange(e, "financialInfo")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tại ngân hàng</label>
                                    <input
                                        type="text"
                                        name="bank"
                                        value={formData.financialInfo.bank}
                                        onChange={(e) => handleInputChange(e, "financialInfo")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Chi nhánh ngân hàng</label>
                                    <input
                                        type="text"
                                        name="bankBranch"
                                        value={formData.financialInfo.bankBranch}
                                        onChange={(e) => handleInputChange(e, "financialInfo")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Research Directions Tab */}
                        {activeTab === "research" && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Các hướng nghiên cứu</h3>

                                <div className="space-y-4">
                                    {formData.researchDirections.length > 0 ? (
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
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24"
                                                        >
                                                            Thao tác
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {formData.researchDirections.map((direction, index) => (
                                                        <tr key={index}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-900">{direction}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveResearchDirection(index)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-gray-500 border border-dashed border-gray-300 rounded-md">
                                            <p>Chưa có hướng nghiên cứu nào được thêm</p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={researchDirectionInput}
                                            onChange={(e) => setResearchDirectionInput(e.target.value)}
                                            placeholder="Nhập hướng nghiên cứu mới"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056a6]"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddResearchDirection}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0056a6] hover:bg-[#004080] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0056a6]"
                                        >
                                            <Plus size={18} className="mr-1" /> Thêm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <div className="flex justify-end gap-3 p-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0056a6]"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0056a6] hover:bg-[#004080] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0056a6]"
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProfileEditModal