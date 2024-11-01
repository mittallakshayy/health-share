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
  const third = sentences && Math.ceil(sentences.length / 3);
  const paragraph1 = sentences && sentences.slice(0, third).join(" ");
  const paragraph2 = sentences && sentences.slice(third, 2 * third).join(" ");
  const paragraph3 = sentences && sentences.slice(2 * third).join(" ");

  return (
    <div style={{ padding: "27px" }}>
      <div
        style={{
          padding: "10px",
          backgroundColor: "#f6fbfd",
          fontFamily: "serif",
        }}
      >
        <h6 style={{ color: "#1a6a98", fontWeight: "bold" }}>
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
        <p style={{ color: "#333" }}>{paragraph1}</p>
        <p style={{ color: "#333" }}>{paragraph2}</p>
        <p style={{ color: "#333" }}>{paragraph3}</p>
      </div>
    </div>
  );
}
