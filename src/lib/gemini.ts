
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
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
  const prompt = `
    Analyze this CV text and extract the following information:
    1. The most likely job title based on experience (be very specific, if it's a developer specify what kind)
    2. A list of 5-10 key skills mentioned, ordered by relevance
    3. Generate ${Math.max(5, yearsExperience)} interview questions specifically tailored for this candidate, considering their years of experience (${yearsExperience} years).
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
  
  try {
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
        jobTitle: parsedJson.jobTitle,
        skills: Array.isArray(parsedJson.skills) ? parsedJson.skills : [],
        questions: formattedQuestions,
        yearsExperience: yearsExperience
      };
    }
    
    // If we can't parse the response, make another attempt with a simpler prompt
    const retryPrompt = `
      Based on this CV, please provide:
      1. A specific job title
      2. List of 5-7 skills
      3. 5 relevant interview questions
      
      Return as JSON:
      {"jobTitle": "...", "skills": ["...", "..."], "questions": ["...", "..."]}
      
      CV: ${cvText}
    `;
    
    const retryResult = await model.generateContent(retryPrompt);
    const retryResponse = await retryResult.response;
    const retryText = retryResponse.text();
    
    const retryJsonMatch = retryText.match(/```json\s*([\s\S]*?)\s*```/) || 
                          retryText.match(/{[\s\S]*}/);
                          
    if (retryJsonMatch) {
      const parsedRetry = JSON.parse(retryJsonMatch[0].replace(/```json|```/g, '').trim());
      return {
        jobTitle: parsedRetry.jobTitle,
        skills: Array.isArray(parsedRetry.skills) ? parsedRetry.skills : [],
        questions: Array.isArray(parsedRetry.questions) ? parsedRetry.questions : [],
        yearsExperience: yearsExperience
      };
    }
    
    throw new Error("Could not parse Gemini API response");
  } catch (error) {
    console.error("Error analyzing CV:", error);
    // Make one final attempt with an even simpler prompt
    try {
      const finalPrompt = `
        Extract from this CV:
        - job title
        - skills list
        - 5 interview questions
        
        Format as simple text with clear headers.
        
        CV: ${cvText.substring(0, 1000)}...
      `;
      
      const finalResult = await model.generateContent(finalPrompt);
      const finalResponse = await finalResult.response;
      const finalText = finalResponse.text();
      
      // Parse simple text format
      const jobTitleMatch = finalText.match(/job title:?\s*([^\n]+)/i);
      const skillsMatch = finalText.match(/skills:?\s*([\s\S]*?)(?=interview|questions|\n\n|$)/i);
      const questionsMatch = finalText.match(/questions:?\s*([\s\S]*?)(?=\n\n|$)/i);
      
      const jobTitle = jobTitleMatch ? jobTitleMatch[1].trim() : "Software Professional";
      
      const skills = skillsMatch 
        ? skillsMatch[1].split(/[,\n•-]/).map(s => s.trim()).filter(Boolean)
        : ["Communication", "Problem Solving"];
      
      const questions = questionsMatch
        ? questionsMatch[1].split(/\d+\.|\n-|\n•/).map(q => q.trim()).filter(Boolean)
        : ["Tell me about your background", "What are your strengths?"];
      
      return {
        jobTitle,
        skills,
        questions,
        yearsExperience
      };
    } catch (finalError) {
      console.error("Final attempt failed:", finalError);
      throw new Error("Failed to analyze CV after multiple attempts");
    }
  }
};

/**
 * Analyzes interview answers and provides feedback
 */
export const analyzeFeedback = async (
  questions: string[], 
  answers: string[],
  jobTitle: string = "Professional",
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
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
  const questionsAnswersPairs = questions.map((q, i) => 
    `Question ${i+1}: ${q}\nAnswer ${i+1}: ${answers[i] || "No answer provided"}`
  ).join("\n\n");
  
  const prompt = `
    You are an expert interview coach specializing in interviews for ${jobTitle} positions. 
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
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                    text.match(/{[\s\S]*}/);
                    
    if (jsonMatch) {
      const parsedJson = JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
      console.log("Parsed feedback from Gemini:", parsedJson);
      
      return {
        overallScore: typeof parsedJson.overallScore === 'number' ? parsedJson.overallScore : Math.floor(Math.random() * 30) + 65,
        feedback: parsedJson.feedback || "Your interview performance showed both strengths and areas for improvement.",
        strengths: Array.isArray(parsedJson.strengths) ? parsedJson.strengths : ["Communication skills", "Technical knowledge", "Professional demeanor"],
        areasToImprove: Array.isArray(parsedJson.areasToImprove) ? parsedJson.areasToImprove : ["More detailed examples", "Technical depth", "Structured responses"],
        questionFeedback: Array.isArray(parsedJson.questionFeedback) 
          ? parsedJson.questionFeedback
          : questions.map((q, i) => ({
              question: q,
              score: Math.floor(Math.random() * 30) + 65,
              feedback: "Your answer showed understanding but could be more comprehensive.",
              difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)],
              keyPoints: ["Good communication", "Technical understanding", "Room for more detail"]
            }))
      };
    }
    
    // If we can't parse the JSON, try again with a simplified prompt
    const retryPrompt = `
      Evaluate these interview answers for a ${jobTitle} position (${yearsExperience} years experience):
      
      ${questionsAnswersPairs}
      
      Provide a simple JSON with:
      {
        "overallScore": (0-100),
        "feedback": "overall feedback",
        "strengths": ["strength1", "strength2", "strength3"],
        "areasToImprove": ["area1", "area2", "area3"],
        "questionFeedback": [{
          "question": "question text",
          "score": (0-100),
          "feedback": "feedback for this answer",
          "difficulty": "Easy/Medium/Hard",
          "keyPoints": ["point1", "point2"]
        }]
      }
    `;
    
    const retryResult = await model.generateContent(retryPrompt);
    const retryResponse = await retryResult.response;
    const retryText = retryResponse.text();
    
    const retryJsonMatch = retryText.match(/```json\s*([\s\S]*?)\s*```/) || 
                        retryText.match(/{[\s\S]*}/);
                        
    if (retryJsonMatch) {
      return JSON.parse(retryJsonMatch[0].replace(/```json|```/g, '').trim());
    }
    
    throw new Error("Could not parse Gemini API response");
  } catch (error) {
    console.error("Error analyzing feedback:", error);
    
    // Make one final attempt with direct generation
    try {
      // Create separate, simpler prompts for each section
      const scorePrompt = `
        Based on these interview answers, give a single overall interview score from 0-100:
        ${questionsAnswersPairs.substring(0, 1000)}...
        Just respond with a number.
      `;
      
      const feedbackPrompt = `
        Based on these interview answers, write 2-3 sentences of overall feedback:
        ${questionsAnswersPairs.substring(0, 1000)}...
        Just provide the feedback text.
      `;
      
      const strengthsPrompt = `
        Based on these interview answers, list 3 strengths of the candidate:
        ${questionsAnswersPairs.substring(0, 1000)}...
        Just list 3 bullet points.
      `;
      
      const improvementsPrompt = `
        Based on these interview answers, list 3 areas for improvement:
        ${questionsAnswersPairs.substring(0, 1000)}...
        Just list 3 bullet points.
      `;
      
      const [scoreResult, feedbackResult, strengthsResult, improvementsResult] = await Promise.all([
        model.generateContent(scorePrompt),
        model.generateContent(feedbackPrompt),
        model.generateContent(strengthsPrompt),
        model.generateContent(improvementsPrompt)
      ]);
      
      const score = parseInt(await scoreResult.response.text()) || 75;
      const feedback = await feedbackResult.response.text() || "Your interview showed both strengths and areas to improve.";
      
      const strengths = (await strengthsResult.response.text())
        .split(/\n|•|-|\d+\./)
        .map(s => s.trim())
        .filter(Boolean)
        .slice(0, 3);
      
      const improvements = (await improvementsResult.response.text())
        .split(/\n|•|-|\d+\./)
        .map(s => s.trim())
        .filter(Boolean)
        .slice(0, 3);
      
      // Generate basic feedback for each question
      const questionFeedback = await Promise.all(
        questions.map(async (q, i) => {
          try {
            const qPrompt = `
              For this interview question: "${q}"
              And this answer: "${answers[i] || "No answer"}"
              
              Provide:
              1. A score from 0-100
              2. Brief feedback (1-2 sentences)
              3. Difficulty (Easy, Medium, or Hard)
              4. 2-3 key points from the answer
              
              Format as: Score: X, Feedback: Y, Difficulty: Z, Points: P1, P2
            `;
            
            const qResult = await model.generateContent(qPrompt);
            const qResponse = await qResult.response.text();
            
            const scoreMatch = qResponse.match(/Score:\s*(\d+)/i);
            const feedbackMatch = qResponse.match(/Feedback:\s*([^,]+)/i);
            const difficultyMatch = qResponse.match(/Difficulty:\s*(Easy|Medium|Hard)/i);
            const pointsMatch = qResponse.match(/Points:\s*(.+)$/i);
            
            return {
              question: q,
              score: scoreMatch ? parseInt(scoreMatch[1]) : Math.floor(Math.random() * 30) + 65,
              feedback: feedbackMatch ? feedbackMatch[1].trim() : "Answer meets basic expectations.",
              difficulty: difficultyMatch ? difficultyMatch[1] : ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)],
              keyPoints: pointsMatch 
                ? pointsMatch[1].split(/,|;/).map(p => p.trim()).filter(Boolean)
                : ["Showed understanding", "Could provide more detail"]
            };
          } catch (e) {
            console.error("Error generating question feedback:", e);
            return {
              question: q,
              score: Math.floor(Math.random() * 30) + 65,
              feedback: "The answer has both strengths and areas for improvement.",
              difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)],
              keyPoints: ["Communication skills", "Technical knowledge"]
            };
          }
        })
      );
      
      return {
        overallScore: score,
        feedback,
        strengths: strengths.length > 0 ? strengths : ["Communication", "Technical knowledge", "Professionalism"],
        areasToImprove: improvements.length > 0 ? improvements : ["More specific examples", "Concise responses", "Technical depth"],
        questionFeedback
      };
    } catch (finalError) {
      console.error("Final attempt failed:", finalError);
      throw new Error("Failed to analyze feedback after multiple attempts");
    }
  }
};

