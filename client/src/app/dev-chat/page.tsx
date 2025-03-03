"use client";
import React, { useState } from "react";

const Page = () => {
  const [response, setResponse] = useState("");

  const fetchGPTResponse = async () => {
    try {
      const res = await fetch("/api/ask-gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "write a haiku about AI" }),
      });

      const data = await res.json();
      setResponse(data.message);
    } catch (error) {
      console.error("Error fetching GPT response:", error);
    }
  };

  return (
    <div>
      <h1>GPT API 삽입 페이지</h1>
      <button onClick={fetchGPTResponse}>AI에게 질문하기</button>
      {response && <p>답변: {response}</p>}
    </div>
  );
};

export default Page;
