import { GoogleGenAI } from '@google/genai';
import { Pinecone } from '@pinecone-database/pinecone';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const indexName = process.env.PINECONE_INDEX_NAME!;

export const generateEmbedding = async (text: string) => {
  const response = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: text,
  });

  if (!response.embeddings?.[0]?.values) {
    throw new Error('Failed to generate embeddings');
  }

  const values = response.embeddings[0].values;

  // Slice to 768 dimensions and L2-normalize to match Pinecone index
  const sliced = values.slice(0, 768);
  const l2Norm = Math.sqrt(sliced.reduce((sum, val) => sum + val * val, 0));
  return sliced.map((val) => val / (l2Norm || 1));
};

export const upsertDocumentChunks = async (
  chunks: { id: string; text: string; embedding: number[] }[]
) => {
  const index = pc.index(indexName);

  const vectors = chunks.map((chunk) => ({
    id: chunk.id,
    values: chunk.embedding,
    metadata: {
      text: chunk.text,
    },
  }));

  await index.upsert({ records: vectors } as any);
};

export const searchSimilarChunks = async (queryEmbedding: number[], topK: number = 3) => {
  const index = pc.index(indexName);
  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });

  return results.matches.map((match) => match.metadata?.text as string).filter(Boolean);
};

export const generateAnswer = async (question: string, context: string[]) => {
  const prompt = `You are an AI assistant for the company DevSto. Answer the employee's question based strictly on the provided company policy documents.
If the answer is not in the documents, say "I don't have enough information in the company policies to answer that."

Context:
${context.join('\n\n')}

Question:
${question}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};

export const generateAttendanceReport = async (attendanceData: any) => {
  const prompt = `You are an HR AI assistant. Summarize the following attendance data for the team. 
Focus on identifying patterns like chronic lateness, impressive punctuality, or excessive leaves.
Provide a professional, concise summary.

Data:
${JSON.stringify(attendanceData, null, 2)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};

export const generateDataAnswer = async (question: string, attendanceData: any) => {
  const prompt = `You are a helpful HR Data Assistant. Analyze the following attendance JSON data to answer the user's question accurately.
If the data is insufficient to answer the question, state that clearly.
Do not hallucinate. Use only the provided JSON data.

Attendance Data:
${JSON.stringify(attendanceData, null, 2)}

User Question:
${question}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};
