
import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini API key - this should be replaced with a proper API key in production
const API_KEY = process.env.GEMINI_API_KEY || "235718022786";

// Initialize the Gemini AI
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Analyzes a CV and extracts key information
 */
export const analyzeCV = async (cvText: string, yearsExperience: number): Promise<{
  jobTitle: string;
  skills: string[];
  questions: string[];
  yearsExperience: number;
}> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `
      Analyze this CV text and extract the following information:
      1. The most likely job title based on experience (be very specific, if it's a developer specify what kind)
      2. A list of 5-10 key skills mentioned, ordered by relevance
      3. Generate ${yearsExperience} interview questions specifically tailored for this candidate, considering their years of experience (${yearsExperience} years).
      Make at least half of these questions technical and specific to their field.
      
      For each question, assign a difficulty level (Easy, Medium, or Hard) based on how challenging it would be for someone with ${yearsExperience} years of experience.
      
      Format the response as JSON with the following properties:
      - 'jobTitle': string - the detected job title
      - 'skills': array of strings - key skills from the CV
      - 'questions': array of objects, each containing:
          - 'text': string - the question text
          - 'difficulty': string - "Easy", "Medium", or "Hard"
          - 'type': string - "Technical" or "Behavioral"
      
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
      
      // Format questions to match expected output
      const formattedQuestions = Array.isArray(parsedJson.questions) 
        ? parsedJson.questions.map(q => typeof q === 'string' ? q : q.text)
        : [];
      
      return {
        jobTitle: parsedJson.jobTitle || "Software Developer",
        skills: Array.isArray(parsedJson.skills) ? parsedJson.skills : [],
        questions: formattedQuestions,
        yearsExperience: yearsExperience
      };
    }
    
    throw new Error("Could not parse Gemini API response");
  } catch (error) {
    console.error("Error analyzing CV:", error);
    // Fallback in case of API errors
    return {
      jobTitle: "Software Developer",
      skills: ["Programming", "Problem-solving", "Communication", "JavaScript", "React", "Node.js"],
      questions: [
        "Tell me about your background in software development.",
        "Describe a challenging project you worked on and how you overcame technical obstacles.",
        "How do you stay updated with the latest programming trends and technologies?",
        "Can you explain the difference between RESTful and GraphQL APIs?",
        "What's your approach to debugging a complex application issue?"
      ],
      yearsExperience: yearsExperience
    };
  }
};

/**
 * Analyzes interview answers and provides feedback
 */
export const analyzeFeedback = async (
  questions: string[], 
  answers: string[],
  jobTitle: string = "Software Developer",
  yearsExperience: number = 1
): Promise<{
  overallScore: number;
  feedback: string;
  strengths: string[];
  areasToImprove: string[];
  questionFeedback: Array<{
    question: string;
    score: number;
    feedback: string;
    difficulty: string;
    keyPoints: string[];
  }>;
}> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const questionsAnswersPairs = questions.map((q, i) => 
      `Question ${i+1}: ${q}\nAnswer ${i+1}: ${answers[i] || "No answer provided"}`
    ).join("\n\n");
    
    const prompt = `
      You are an expert interview coach specializing in technical interviews for ${jobTitle} positions. 
      You are evaluating a candidate with approximately ${yearsExperience} years of experience.
      
      Analyze these interview answers and provide detailed feedback:
      
      ${questionsAnswersPairs}
      
      Provide an evaluation in JSON format with the following structure:
      {
        "overallScore": (number between 0-100 representing overall interview performance),
        "feedback": (general feedback summary in 2-3 sentences),
        "strengths": [list of 3 main strengths observed in the answers],
        "areasToImprove": [list of 3 areas for improvement],
        "questionFeedback": [
          {
            "question": (the question text),
            "score": (number between 0-100 based on answer quality),
            "feedback": (specific detailed feedback for this answer in 1-2 sentences),
            "difficulty": (classify the question as "Easy", "Medium", or "Hard" based on its complexity),
            "keyPoints": [list of 2-3 key points the candidate addressed or missed]
          },
          ...for each question
        ]
      }
      
      For your scoring:
      - For technical questions, evaluate the accuracy and depth of technical knowledge
      - For behavioral questions, assess communication clarity and relevance of examples
      - Consider the candidate's years of experience (${yearsExperience}) when scoring
      - Be constructive but honest in your feedback
      - Ensure difficulty ratings match the complexity of each question
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
      
      // Ensure all expected fields exist
      const formattedFeedback = {
        overallScore: parsedJson.overallScore || 70,
        feedback: parsedJson.feedback || "Overall performance was satisfactory.",
        strengths: Array.isArray(parsedJson.strengths) ? parsedJson.strengths : ["Communication skills", "Technical knowledge", "Problem-solving ability"],
        areasToImprove: Array.isArray(parsedJson.areasToImprove) ? parsedJson.areasToImprove : ["Provide more specific examples", "Deepen technical knowledge", "Improve answer structure"],
        questionFeedback: Array.isArray(parsedJson.questionFeedback) 
          ? parsedJson.questionFeedback.map((qf: any, index: number) => ({
              question: qf.question || questions[index] || `Question ${index + 1}`,
              score: qf.score || Math.floor(65 + Math.random() * 20),
              feedback: qf.feedback || "Answer shows basic understanding but could be improved with more details.",
              difficulty: qf.difficulty || ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)],
              keyPoints: Array.isArray(qf.keyPoints) ? qf.keyPoints : ["Demonstrated basic knowledge", "Could provide more examples", "Good communication"]
            }))
          : questions.map((q, i) => ({
              question: q,
              score: 70 + Math.floor(Math.random() * 20),
              feedback: "Good answer that could be enhanced with more specific examples.",
              difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)],
              keyPoints: [
                "Demonstrated understanding of core concepts",
                "Could improve with more specific technical details",
                "Good communication of ideas"
              ]
            }))
      };
      
      return formattedFeedback;
    }
    
    throw new Error("Could not parse Gemini API response");
  } catch (error) {
    console.error("Error analyzing feedback:", error);
    
    // Return mock feedback as fallback
    return {
      overallScore: 75,
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
        score: 65 + Math.floor(Math.random() * 25),
        feedback: "Good response that could be enhanced with more specific examples.",
        difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)],
        keyPoints: [
          "Demonstrated understanding of core concepts",
          "Could improve with more specific technical details",
          "Good communication of complex ideas"
        ]
      }))
    };
  }
};

/**
 * Generates a set of default interview questions
 */
export const generateDefaultQuestions = async (jobTitle: string = "Software Developer"): Promise<string[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `
      Generate 10 professional interview questions for a ${jobTitle} position.
      Include a mix of behavioral and technical questions relevant to this role.
      Make the questions challenging but fair, suitable for a professional interview.
      
      For each question, include both the question text and its difficulty level (Easy, Medium, or Hard).
      
      Return the response as a JSON array of objects, each with 'text' (the question) and 'difficulty' properties.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                      text.match(/\[[\s\S]*\]/);
                      
    if (jsonMatch) {
      const parsedJson = JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
      console.log("Generated default questions from Gemini:", parsedJson);
      
      // Extract just the question text from the structured response
      const questions = Array.isArray(parsedJson) 
        ? parsedJson.map(q => typeof q === 'string' ? q : q.text || q.question)
        : [];
        
      return questions.length > 0 ? questions : getDefaultQuestions();
    }
    
    throw new Error("Could not parse Gemini API response");
  } catch (error) {
    console.error("Error generating default questions:", error);
    return getDefaultQuestions();
  }
};

// Helper function to provide default questions as fallback
const getDefaultQuestions = (): string[] => {
  return [
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
  ];
};
