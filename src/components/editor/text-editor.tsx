import { useState, useRef, useEffect, lazy, Suspense } from "react";
import DOMPurify from "dompurify";
import parse from "html-react-parser";
import {
    Eye,
    EyeOff,
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Link,
    Image,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Code,
    Quote,
    HelpCircle,
} from "lucide-react";
import "./text-editor.css";

const ReactQuill = lazy(() => import("react-quill"));
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";

// Define the props for our component
interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    height?: string;
    toolbarOptions?: any;
    className?: string;
    id?: string;
    name?: string;
    maxLength?: number;
    readOnly?: boolean;
    showWordCount?: boolean;
    showCharCount?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
}

const RichTextPreview = ({ content }: { content: string }) => {
    const sanitizeHtml = (content: string) => {
        return DOMPurify.sanitize(content, {
            ADD_TAGS: [
                "ul",
                "ol",
                "li",
                "p",
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6",
                "br",
                "strong",
                "em",
                "a",
                "blockquote",
                "code",
                "pre",
                "img",
                "table",
                "thead",
                "tbody",
                "tr",
                "th",
                "td",
            ],
            ADD_ATTR: ["href", "target", "rel", "src", "alt", "class", "style"],
        });
    };

    const renderContent = (content: string) => {
        const sanitizedContent = sanitizeHtml(content);
        return (
            <div className="prose prose-slate max-w-none">
                {parse(sanitizedContent)}
            </div>
        );
    };

    return (
        <div className="rich-text-preview">
            {renderContent(content || "<p>Chưa có nội dung</p>")}
        </div>
    );
};

const CustomToolbar = ({ id }: { id: string }) => (
    <div id={`toolbar-${id}`} className="custom-toolbar">
        <span className="ql-formats">
            <select className="ql-header" defaultValue="">
                <option value="1">Heading 1</option>
                <option value="2">Heading 2</option>
                <option value="3">Heading 3</option>
                <option value="">Normal</option>
            </select>
        </span>
        <span className="ql-formats">
            <button className="ql-bold" aria-label="Bold">
                <Bold size={16} />
            </button>
            <button className="ql-italic" aria-label="Italic">
                <Italic size={16} />
            </button>
            <button className="ql-underline" aria-label="Underline">
                <Underline size={16} />
            </button>
        </span>
        <span className="ql-formats">
            <button className="ql-list" value="ordered" aria-label="Ordered List">
                <ListOrdered size={16} />
            </button>
            <button className="ql-list" value="bullet" aria-label="Bullet List">
                <List size={16} />
            </button>
            <button className="ql-blockquote" aria-label="Quote">
                <Quote size={16} />
            </button>
            <button className="ql-code-block" aria-label="Code Block">
                <Code size={16} />
            </button>
        </span>
        <span className="ql-formats">
            <button className="ql-link" aria-label="Insert Link">
                <Link size={16} />
            </button>
            <button className="ql-image" aria-label="Insert Image">
                <Image size={16} />
            </button>
        </span>
        <span className="ql-formats">
            <select className="ql-align" aria-label="Text Alignment">
                <option value="" selected>
                    <AlignLeft size={16} />
                </option>
                <option value="center">
                    <AlignCenter size={16} />
                </option>
                <option value="right">
                    <AlignRight size={16} />
                </option>
            </select>
        </span>
        <span className="ql-formats">
            <button className="ql-clean" aria-label="Remove Formatting">
                <HelpCircle size={16} />
            </button>
        </span>
    </div>
);

