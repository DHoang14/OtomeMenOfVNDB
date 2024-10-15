import React from 'react'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import ReactMarkdown from 'react-markdown'
export default function Comment(props) {
    return (
        <div className="comment-container">
            <h3 className="comment-header">{props.user} <span className="comment-date">{props.date}</span> </h3>
            <ReactMarkdown 
            className="comment-content"
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            >
                {props.content}
            </ReactMarkdown>
        </div>
    )
}