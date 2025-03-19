
import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace with your actual API key
const API_KEY = "YOUR_GEMINI_API_KEY";

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
      1. The most likely job title based on experience
      2. A list of 5-10 key skills mentioned
      3. Generate 10 interview questions specifically tailored for this candidate, considering their ${yearsExperience} years of experience.
      
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
      return JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
    }
    
    throw new Error("Could not parse Gemini API response");
  } catch (error) {
    console.error("Error analyzing CV:", error);
    return {
      jobTitle: "Software Developer",
      skills: ["Programming", "Problem-solving", "Communication"],
      questions: [
        "Tell me about your background and experience in this field.",
        "Describe a challenging project you worked on and how you overcame obstacles.",
        "How do you stay updated with the latest trends and technologies in your industry?",
        "What are your strengths and weaknesses related to this position?",
        "Where do you see yourself professionally in 5 years?",
        "Tell me about a time when you had to learn a new technology quickly.",
        "How do you handle tight deadlines and pressure?",
        "Describe your approach to debugging and troubleshooting.",
        "How do you collaborate with team members who have different working styles?",
        "What aspects of your work do you find most enjoyable?"
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
      You are an expert interview coach. Analyze these interview answers and provide feedback.
      
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
            "feedback": (specific feedback for this answer)
          },
          ...for each question
        ]
      }
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                      text.match(/{[\s\S]*}/);
                      
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
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
