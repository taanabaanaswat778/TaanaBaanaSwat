import React from "react";

export default function BrandLogo({ color = "#111", subColor = "#8a2c2c", size = "2.2rem" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1 }}>
      <div 
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontWeight: 600,
          fontSize: size,
          letterSpacing: "-0.5px",
          color: color,
          whiteSpace: "nowrap",
        }}
      >
        Taana Baana
      </div>
      <div 
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: "10px",
          fontWeight: 800,
          letterSpacing: "0.45em",
          color: subColor,
          marginTop: "4px",
          textTransform: "uppercase",
          paddingLeft: "0.45em", 
        }}
      >
        Swat
      </div>
    </div>
  );
}