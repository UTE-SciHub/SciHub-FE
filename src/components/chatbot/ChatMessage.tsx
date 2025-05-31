import React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

export interface ChatMessageProps {
  content: string;
  isBot: boolean;
  timestamp?: string;
  avatar?: string;
  isLoading?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  isBot,
  timestamp,
  avatar,
  isLoading = false,
}) => {
  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      {isBot && (
        <div className="flex-shrink-0 mr-3">
          <Avatar className="h-9 w-9 bg-white border-2 border-blue-200 shadow-sm flex items-center justify-center">
            {avatar ? (
              <img 
                src={avatar} 
                alt="Bot" 
                className="h-full w-full object-contain rounded-full" 
              />
            ) : (
              <span className="text-blue-600 text-xs font-semibold">Bot</span>
            )}
          </Avatar>
        </div>
      )}
      <div
        className={cn(
          "px-4 py-3 rounded-lg max-w-[90%] break-words",
          isBot
            ? "bg-white text-gray-800 border border-gray-200 shadow-sm"
            : "bg-blue-500 text-white"
        )}
      >
        {isLoading ? (
          <div className="flex items-center space-x-1">
            <div 
              className="h-2 w-2 rounded-full bg-blue-500"
              style={{
                animation: 'typingAnimation 1.5s infinite ease-in-out',
                animationDelay: '0ms',
                opacity: 0.6
              }}
            ></div>
            <div 
              className="h-2 w-2 rounded-full bg-blue-500"
              style={{
                animation: 'typingAnimation 1.5s infinite ease-in-out',
                animationDelay: '200ms',
                opacity: 0.6
              }}
            ></div>
            <div 
              className="h-2 w-2 rounded-full bg-blue-500"
              style={{
                animation: 'typingAnimation 1.5s infinite ease-in-out',
                animationDelay: '400ms',
                opacity: 0.6
              }}
            ></div>
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes typingAnimation {
                0% { transform: scale(1); opacity: 0.6; }
                50% { transform: scale(1.5); opacity: 1; }
                100% { transform: scale(1); opacity: 0.6; }
              }
            `}} />
          </div>
        ) : (
          <div className="text-sm whitespace-pre-line">
            {content.split('\n').map((paragraph, index) => {
              // Check if paragraph is a numbered list item
              const isNumberedListItem = /^\d+\.\s/.test(paragraph);
              // Check if paragraph is a bullet point
              const isBulletPoint = /^•\s|^\*\s|^-\s/.test(paragraph);
              // Check if paragraph is a heading (starts with ### or similar)
              const isHeading = /^#{1,6}\s/.test(paragraph);
              
              return (
                <p 
                  key={index} 
                  className={cn(
                    "mb-2 last:mb-0",
                    isNumberedListItem || isBulletPoint ? "pl-2 border-l-2 border-blue-200" : "",
                    isHeading ? "font-semibold text-blue-800" : ""
                  )}
                >
                  {paragraph.split(/\*\*([^*]+)\*\*/).map((part, partIndex) => {
                    // Every odd index in the split result is content between ** markers
                    return partIndex % 2 === 1 ? 
                      <strong key={partIndex} className="font-bold">{part}</strong> : 
                      part;
                  })}
                </p>
              );
            })}
          </div>
        )}
        {timestamp && (
          <div className={cn("text-xs mt-1", isBot ? "text-gray-500" : "text-blue-100")}>
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;