export const RichTextEditor = ({
    value,
    onChange,
    placeholder = "Nhập nội dung...",
    label,
    error,
    height = "200px",
    toolbarOptions,
    className = "",
    id = "editor-" + Math.random().toString(36).substr(2, 9),
    name,
    maxLength,
    readOnly = false,
    showWordCount = false,
    showCharCount = true,
    onFocus,
    onBlur,
}: RichTextEditorProps) => {
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [wordCount, setWordCount] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const quillRef = useRef<any>(null);

    useEffect(() => {
        if (value) {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = value;
            const textContent = tempDiv.textContent || tempDiv.innerText || "";
            setCharCount(textContent.length);

            const words = textContent.split(/\s+/).filter((word) => word.length > 0);
            setWordCount(words.length);
        } else {
            setCharCount(0);
            setWordCount(0);
        }
    }, [value]);

    const defaultToolbarOptions = {
        container: `#toolbar-${id}`,
        handlers: {
            // Add custom handlers here if needed
        },
    };

    const togglePreviewMode = () => {
        setIsPreviewMode(!isPreviewMode);
    };

    const handleChange = (content: string) => {
        if (maxLength) {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = content;
            const textContent = tempDiv.textContent || tempDiv.innerText || "";

            if (textContent.length <= maxLength) {
                onChange(content || "");
            } else {
            }
        } else {
            onChange(content || "");
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
        if (onFocus) onFocus();
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (onBlur) onBlur();
    };

    return (
        <div
            className={`rich-text-editor-container ${className} ${isFocused ? "focused" : ""
                }`}
        >
            <div className="rich-text-editor-header">
                <div className="rich-text-editor-label">{label}</div>
                <button
                    type="button"
                    className="rich-text-editor-toggle-btn"
                    onClick={togglePreviewMode}
                    aria-label={
                        isPreviewMode
                            ? "Chuyển sang chế độ chỉnh sửa"
                            : "Chuyển sang chế độ xem trước"
                    }
                >
                    {isPreviewMode ? (
                        <>
                            <EyeOff className="rich-text-editor-icon" />
                            <span>Chỉnh sửa</span>
                        </>
                    ) : (
                        <>
                            <Eye className="rich-text-editor-icon" />
                            <span>Xem trước</span>
                        </>
                    )}
                </button>
            </div>

            <div style={{ minHeight: height }}>
                {isPreviewMode ? (
                    <div className="preview-container">
                        <RichTextPreview content={value || "<p>Chưa có nội dung</p>"} />
                    </div>
                ) : (
                    <Suspense
                        fallback={
                            <div
                                className="rich-text-editor-loading"
                                style={{ minHeight: height }}
                            >
                                Đang tải editor...
                            </div>
                        }
                    >
                        <CustomToolbar id={id} />
                        <ReactQuill
                            ref={quillRef}
                            theme="snow"
                            value={value || ""}
                            onChange={handleChange}
                            placeholder={placeholder}
                            modules={{
                                toolbar: toolbarOptions || defaultToolbarOptions,
                            }}
                            style={{ height }}
                            className={`${error ? "rich-text-editor-error" : ""}`}
                            id={id}
                            readOnly={readOnly}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />
                    </Suspense>
                )}
            </div>

            <div className="rich-text-editor-footer">
                <div className="editor-stats">
                    {showCharCount && maxLength && (
                        <div
                            className={`char-counter ${charCount > maxLength * 0.9 ? "char-counter-warning" : ""
                                }`}
                        >
                            {charCount}/{maxLength} ký tự
                        </div>
                    )}
                    {showCharCount && !maxLength && (
                        <div className="char-counter">{charCount} ký tự</div>
                    )}
                    {showWordCount && <div className="word-counter">{wordCount} từ</div>}
                </div>
                {error && <p className="rich-text-editor-error-message">{error}</p>}
            </div>
        </div>
    );
};

export const FormRichTextEditor = ({
    field,
    fieldState,
    label,
    placeholder,
    height,
    toolbarOptions,
    className,
    maxLength,
    readOnly,
    showWordCount,
    showCharCount,
}: {
    field: any;
    fieldState: any;
    label?: string;
    placeholder?: string;
    height?: string;
    toolbarOptions?: any;
    className?: string;
    maxLength?: number;
    readOnly?: boolean;
    showWordCount?: boolean;
    showCharCount?: boolean;
}) => {
    return (
        <RichTextEditor
            value={field.value || ""}
            onChange={(value) => {
                field.onChange(value);
            }}
            placeholder={placeholder}
            label={label}
            error={fieldState.error?.message}
            height={height}
            toolbarOptions={toolbarOptions}
            className={className}
            id={field.name}
            name={field.name}
            maxLength={maxLength}
            readOnly={readOnly}
            showWordCount={showWordCount}
            showCharCount={showCharCount}
            onFocus={field.onFocus}
            onBlur={() => {
                field.onBlur();
            }}
        />
    );
};
