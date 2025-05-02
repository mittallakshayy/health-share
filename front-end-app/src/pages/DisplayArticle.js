import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import API_URL from "../apis/api";

export default function Article() {
  const { articleId } = useParams();
  const [data, setData] = useState(null);

  const handleArticle = useCallback(async (articleId) => {
    try {
      const url = API_URL + `/healthshare/api/articledata?id=${articleId}`;
      const response = await fetch(url, {
        mode: "cors",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }, []);

  useEffect(() => {
    if (articleId) {
      handleArticle(articleId);
    }
  }, [articleId, handleArticle]);

  const text = data && data.text;
  const sentences = text && text.match(/[^.!?]+[.!?]+/g);
  const fifth = sentences && Math.ceil(sentences.length / 5);
  const paragraph1 = sentences && sentences.slice(0, fifth).join(" ");
  const paragraph2 = sentences && sentences.slice(fifth, 2 * fifth).join(" ");
  const paragraph3 = sentences && sentences.slice(2 * fifth, 3 * fifth).join(" ");
  const paragraph4 = sentences && sentences.slice(3 * fifth, 4 * fifth).join(" ");
  const paragraph5 = sentences && sentences.slice(4 * fifth).join(" ");

  return (
    <div style={{ padding: "27px", fontFamily: "sans-serif", backgroundColor: "#f9f9f9", fontSize:'0.9rem' }}>
      <div style={{ padding: "20px", backgroundColor: "#ffffff", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)" }}>
        
        <h6 style={{ fontWeight: "bold" }}>
          Click here to be redirected to the article -{" "}
        </h6>
        <a
          target="_blank" 
          rel="noopener noreferrer"
          href={data && data.url}
          style={{ color: "#1a6a98", marginBottom: "10px", display: "block" }}
        >
          {data && data.url}
        </a>
        
        <p
          style={{
            color: "#333",
            lineHeight: "1.6",
            marginBottom: "10px",
            textAlign: "left",
          }}
        >
          {paragraph1}
        </p>
        <p
          style={{
            color: "#333",
            lineHeight: "1.6",
            marginBottom: "10px",
            textAlign: "left",
          }}
        >
          {paragraph2}
        </p>
        <p
          style={{
            color: "#333",
            lineHeight: "1.6",
            marginBottom: "10px",
            textAlign: "left",
          }}
        >
          {paragraph3}
        </p>
        <p
          style={{
            color: "#333",
            lineHeight: "1.6",
            marginBottom: "10px",
            textAlign: "left",
          }}
        >
          {paragraph4}
        </p>
        <p
          style={{
            color: "#333",
            lineHeight: "1.6",
            marginBottom: "10px",
            textAlign: "left",
          }}
        >
          {paragraph5}
        </p>
      </div>
    </div>
  );
}