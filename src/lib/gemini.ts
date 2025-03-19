
import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini API key
const API_KEY = "235718022786";

// Initialize the Gemini AI
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeCV = async (cvText: string, yearsExperience: number): Promise<{
  jobTitle: string;
  skills: string[];
  questions: string[];
}> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `
      Analyze this CV text and extract the following information:
      1. The most likely job title based on experience (be very specific, if it's a developer specify what kind)
      2. A list of 5-10 key skills mentioned
      3. Generate ${yearsExperience} interview questions specifically tailored for this candidate, considering their years of experience.
      Make at least half of these questions technical and specific to their field.
      
      Format the response as JSON with 'jobTitle', 'skills' (array), and 'questions' (array) properties.
      
      CV Text:
      ${cvText}
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                      text.match(/{[\s\S]*}/);
                      
    if (jsonMatch) {
      const parsedJson = JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
      console.log("Parsed CV analysis from Gemini:", parsedJson);
      return parsedJson;
    }
    
    throw new Error("Could not parse Gemini API response");
  } catch (error) {
    console.error("Error analyzing CV:", error);
    return {
      jobTitle: "Software Developer",
      skills: ["Programming", "Problem-solving", "Communication", "JavaScript", "React", "Node.js"],
      questions: [
        "Tell me about your background in software development.",
        "Describe a challenging project you worked on and how you overcame technical obstacles.",
        "How do you stay updated with the latest programming trends and technologies?",
        "Can you explain the difference between RESTful and GraphQL APIs?",
        "What's your approach to debugging a complex application issue?"
      ]
    };
  }
};

export const analyzeFeedback = async (
  questions: string[], 
  answers: string[]
): Promise<{
  overallScore: number;
  feedback: string;
  strengths: string[];
  areasToImprove: string[];
  questionFeedback: Array<{
    question: string;
    score: number;
    feedback: string;
  }>;
}> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const questionsAnswersPairs = questions.map((q, i) => 
      `Question ${i+1}: ${q}\nAnswer ${i+1}: ${answers[i] || "No answer provided"}`
    ).join("\n\n");
    
    const prompt = `
      You are an expert interview coach specializing in technical interviews. Analyze these interview answers and provide detailed feedback.
      
      ${questionsAnswersPairs}
      
      Provide an evaluation in JSON format with the following structure:
      {
        "overallScore": (number between 0-100),
        "feedback": (general feedback summary),
        "strengths": [list of 3 main strengths],
        "areasToImprove": [list of 3 areas for improvement],
        "questionFeedback": [
          {
            "question": (the question text),
            "score": (number between 0-100),
            "feedback": (specific technical feedback for this answer)
          },
          ...for each question
        ]
      }
      
      For technical questions, provide specific feedback on the accuracy and depth of technical knowledge.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                      text.match(/{[\s\S]*}/);
                      
    if (jsonMatch) {
      const parsedJson = JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
      console.log("Parsed feedback from Gemini:", parsedJson);
      return parsedJson;
    }
    
    throw new Error("Could not parse Gemini API response");
  } catch (error) {
    console.error("Error analyzing feedback:", error);
    
    // Return mock feedback as fallback
    return {
      overallScore: 82,
      feedback: "Overall, your responses were clear and professional. You effectively demonstrated your experience and skills, but could provide more specific examples to support your claims.",
      strengths: [
        "Clear communication and professional tone",
        "Good understanding of the technical aspects of the role",
        "Positive attitude and enthusiasm"
      ],
      areasToImprove: [
        "Include more specific examples from your experience",
        "Elaborate more on quantifiable achievements",
        "Structure your responses with a clearer beginning, middle, and end"
      ],
      questionFeedback: questions.map((q, i) => ({
        question: q,
        score: 75 + Math.floor(Math.random() * 15),
        feedback: "Good response that could be enhanced with more specific examples."
      }))
    };
  }
};
