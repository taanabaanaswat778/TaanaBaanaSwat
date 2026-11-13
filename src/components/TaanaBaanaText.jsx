import React from "react";

export default function TaanaBaanaText({ className = "", style = {} }) {
  return (
    <div 
      className={`taana-logo-text ${className}`} 
      style={{
        fontFamily: "'Playfair Display', serif",
        fontStyle: "italic",
        fontWeight: 600,
        letterSpacing: "-0.5px",
        whiteSpace: "nowrap",
        display: "inline-block",
        ...style
      }}
    >
      <span className="t-letter">T</span>
      <span className="t-letter">a</span>
      <span className="t-letter">a</span>
      <span className="t-letter">n</span>
      <span className="t-letter">a</span>
      <span className="t-space">&nbsp;</span>
      <span className="t-letter">B</span>
      <span className="t-letter">a</span>
      <span className="t-letter">a</span>
      <span className="t-letter">n</span>
      <span className="t-letter">a</span>
    </div>
  );
}