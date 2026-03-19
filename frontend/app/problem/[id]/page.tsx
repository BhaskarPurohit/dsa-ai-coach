// frontend/app/problem/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

export default function ProblemPage({ params }: { params: { id: string } }) {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [hints, setHints] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    // Start session
    fetch('/api/start-session', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user123' })
    })
      .then(r => r.json())
      .then(data => {
        setSessionId(data.sessionId);
        setCode(data.currentProblem.starterCode.javascript);
      });
  }, []);

  const handleSubmit = async () => {
    const res = await fetch('/api/submit-code', {
      method: 'POST',
      body: JSON.stringify({ sessionId, code })
    });
    
    const data = await res.json();
    setOutput(data.message.content);
  };

  const requestHint = async () => {
    const res = await fetch('/api/request-hint', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    });
    
    const data = await res.json();
    setHints([...hints, data.hint.content]);
  };

  return (
    <div className="grid grid-cols-2 h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Problem Statement</h1>
        {/* Problem description */}
      </div>
      
      <div className="p-6">
        <CodeMirror
          value={code}
          height="400px"
          extensions={[javascript()]}
          onChange={(value: string) => setCode(value)}
        />
        
        <div className="mt-4 space-x-2">
          <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded">
            Submit
          </button>
          <button onClick={requestHint} className="px-4 py-2 bg-blue-500 text-white rounded">
            Get Hint
          </button>
        </div>
        
        <div className="mt-4">
          {hints.map((hint, i) => (
            <div key={i} className="p-3 bg-yellow-50 rounded mb-2">
              💡 {hint}
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre>{output}</pre>
        </div>
      </div>
    </div>
  );
}