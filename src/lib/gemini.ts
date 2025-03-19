
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
      - 'questions': array of strings - interview questions (at least 5)
      
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
      const jsonText = jsonMatch[0].replace(/```json|```/g, '').trim();
      console.log("Raw JSON from Gemini:", jsonText);
      
      try {
        const parsedJson = JSON.parse(jsonText);
        console.log("Parsed CV analysis from Gemini:", parsedJson);
        
        // Format questions to match expected output
        const formattedQuestions = Array.isArray(parsedJson.questions) 
          ? parsedJson.questions.map(q => typeof q === 'string' ? q : 
              (q.text || q.question || JSON.stringify(q)))
          : [];
        
        return {
          jobTitle: parsedJson.jobTitle || "Software Developer",
          skills: Array.isArray(parsedJson.skills) ? parsedJson.skills : [],
          questions: formattedQuestions.length > 0 ? formattedQuestions : await generateDefaultQuestions(),
          yearsExperience: yearsExperience
        };
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError);
        throw new Error("Could not parse Gemini API JSON response");
      }
    }
    
    throw new Error("Could not parse Gemini API response");
  } catch (error) {
    console.error("Error analyzing CV:", error);
    // Fallback in case of API errors - generate completely dynamic content
    return {
      jobTitle: "Software Developer",
      skills: await generateSkills(),
      questions: await generateDefaultQuestions(),
      yearsExperience: yearsExperience
    };
  }
};

/**
 * Generate fallback skills if the main API call fails
 */
