import React, { useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Department } from "@/models/department";
import { ResearchType } from "@/models/research-type";
import { ResearchField } from "@/models/research-field";
import { Category } from "@/models/category";
import { getAllStatuses, TopicStatus } from "@/models/enums/topic-status.enum";
import { formatVND, parseVND } from '@/utils/common';
import { formatDate } from '@/utils/dateTimeFormat';

interface TopicsFilterProps {
    onFilter: (filters: any) => void;
    onClearFilters: () => void;
    departments: Department[];
    researchTypes: ResearchType[];
    researchFields: ResearchField[];
    categories: Category[];
    status: TopicStatus | string;
    setStatus: (value: TopicStatus | string) => void;
    department: string;
    setDepartment: (value: string) => void;
    researchType: string;
    setResearchType: (value: string) => void;
    researchField: string;
    setResearchField: (value: string) => void;
    category: string;
    setCategory: (value: string) => void;
    startDate: Date | undefined;
    setStartDate: (value: Date | undefined) => void;
    endDate: Date | undefined;
    setEndDate: (value: Date | undefined) => void;
    budget: number | undefined;
    setBudget: (value: number | undefined) => void;
    budgetDisplay: string;
    setBudgetDisplay: (value: string) => void;
    investigator: string;
    setInvestigator: (value: string) => void;
}

const TopicsFilter: React.FC<TopicsFilterProps> = ({
    onFilter,
    onClearFilters,
    departments,
    researchTypes,
    researchFields,
    categories,
    status,
    setStatus,
    department,
    setDepartment,
    researchType,
    setResearchType,
    researchField,
    setResearchField,
    category,
    setCategory,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    budget,
    setBudget,
    budgetDisplay,
    setBudgetDisplay,
    investigator,
    setInvestigator,
}) => {

    const statuses = getAllStatuses();

    const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setBudgetDisplay(inputValue);
        const parsedValue = parseVND(inputValue);
        setBudget(parsedValue);
    };

    const handleBudgetBlur = () => {
        setBudgetDisplay(formatVND(budget));
    };

    const handleApplyFilter = () => {
        onFilter({
            status,
            department,
            researchType,
            researchField,
            category,
            startDate,
            endDate,
            budget,
            investigator,
        });
    };

    const clearStatus = useCallback(() => setStatus(''), [setStatus]);
    const clearDepartment = useCallback(() => setDepartment(''), [setDepartment]);
    const clearResearchType = useCallback(() => setResearchType(''), [setResearchType]);
    const clearResearchField = useCallback(() => setResearchField(''), [setResearchField]);
    const clearCategory = useCallback(() => setCategory(''), [setCategory]);
    const clearStartDate = useCallback(() => setStartDate(undefined), [setStartDate]);
    const clearEndDate = useCallback(() => setEndDate(undefined), [setEndDate]);
    const clearBudget = useCallback(() => {
        setBudget(undefined);
        setBudgetDisplay('');
    }, [setBudget, setBudgetDisplay]);
    const clearInvestigator = useCallback(() => setInvestigator(''), [setInvestigator]);

    return (
        <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Bộ lọc đề tài</h3>
                <Button variant="outline" size="sm" className='text-rose-500' onClick={onClearFilters}>
                    <X className="h-4 w-4" />
                    Xóa tất cả
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                    <div className="relative">
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="h-9 pr-8">
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                {statuses.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {status && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                onClick={clearStatus}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Khoa</label>
                    <div className="relative">
                        <Select value={department} onValueChange={setDepartment}>
                            <SelectTrigger className="h-9 pr-8">
                                <SelectValue placeholder="Chọn khoa" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={String(dept.id)}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {department && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                onClick={clearDepartment}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Loại nghiên cứu</label>
                    <div className="relative">
                        <Select value={researchType} onValueChange={setResearchType}>
                            <SelectTrigger className="h-9 pr-8">
                                <SelectValue placeholder="Chọn loại nghiên cứu" />
                            </SelectTrigger>
                            <SelectContent>
                                {researchTypes.map((type) => (
                                    <SelectItem key={type.id} value={String(type.id)}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {researchType && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                onClick={clearResearchType}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Lĩnh vực nghiên cứu</label>
                    <div className="relative">
                        <Select value={researchField} onValueChange={setResearchField}>
                            <SelectTrigger className="h-9 pr-8">
                                <SelectValue placeholder="Chọn lĩnh vực" />
                            </SelectTrigger>
                            <SelectContent>
                                {researchFields.map((field) => (
                                    <SelectItem key={field.id} value={String(field.id)}>
                                        {field.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {researchField && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                onClick={clearResearchField}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Danh mục</label>
                    <div className="relative">
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="h-9 pr-8">
                                <SelectValue placeholder="Chọn danh mục" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {category && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                onClick={clearCategory}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Từ ngày</label>
                    <div className="relative">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full h-9 justify-start text-left font-normal text-gray-700"
                                >
                                    <CalendarIcon className="h-4 w-4 " />
                                    {startDate ? formatDate(startDate) : <span>Chọn ngày</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    locale={vi}
                                />
                            </PopoverContent>
                        </Popover>
                        {startDate && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                onClick={clearStartDate}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Đến ngày</label>
                    <div className="relative">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full h-9 justify-start text-left font-normal text-gray-700"
                                >
                                    <CalendarIcon className="h-4 w-4 " />
                                    {endDate ? format(endDate, 'dd/MM/yyyy', { locale: vi }) : <span>Chọn ngày</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    locale={vi}
                                />
                            </PopoverContent>
                        </Popover>
                        {endDate && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                onClick={clearEndDate}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Kinh phí tối thiểu</label>
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Nhập kinh phí"
                            value={budgetDisplay}
                            onChange={handleBudgetChange}
                            onBlur={handleBudgetBlur}
                            className="h-9 pr-8"
                        />
                        {budgetDisplay && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                onClick={clearBudget}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Chủ nhiệm đề tài</label>
                    <div className="relative">
                        <Input
                            placeholder="Tên chủ nhiệm"
                            value={investigator}
                            onChange={(e) => setInvestigator(e.target.value)}
                            className="h-9 pr-8"
                        />
                        {investigator && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                onClick={clearInvestigator}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button onClick={handleApplyFilter} className="h-9">
                    <Check className="h-4 w-4 " />
                    Áp dụng
                </Button>
            </div>
        </div>
    );
};

export default TopicsFilter;