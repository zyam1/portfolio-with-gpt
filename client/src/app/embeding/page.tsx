'use client';
import React, { useState } from 'react';

const Page = () => {
  const [inputText, setInputText] = useState('');
  const [vectorData, setVectorData] = useState('');
  const [copyVisible, setCopyVisible] = useState(false);

  const getEmbedding = async (text: string): Promise<number[]> => {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    const data = await response.json();
    return data.data[0].embedding;
  };

  const handleEmbedding = async () => {
    const vector = await getEmbedding(inputText);
    console.log('🧠 전체 임베딩 벡터:', vector);

    const formatted = JSON.stringify(vector, null, 2);
    setVectorData(formatted);
    setCopyVisible(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(vectorData);
      alert('📋 복사 완료!');
    } catch (err) {
      alert('복사 실패 😢');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">🧠 OpenAI Embedding Test</h1>

      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="문장을 입력하세요"
        className="w-full p-2 border rounded h-32"
      />

      <button
        onClick={handleEmbedding}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Embedding 실행
      </button>

      {copyVisible && (
        <button
          onClick={handleCopy}
          className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
        >
          📋 복사하기
        </button>
      )}
    </div>
  );
};

export default Page;
