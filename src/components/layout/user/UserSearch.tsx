import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const recentSearches = [
  "Ứng dụng trí tuệ nhân tạo",
  "IoT trong nông nghiệp",
  "Phương pháp giảng dạy",
  "Năng lượng tái tạo",
];

const searchResults = [
  {
    id: "DT2023-042",
    title:
      "Nghiên cứu ứng dụng trí tuệ nhân tạo trong dự đoán sự cố hệ thống điện",
    status: "Đang thực hiện",
    leader: "TS. Nguyễn Văn A",
  },
  {
    id: "DT2022-031",
    title:
      "Ứng dụng trí tuệ nhân tạo trong nhận diện khuôn mặt cho hệ thống an ninh",
    status: "Đã hoàn thành",
    leader: "TS. Trần Thị B",
  },
  {
    id: "DT2021-018",
    title: "Nghiên cứu thuật toán học máy trong phân tích dữ liệu lớn",
    status: "Đã hoàn thành",
    leader: "PGS.TS. Lê Văn C",
  },
];

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDialog, setShowSearchDialog] = useState(false);

  const filteredResults = searchQuery
    ? searchResults.filter(
        (result) =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.leader.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      <div className="hidden md:flex relative w-40 lg:w-64">
        <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
          <DialogTrigger asChild>
            <div className="relative w-full">
              <Input
                placeholder="Tìm kiếm..."
                className="pl-8"
                readOnly
                onClick={() => setShowSearchDialog(true)}
              />
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tìm kiếm đề tài</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nhập từ khóa, mã đề tài, tên chủ nhiệm..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {searchQuery ? (
              <div className="mt-2 space-y-1">
                <h3 className="text-sm font-medium">Kết quả tìm kiếm</h3>
                {filteredResults.length > 0 ? (
                  <div className="max-h-[300px] overflow-auto">
                    {filteredResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-secondary rounded cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            {result.id}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              result.status === "Đang thực hiện"
                                ? "bg-blue-100 text-blue-800"
                                : result.status === "Chờ nghiệm thu"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {result.status}
                          </span>
                        </div>
                        <p className="font-medium text-sm my-1">
                          {result.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {result.leader}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    Không tìm thấy kết quả phù hợp.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-2 space-y-1">
                <h3 className="text-sm font-medium">Tìm kiếm gần đây</h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      className="px-3 py-1 bg-muted rounded-full text-xs cursor-pointer hover:bg-muted-foreground/20"
                      onClick={() => setSearchQuery(search)}
                    >
                      {search}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setShowSearchDialog(true)}
      >
        <Search className="h-5 w-5" />
      </Button>
    </>
  );
};

export default UserSearch;
