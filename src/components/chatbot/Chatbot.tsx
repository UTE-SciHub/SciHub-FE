import React, { useState, useRef, useEffect } from "react";
import { Loader2, SendIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage from "./ChatMessage";
import { cn } from "@/lib/utils";
import { GoogleGenAIService } from "@/service/google-genai-service";

export interface ChatbotProps {
  title?: string;
  botAvatar?: string;
  className?: string;
  initialMessages?: Array<{
    content: string;
    isBot: boolean;
    timestamp?: string;
    isLoading?: boolean;
  }>;
}

const Chatbot: React.FC<ChatbotProps> = ({
  title = "Trợ lý AI",
  botAvatar = "/public/logo/favicon.ico",
  className,
  initialMessages = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      content: 'Xin chào! Tôi là trợ lý UTE-SciHub. Tôi có thể giúp gì cho bạn?',
      isBot: true,
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      content: 'Quy trình phê duyệt đề tài được thực hiện như thế nào?',
      isBot: false,
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      content: `Dựa trên tài liệu "QUY TRÌNH QUẢN LÝ ĐỀ TÀI KHOA HỌC VÀ CÔNG NGHỆ CẤP TRƯỜNG", quy trình phê duyệt đề tài được thực hiện như sau:

1. **Xác định Danh mục đề tài:** 
Phòng QLKH&HTQT tham mưu cho BGH Nhà trường ban hành quyết định thành lập hội đồng đánh giá các đề xuất và xác định danh mục đề tài. Hội đồng tổ chức họp, đánh giá dựa trên các tiêu chí (tên đề tài, tính cấp thiết, mục tiêu, nội dung nghiên cứu, sản phẩm và kết quả dự kiến của các đề tài) ghi nhận xét vào phiếu chấm và tổng hợp kết quả bằng biên bản cuộc họp (Trang 8).

2. **Xét duyệt chủ nhiệm đề tài:** 
Phòng QLKH&HTQT tham mưu đề xuất BGH Nhà trường ban hành quyết định thành lập hội đồng tuyển chọn chủ nhiệm đề tài. Hội đồng tổ chức họp, đánh giá theo các tiêu chí tuyển chọn CNĐT, ghi nhận xét vào phiếu chấm và tổng hợp kết quả bằng biên bản cuộc họp. CNĐT trình bày nội dung nghiên cứu của đề tài tại buổi họp. Sau khi có kết quả của các Hội đồng tuyển chọn CNĐT, Phòng QLKH&HTQT gửi Biên bản họp hội đồng đến các CNĐT (Trang 9).

3. **Phê duyệt đề tài:** 
Hiệu trưởng ban hành Quyết định phê duyệt Danh sách chủ nhiệm đề tài và định mức kinh phí cấp cho các đề tài (Trang 9).`,
      isBot: true,
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const userMessage = {
        content: inputValue,
        isBot: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const userPrompt = inputValue;
      setMessages([...messages, userMessage]);
      setInputValue("");
      setIsLoading(true);

      try {
        const loadingMessage = {
          content: "...",
          isBot: true,
          isLoading: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prevMessages => [...prevMessages, loadingMessage]);

        // Call the Google GenAI service
        const response = await GoogleGenAIService.generateContent(userPrompt);
        
        // Remove the loading message and add the actual response
        setMessages(prevMessages => {
          const filteredMessages = prevMessages.filter(msg => !('isLoading' in msg));
          return [...filteredMessages, {
            content: response.text,
            isBot: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }];
        });
      } catch (error) {
        console.error('Error calling AI service:', error);
        
        // Remove the loading message and add an error message
        setMessages(prevMessages => {
          const filteredMessages = prevMessages.filter(msg => !('isLoading' in msg));
          return [...filteredMessages, {
            content: "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
            isBot: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }];
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      {/* Chat button */}
      <Button
        onClick={toggleChat}
        className="h-14 w-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ease-in-out hover:scale-105 border-2 border-white"
        style={{ background: "linear-gradient(135deg, #1877f2 0%, #2b5cd9 100%)" }}
      >
        {isOpen ? (
          <XIcon className="h-3/4 w-3/4 text-white" />
        ) : (
          <div className="">
            <img 
              src={botAvatar} 
              alt="Chatbot" 
              className="object-cover"
            />
          </div>
        )}
      </Button>

      {/* Chat window with smooth animation */}
      <div 
        className={`absolute bottom-16 right-0 w-96 sm:w-[450px] md:w-[550px] bg-gray-50 rounded-lg shadow-lg flex flex-col border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`}
      >
        {/* Chat header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <h3 className="font-medium">{title}</h3>
          </div>
          <button 
            onClick={toggleChat}
            className="text-white p-1 rounded hover:bg-blue-600 transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Welcome message */}
        <div className="p-4 text-center text-gray-600 text-sm border-b border-gray-200 bg-gradient-to-b from-blue-50 to-white">
          <p className="font-medium">Bắt đầu trò chuyện với trợ lý UTE-SciHub</p>
          <p className="text-xs mt-1">
            Hỏi bất kỳ câu hỏi nào về quy trình quản lý và thực hiện đề tài cấp trường
          </p>
          <p className="text-xs mt-1 italic">
            Ví dụ: "Quy trình phê duyệt đề tài được thực hiện như thế nào?"
          </p>
        </div>

        {/* Messages - increased height */}
        <div className="flex-1 p-4 overflow-y-auto max-h-[500px] bg-gradient-to-b from-blue-50 to-gray-50">
          {messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-400 text-sm">
                Gửi tin nhắn để bắt đầu cuộc trò chuyện
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <ChatMessage
                key={index}
                content={message.content}
                isBot={message.isBot}
                timestamp={message.timestamp}
                avatar={message.isBot ? botAvatar : undefined}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="bg-white border-t border-gray-200 p-3 flex items-center shadow-inner">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleInputKeyPress}
            placeholder="Nhập tin nhắn, nhấn Enter để gửi..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 shadow-sm hover:border-blue-300 transition-colors"
          />
          <Button
            size="sm"
            type="button"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={cn(
              "rounded-full h-10 w-10 p-0 ml-2 transition-all duration-200 shadow-md",
              inputValue.trim() && !isLoading
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:scale-105"
                : "bg-gray-200 text-gray-400"
            )}
          >
            {isLoading ? (
              <div className="relative h-5 w-5">
                <div className="absolute inset-0 rounded-full border-2 border-blue-200 border-opacity-25"></div>
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin"></div>
              </div>
            ) : (
              <SendIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;