const generateSkills = async (): Promise<string[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `
      Generate 6-8 key skills for a software developer.
      Return just a JSON array of strings with no explanation.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                      text.match(/\[[\s\S]*\]/);
                      
    if (jsonMatch) {
      const parsedJson = JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
      return Array.isArray(parsedJson) ? parsedJson : ["Programming", "Problem-solving", "Communication", "JavaScript", "React", "Node.js"];
    }
    
    return ["Programming", "Problem-solving", "Communication", "JavaScript", "React", "Node.js"];
  } catch (error) {
    console.error("Error generating skills:", error);
    return ["Programming", "Problem-solving", "Communication", "JavaScript", "React", "Node.js"];
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
        "strengths": [list of 3-5 main strengths observed in the answers],
        "areasToImprove": [list of 3-5 areas for improvement],
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
      const jsonText = jsonMatch[0].replace(/```json|```/g, '').trim();
      console.log("Raw feedback JSON from Gemini:", jsonText);
      
      try {
        const parsedJson = JSON.parse(jsonText);
        console.log("Parsed feedback from Gemini:", parsedJson);
        
        // Ensure all expected fields exist
        let formattedQuestionFeedback;
        
        // Process question feedback - we need to handle async mapping properly
        if (Array.isArray(parsedJson.questionFeedback)) {
          // Process each question feedback item individually
          formattedQuestionFeedback = await Promise.all(
            parsedJson.questionFeedback.map(async (qf: any, index: number) => {
              let keyPointsArray;
              
              // Handle the keyPoints property with proper async handling
              if (Array.isArray(qf.keyPoints)) {
                keyPointsArray = qf.keyPoints;
              } else {
                keyPointsArray = await generateKeyPoints();
              }
              
              return {
                question: qf.question || questions[index] || `Question ${index + 1}`,
                score: qf.score || Math.floor(65 + Math.random() * 20),
                feedback: qf.feedback || "Answer shows basic understanding but could be improved with more details.",
                difficulty: qf.difficulty || ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)],
                keyPoints: keyPointsArray
              };
            })
          );
        } else {
          formattedQuestionFeedback = await generateQuestionFeedback(questions);
        }
        
        const formattedFeedback = {
          overallScore: parsedJson.overallScore || 70,
          feedback: parsedJson.feedback || "Overall performance was satisfactory.",
          strengths: Array.isArray(parsedJson.strengths) ? parsedJson.strengths : await generateStrengths(),
          areasToImprove: Array.isArray(parsedJson.areasToImprove) ? parsedJson.areasToImprove : await generateAreasToImprove(),
          questionFeedback: formattedQuestionFeedback
        };
        
        return formattedFeedback;
      } catch (jsonError) {
        console.error("JSON parsing error in feedback:", jsonError);
        throw new Error("Could not parse feedback JSON response");
      }
    }
    
    throw new Error("Could not parse Gemini API response for feedback");
  } catch (error) {
    console.error("Error analyzing feedback:", error);
    
    // Generate dynamic feedback as fallback
    return {
      overallScore: 75,
      feedback: await generateOverallFeedback(),
      strengths: await generateStrengths(),
      areasToImprove: await generateAreasToImprove(),
      questionFeedback: await generateQuestionFeedback(questions)
    };
  }
};

// Helper functions to generate dynamic fallback content
async function generateOverallFeedback(): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent("Generate a brief 2-3 sentence interview feedback summary. Be constructive but honest.");
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating feedback:", error);
    return "Overall, your responses demonstrated good knowledge and communication skills. Consider providing more specific examples in future interviews to strengthen your answers.";
  }
}

async function generateStrengths(): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = "Generate 3 interview strengths. Return just a JSON array of strings.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsedJson = JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
      return Array.isArray(parsedJson) ? parsedJson : ["Clear communication", "Technical knowledge", "Problem-solving ability"];
    }
    
    return ["Clear communication", "Technical knowledge", "Problem-solving ability"];
  } catch (error) {
    console.error("Error generating strengths:", error);
    return ["Clear communication", "Technical knowledge", "Problem-solving ability"];
  }
}

async function generateAreasToImprove(): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = "Generate 3 areas to improve in interviews. Return just a JSON array of strings.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsedJson = JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
      return Array.isArray(parsedJson) ? parsedJson : ["Provide more specific examples", "Structure answers more clearly", "Elaborate on technical concepts"];
    }
    
    return ["Provide more specific examples", "Structure answers more clearly", "Elaborate on technical concepts"];
  } catch (error) {
    console.error("Error generating areas to improve:", error);
    return ["Provide more specific examples", "Structure answers more clearly", "Elaborate on technical concepts"];
  }
}

async function generateKeyPoints(): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = "Generate 3 key points for an interview question feedback. Return just a JSON array of strings.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsedJson = JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
      return Array.isArray(parsedJson) ? parsedJson : ["Demonstrated good understanding", "Could provide more examples", "Clear explanation of concepts"];
    }
    
    return ["Demonstrated good understanding", "Could provide more examples", "Clear explanation of concepts"];
  } catch (error) {
    console.error("Error generating key points:", error);
    return ["Demonstrated good understanding", "Could provide more examples", "Clear explanation of concepts"];
  }
}

async function generateQuestionFeedback(questions: string[]): Promise<Array<{
  question: string;
  score: number;
  feedback: string;
  difficulty: string;
  keyPoints: string[];
}>> {
  return Promise.all(
    questions.map(async (q) => ({
      question: q,
      score: 70 + Math.floor(Math.random() * 20),
      feedback: await generateSpecificFeedback(),
      difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)],
      keyPoints: await generateKeyPoints()
    }))
  );
}

async function generateSpecificFeedback(): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent("Generate a 1-2 sentence specific feedback for an interview answer. Be constructive and specific.");
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating specific feedback:", error);
    return "Good answer that could be enhanced with more specific examples from your experience.";
  }
}

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
      
      Return the response as a JSON array of strings, with just the questions.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                      text.match(/\[[\s\S]*\]/);
                      
    if (jsonMatch) {
      const jsonText = jsonMatch[0].replace(/```json|```/g, '').trim();
      console.log("Raw default questions JSON from Gemini:", jsonText);
      
      try {
        const parsedJson = JSON.parse(jsonText);
        console.log("Generated default questions from Gemini:", parsedJson);
        
        // Extract just the question text from the structured response
        const questions = Array.isArray(parsedJson) 
          ? parsedJson.map(q => typeof q === 'string' ? q : (q.text || q.question || JSON.stringify(q)))
          : [];
          
        if (questions.length > 0) {
          return questions;
        }
        
        throw new Error("No questions generated");
      } catch (jsonError) {
        console.error("JSON parsing error in questions:", jsonError);
        throw new Error("Could not parse questions JSON response");
      }
    }
    
    throw new Error("Could not parse Gemini API response for questions");
  } catch (error) {
    console.error("Error generating default questions:", error);
    
    // Attempt a second, simpler prompt as fallback
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(`Generate 5 interview questions for a ${jobTitle}.`);
      const response = await result.response;
      const text = response.text();
      
      // Try to extract a list of questions
      const questionsList = text.split(/\d+\.\s+/).filter(q => q.trim().length > 0);
      
      if (questionsList.length > 0) {
        return questionsList.map(q => q.trim());
      }
      
      return getDefaultQuestions();
    } catch (secondError) {
      console.error("Error in fallback question generation:", secondError);
      return getDefaultQuestions();
    }
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
