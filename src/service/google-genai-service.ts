import { GoogleGenAI } from "@google/genai";

export interface ChatResponse {
    text: string;
}

export class GoogleGenAIService {
    private static readonly GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    private static ai: GoogleGenAI | undefined;
    private static readonly DOCUMENT_PATH = "/form/QT.01- KHCN_Quản lý và thực hiện đề tài cấp trường.pdf";
    private static readonly MODEL = "gemini-2.0-flash";

    private static buildPrompt(userQuestion: string): string {
        return `
            Bạn là một trợ lý AI thông minh, chuyên phân tích và trả lời dựa trên nội dung của tài liệu PDF đính kèm. Tài liệu này là quy trình quản lý và thực hiện đề tài cấp trường tại một cơ sở giáo dục. Nhiệm vụ của bạn là đọc, hiểu và trả lời câu hỏi dưới đây chỉ dựa trên thông tin trong tài liệu.
    
            **Câu hỏi của người dùng**: "${userQuestion}"
    
            **Hướng dẫn trả lời**:
            1. **Nguồn thông tin**:
               - Chỉ sử dụng thông tin có sẵn trong tài liệu PDF.
               - Nếu câu hỏi không thể trả lời vì thông tin không có hoặc không rõ ràng, hãy trả lời: "Thông tin không có trong tài liệu" hoặc "Thông tin trong tài liệu không đủ rõ ràng để trả lời câu hỏi này".
            2. **Cách trình bày**:
               - Trả lời ngắn gọn, rõ ràng, và dễ hiểu.
               - Nếu có thông tin liên quan, trích dẫn đoạn văn, số trang, hoặc mục cụ thể trong tài liệu (ví dụ: "Theo mục 3.2, trang 5...").
               - Nếu thông tin cần giải thích thêm, hãy diễn giải một cách đơn giản nhưng vẫn đúng với nội dung tài liệu.
            3. **Ngôn ngữ**:
               - Sử dụng tiếng Việt, văn phong trang trọng, phù hợp với bối cảnh học thuật.
               - Tránh suy đoán hoặc thêm thông tin ngoài tài liệu.
    
            **Ví dụ trả lời**:
            - Nếu có thông tin: "Theo mục 4.1, trang 10, thời gian thực hiện đề tài cấp trường tối đa là 12 tháng."
            - Nếu không có thông tin: "Thông tin về thời gian thực hiện đề tài không được đề cập trong tài liệu."
    
            **Lưu ý**: Đảm bảo không trả lời dựa trên kiến thức bên ngoài tài liệu. Tập trung vào nội dung của quy trình quản lý và thực hiện đề tài cấp trường.
        `;
    }

    private static initializeAI() {
        if (!GoogleGenAIService.ai && GoogleGenAIService.GEMINI_API_KEY) {
            GoogleGenAIService.ai = new GoogleGenAI({ apiKey: GoogleGenAIService.GEMINI_API_KEY });
        } else if (!GoogleGenAIService.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set in the environment variables');
        }
    }

    private static async fetchPDFAsBase64(filePath: string): Promise<string> {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to fetch PDF: ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const base64 = btoa(
                new Uint8Array(arrayBuffer).reduce(
                    (data, byte) => data + String.fromCharCode(byte),
                    ''
                )
            );
            return base64;
        } catch (error) {
            console.error('Error fetching PDF:', error);
            throw new Error('Could not fetch PDF file');
        }
    }

    static async generateContent(userQuestion: string): Promise<ChatResponse> {
        GoogleGenAIService.initializeAI();

        if (!GoogleGenAIService.ai) {
            throw new Error('GoogleGenAI instance not initialized');
        }

        const pdfBase64 = await GoogleGenAIService.fetchPDFAsBase64(GoogleGenAIService.DOCUMENT_PATH);

        const prompt = GoogleGenAIService.buildPrompt(userQuestion);

        const contents = [
            { text: prompt },
            {
                inlineData: {
                    mimeType: 'application/pdf',
                    data: pdfBase64
                }
            }
        ];

        const response = await GoogleGenAIService.ai.models.generateContent({
            model: GoogleGenAIService.MODEL,
            contents: contents
        });

        return {
            text: response.text
        };
    }
}
