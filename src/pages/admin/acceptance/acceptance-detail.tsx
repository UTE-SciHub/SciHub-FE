import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  FileText,
  User,
  Building,
  CheckCircle,
  AlertCircle,
  CalendarIcon,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import type { Topic } from "@/models/topic";
import { AcceptanceService } from "@/service/acceptance-service";
import useUserStore from "@/store/userStore";
import { FormFileUploadPreview } from "@/components/file-upload-preview/file-upload-preview";
import Loading from "@/components/loading/loading";
import { getBadge } from "@/models/enums/topic-status.enum";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Document {
  id?: string;
  url?: string;
  description: string;
  originalFileName?: string;
  type?: string;
}

interface AcceptanceDetails {
  topic: Topic;
  submissionDate: string;
  completionReport?: Document[];
  bmDecision?: Document[];
  researchProducts?: Document[];
  supportingDocuments?: Document[];
  applicationCertificates?: Document[];
  additionalDocuments?: Document[];
  notes?: string;
  acknowledgment: boolean;
  isFinal: boolean;
}

export default function AcceptanceDetail() {
  const navigate = useNavigate();
  const { acceptanceId } = useParams<{ acceptanceId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [acceptanceDetails, setAcceptanceDetails] = useState<AcceptanceDetails | null>(null);
  const user = useUserStore((state) => state.user);

  // State for dialogs
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [decisionFile, setDecisionFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    if (acceptanceId) {
      fetchAcceptanceDetails(acceptanceId);
    }
  }, [acceptanceId]);

  const fetchAcceptanceDetails = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await AcceptanceService.getAcceptanceById(id);
      if (response.data.code === 1000 && response.data.data) {
        const rawData = response.data.data;
        const documents = rawData.documents || [];

        const categorizedDocuments: AcceptanceDetails = {
          topic: rawData.topic,
          submissionDate: rawData.submissionDate,
          notes: rawData.notes,
          acknowledgment: rawData.acknowledgment,
          isFinal: rawData.isFinal || false,
          completionReport: documents
            .filter((doc: any) => doc.documentType === "Báo cáo tổng kết")
            .map((doc: any) => ({
              id: doc.id,
              url: doc.filePath,
              description: doc.documentType,
              originalFileName: doc.originalFileName,
              type: doc.documentType,
            })),
          bmDecision: documents
            .filter((doc: any) => doc.documentType === "Quyết định BM.24-QT.01-KHCN")
            .map((doc: any) => ({
              id: doc.id,
              url: doc.filePath,
              description: doc.documentType,
              originalFileName: doc.originalFileName,
              type: doc.documentType,
            })),
          researchProducts: documents
            .filter((doc: any) => doc.documentType === "Sản phẩm nghiên cứu")
            .map((doc: any) => ({
              id: doc.id,
              url: doc.filePath,
              description: doc.documentType,
              originalFileName: doc.originalFileName,
              type: doc.documentType,
            })),
          supportingDocuments: documents
            .filter((doc: any) => doc.documentType === "Tài liệu liên quan đến sản phẩm")
            .map((doc: any) => ({
              id: doc.id,
              url: doc.filePath,
              description: doc.documentType,
              originalFileName: doc.originalFileName,
              type: doc.documentType,
            })),
          applicationCertificates: documents
            .filter((doc: any) => doc.documentType === "Chứng nhận ứng dụng")
            .map((doc: any) => ({
              id: doc.id,
              url: doc.filePath,
              description: doc.documentType,
              originalFileName: doc.originalFileName,
              type: doc.documentType,
            })),
          additionalDocuments: documents
            .filter((doc: any) => doc.documentType === "Văn bản bổ sung khác")
            .map((doc: any) => ({
              id: doc.id,
              url: doc.filePath,
              description: doc.documentType,
              originalFileName: doc.originalFileName,
              type: doc.documentType,
            })),
        };

        setAcceptanceDetails(categorizedDocuments);
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể tải chi tiết nghiệm thu",
          variant: "error",
        });
        navigate(-1);
      }
    } catch (error) {
      console.error("Error fetching acceptance details:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải chi tiết nghiệm thu. Vui lòng thử lại.",
        variant: "error",
      });
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !acceptanceDetails) {
    return <Loading onCancel={() => navigate(-1)} />;
  }

  const { topic, submissionDate, completionReport, bmDecision, researchProducts, supportingDocuments, additionalDocuments, notes, acknowledgment, isFinal } = acceptanceDetails;

  const handleApprove = async () => {
    if (!decisionFile) {
      setFileError("Vui lòng tải lên file quyết định.");
      return;
    }
    setFileError(null);
    setIsApproving(true);
    try {
      const response = await AcceptanceService.approveAcceptance(acceptanceId!, decisionFile);
      if (response.data.code === 1000) {
        toast({
          title: "Thành công",
          description: "Hồ sơ đã được xác nhận nghiệm thu.",
          variant: "success",
        });
        setIsApproveDialogOpen(false);
        navigate(-1);
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể xác nhận nghiệm thu. Vui lòng thử lại.",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error approving acceptance:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xác nhận nghiệm thu. Vui lòng thử lại.",
        variant: "error",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do từ chối.",
        variant: "error",
      });
      return;
    }
    setIsRejecting(true);
    try {
      const response = await AcceptanceService.rejectAcceptance(acceptanceId!, rejectReason);
      if (response.data.code === 1000) {
        toast({
          title: "Thành công",
          description: "Hồ sơ đã bị từ chối.",
          variant: "success",
        });
        setIsRejectDialogOpen(false);
        navigate(-1);
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể từ chối hồ sơ. Vui lòng thử lại.",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error rejecting acceptance:", error);
      toast({
        title: "Lỗi",
        description: "Không thể từ chối hồ sơ. Vui lòng thử lại.",
        variant: "error",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const handleFileChange = (file: File | null) => {
    setDecisionFile(file);
    if (file) {
      setFileError(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chi tiết hồ sơ nghiệm thu</h1>
          <p className="text-gray-600">Xem thông tin chi tiết hồ sơ nghiệm thu đề tài nghiên cứu khoa học</p>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                disabled={!isFinal}
                className={!isFinal ? "cursor-not-allowed opacity-50" : ""}
              >
                <CheckCircle className="h-4 w-4" />
                Xác nhận nghiệm thu
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Xác nhận nghiệm thu</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="decisionFile" className="text-sm font-medium">
                    File quyết định <span className="text-red-600">*</span>
                  </Label>
                  <FormFileUploadPreview
                    field={{ value: decisionFile ? URL.createObjectURL(decisionFile) : "", onChange: handleFileChange }}
                    fieldState={{ invalid: !!fileError, isTouched: true, isDirty: true, error: fileError }}
                    accept=".pdf,.doc,.docx"
                    maxSize={20}
                    placeholder="Tải lên file quyết định"
                    onFileChange={(file) => handleFileChange(file)}
                    height={400}
                    disabled={false}
                    displayName={decisionFile ? decisionFile.name : "Chưa có file"}
                  />
                  {fileError && <p className="text-sm text-red-600">{fileError}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)} disabled={isApproving}>
                  Hủy
                </Button>
                <Button onClick={handleApprove} disabled={isApproving}>
                  {isApproving ? (
                    <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>Đang xác nhận...</span>
                  ) : (
                    "Xác nhận"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={!isFinal}
                className={!isFinal ? "cursor-not-allowed opacity-50" : ""}
              >
                <XCircle className="h-4 w-4" />
                Từ chối hồ sơ
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Từ chối hồ sơ</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="rejectReason" className="text-sm font-medium">
                    Lý do từ chối <span className="text-red-600">*</span>
                  </Label>
                  <Textarea
                    id="rejectReason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Nhập lý do từ chối..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={isRejecting}>
                  Hủy
                </Button>
                <Button variant="destructive" onClick={handleReject} disabled={isRejecting}>
                  {isRejecting ? (
                    <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>Đang từ chối...</span>
                  ) : (
                    "Từ chối"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Thông tin đề tài
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-600">Chủ nhiệm đề tài</p>
                  <p className="font-semibold">{topic.principalInvestigator || 'Không có thông tin'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-600">Đơn vị</p>
                  <p className="font-semibold">{topic.department?.name || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-600">Thời gian thực hiện</p>
                  <p className="font-semibold">{topic.durationInMonths} tháng</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-600">Trạng thái</p>
                  <Badge className="bg-green-100 text-green-800">{getBadge(topic.status) || 'Đang thực hiện'}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-600">Ngày nộp</p>
                  <p className="font-semibold">{new Date(submissionDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-600" />
            Hồ sơ bắt buộc
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Lưu ý:</strong> Tất cả các tài liệu bắt buộc đã được ký và đóng dấu trước khi tải lên hệ thống.
            </AlertDescription>
          </Alert>

          <div>
            <h3 className="text-red-600 font-medium mb-2">1. Đơn đề nghị nghiệm thu</h3>
            <Alert className="border-blue-200 bg-blue-50 mb-4">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Hướng dẫn:</strong> Đơn đề nghị nghiệm thu là văn bản chính thức xác nhận việc hoàn thành đề tài.
              </AlertDescription>
            </Alert>
            {bmDecision && bmDecision.length > 0 ? (
              bmDecision.map((doc, index) => (
                <div key={doc.id || index} className="mb-4">
                  <FormFileUploadPreview
                    field={{ value: doc.url, onChange: () => { } }}
                    fieldState={{ invalid: false, isTouched: false, isDirty: false, error: undefined }}
                    accept=".pdf,.doc,.docx"
                    maxSize={20}
                    placeholder="Đơn đề nghị nghiệm thu"
                    onFileChange={() => { }}
                    existingFile={doc.url}
                    height={800}
                    disabled={true}
                    displayName={doc.originalFileName || doc.description}
                  />
                  <p className="text-sm text-gray-500 mt-2">{doc.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Không có đơn đề nghị nghiệm thu</p>
            )}
          </div>

          <div>
            <h3 className="text-red-600 font-medium mb-2">2. Báo cáo tổng kết đề tài (05 cuốn)</h3>
            {completionReport && completionReport.length > 0 ? (
              completionReport.map((doc, index) => (
                <div key={doc.id || index} className="mb-4">
                  <FormFileUploadPreview
                    field={{ value: doc.url, onChange: () => { } }}
                    fieldState={{ invalid: false, isTouched: false, isDirty: false, error: undefined }}
                    accept=".pdf,.doc,.docx"
                    maxSize={10}
                    placeholder="Báo cáo tổng kết đề tài"
                    onFileChange={() => { }}
                    existingFile={doc.url}
                    height={800}
                    disabled={true}
                    displayName={doc.originalFileName || doc.description}
                  />
                  <p className="text-sm text-gray-500 mt-2">{doc.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Không có báo cáo tổng kết</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hồ sơ bổ sung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">3. Các sản phẩm của đề tài</h3>
            {researchProducts && researchProducts.length > 0 ? (
              researchProducts.map((doc, index) => (
                <div key={doc.id || index} className="mb-4">
                  <FormFileUploadPreview
                    field={{ value: doc.url, onChange: () => { } }}
                    fieldState={{ invalid: false, isTouched: false, isDirty: false, error: undefined }}
                    accept=".pdf,.doc,.docx,.zip,.rar"
                    maxSize={10}
                    placeholder="Sản phẩm đề tài"
                    onFileChange={() => { }}
                    existingFile={doc.url}
                    height={800}
                    disabled={true}
                    displayName={doc.originalFileName || doc.description}
                  />
                  <p className="text-sm text-gray-500 mt-2">{doc.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Không có sản phẩm đề tài</p>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">4. Tài liệu liên quan đến sản phẩm</h3>
            {supportingDocuments && supportingDocuments.length > 0 ? (
              supportingDocuments.map((doc, index) => (
                <div key={doc.id || index} className="mb-4">
                  <FormFileUploadPreview
                    field={{ value: doc.url, onChange: () => { } }}
                    fieldState={{ invalid: false, isTouched: false, isDirty: false, error: undefined }}
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    maxSize={10}
                    placeholder="Tài liệu liên quan đến sản phẩm"
                    onFileChange={() => { }}
                    existingFile={doc.url}
                    height={800}
                    disabled={true}
                    displayName={doc.originalFileName || doc.description}
                  />
                  <p className="text-sm text-gray-500 mt-2">{doc.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Không có tài liệu liên quan</p>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">5. Văn bản bổ sung khác</h3>
            {additionalDocuments && additionalDocuments.length > 0 ? (
              additionalDocuments.map((doc, index) => (
                <div key={doc.id || index} className="mb-4">
                  <FormFileUploadPreview
                    field={{ value: doc.url, onChange: () => { } }}
                    fieldState={{ invalid: false, isTouched: false, isDirty: false, error: undefined }}
                    accept=".pdf,.doc,.docx"
                    maxSize={10}
                    placeholder="Văn bản bổ sung khác"
                    onFileChange={() => { }}
                    existingFile={doc.url}
                    height={800}
                    disabled={true}
                    displayName={doc.originalFileName || doc.description}
                  />
                  <p className="text-sm text-gray-500 mt-2">{doc.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Không có văn bản bổ sung</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ghi chú và xác nhận</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Ghi chú bổ sung</h3>
            <p className="text-gray-600 min-h-[120px] p-3 border border-gray-200 rounded-lg">
              {notes || 'Không có ghi chú bổ sung'}
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Xác nhận</h3>
            <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-1" />
              <div className="text-sm text-blue-800 leading-relaxed">
                <strong>Đã xác nhận:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Tất cả thông tin và tài liệu được cung cấp là chính xác và đầy đủ</li>
                  <li>Các tài liệu đã được ký và đóng dấu theo quy định</li>
                  <li>Đề tài đã hoàn thành đúng theo kế hoạch và thuyết minh được phê duyệt</li>
                  <li>Người nộp chịu trách nhiệm về tính chính xác của hồ sơ này</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}