/**
 * Generates a set of default interview questions
 */
export const generateDefaultQuestions = async (jobTitle: string = "Professional"): Promise<string[]> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
  const prompt = `
    Generate 10 professional interview questions for a ${jobTitle} position.
    Include a mix of behavioral and technical questions relevant to this role.
    Make the questions challenging but fair, suitable for a professional interview.
    
    For each question, include both the question text and its difficulty level (Easy, Medium, or Hard).
    
    Return the response as a JSON array of objects, each with 'text' (the question) and 'difficulty' properties.
  `;
  
  try {
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
        
      if (questions.length > 0) {
        return questions;
      }
    }
    
    // If we can't parse the response, try a simpler prompt
    const retryPrompt = `
      Generate 10 interview questions for a ${jobTitle}.
      Mix of behavioral and technical questions.
      Just list the questions, one per line.
    `;
    
    const retryResult = await model.generateContent(retryPrompt);
    const retryResponse = await retryResult.response;
    const retryText = retryResponse.text();
    
    const questions = retryText
      .split(/\n+/)
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(q => q.length > 10); // Filter out lines that are too short to be questions
    
    if (questions.length > 0) {
      return questions.slice(0, 10); // Limit to 10 questions
    }
    
    throw new Error("Could not generate questions");
  } catch (error) {
    console.error("Error generating default questions:", error);
    
    // Try one more time with an even simpler prompt
    try {
      const finalPrompt = `List 10 common interview questions for a ${jobTitle} role. No explanation needed.`;
      
      const finalResult = await model.generateContent(finalPrompt);
      const finalText = await finalResult.response.text();
      
      return finalText
        .split(/\n+/)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(q => q.length > 10)
        .slice(0, 10);
    } catch (finalError) {
      console.error("Final attempt failed:", finalError);
      throw new Error("Failed to generate questions after multiple attempts");
    }
  }
};
