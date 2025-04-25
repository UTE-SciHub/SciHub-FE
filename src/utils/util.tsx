import DOMPurify from "dompurify";
import parse from "html-react-parser";

export const sanitizeHtml = (content: string) => {
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

export const renderContent = (content: string) => {
    const sanitizedContent = sanitizeHtml(content);
    return (
        <div className="prose prose-slate max-w-none" >
            {parse(sanitizedContent)}
        </div>
    );
};