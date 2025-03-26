'use client';
import React, { useState } from 'react';
import { documents } from '@/functions/embedData';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const cosineSimilarity = (a: number[], b: number[]) => {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
};

const Page = () => {
  const [response, setResponse] = useState('');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const getEmbedding = async (text: string): Promise<number[]> => {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
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
    const data = await res.json();
    return data.data[0].embedding;
  };

  const fetchGPTResponse = async () => {
    try {
      setLoading(true);
      setResponse('');
      setQuestion('');
      // 1. 사용자 질문 벡터화
      const questionEmbedding = await getEmbedding(question);

      // 2. 가장 유사한 문서 찾기
      const mostRelevant = documents
        .map((doc) => ({
          ...doc,
          similarity: cosineSimilarity(doc.embedding, questionEmbedding),
        }))
        .sort((a, b) => b.similarity - a.similarity)[0];

      // 3. 프롬프트 생성
      const prompt = `
아래 문서를 참고해서 사용자 질문에 대답해줘 [질문] 부분은 기업의 프론트엔드 실무자가 코드를 작성한 사용자의 코드를 알고싶어서 질문하는거야 어떤식으로 코드를 짰는지 알고싶어서 그렇기때문에 어떤부분이 잘만들어졌는지 설명해줬으면 좋겠어 친절한 말투로.앞뒤로 인사말이나 끝맺음말은 굳이 안해도돼,예시코드는 항상 다 출력할 필요는없어 설명에 관련된부분만 잘라서 설명하거나 필요할경우엔 다 보여줄수도있겠지 필요없을경우엔 안보여줘도되고 대신 코드수정한걸 보여주면안돼

[문서 요약]
${mostRelevant.description}

[코드]
${mostRelevant.code}

[질문]
"${question}"

답변 형식:
- 요약
- 상세 설명
- 예시 코드
      `.trim();

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await res.json();
      setResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('Error fetching GPT response:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="open-ai-container">
      <section className="response_container markdown-body">
        {loading ? (
          <p style={{ color: '#ccc', padding: '1rem' }}>답변 준비 중...</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const isBlock = className && className.startsWith('language-');
                return isBlock ? (
                  <pre className="code-block">
                    <code {...props}>{children}</code>
                  </pre>
                ) : (
                  <code>{children}</code>
                );
              },
              strong({ children }) {
                return <>{children}</>;
              },
              p({ children }) {
                return <p>{children}</p>;
              },
            }}
          >
            {response}
          </ReactMarkdown>
        )}
      </section>

      <section className="subscribe_news_container">
        <label className="subscribe_news_label">
          <input
            placeholder="Ask a question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <button type="submit" onClick={fetchGPTResponse}>
            <img
              src="/images/paper-plane-1.png"
              className="subscribe_news_submit_buttonimg"
            />
          </button>
        </label>
      </section>
    </div>
  );
};

export default Page;
