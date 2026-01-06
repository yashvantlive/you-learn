export type QuizMode = "instant" | "exam";

export type QuestionStatus = 
  | "not-visited" 
  | "not-answered" 
  | "answered" 
  | "marked-review" 
  | "answered-marked";

export interface QuestionState {
  questionId: string;
  status: QuestionStatus;
  selectedAnswer: string | null;
  timeTaken: number;
  visitCount: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  chapter: string;
  difficulty: string;
  marks: number;
  explanation?: string;
}

export interface ExamSummary {
  totalQuestions: number;
  answered: number;
  notAnswered: number;
  markedForReview: number;
  notVisited: number;
  answeredAndMarked: number;
}

export const QUESTION_COLORS = {
  "not-visited": { bg: "#F3F4F6", text: "#000", border: "#E5E7EB", label: "Not Visited" }, 
  "not-answered": { bg: "#FEF2F2", text: "#991B1B", border: "#EF4444", label: "Not Answered" }, 
  "answered": { bg: "#ECFDF5", text: "#065F46", border: "#10B981", label: "Answered" }, 
  "marked-review": { bg: "#F5F3FF", text: "#5B21B6", border: "#8B5CF6", label: "Marked for Review" }, 
  "answered-marked": { bg: "#FFFBEB", text: "#92400E", border: "#F59E0B", label: "Ans & Marked" } 
};

export function calculateQuestionStatus(visited: boolean, answered: boolean, marked: boolean): QuestionStatus {
  if (!visited) return "not-visited";
  if (answered && marked) return "answered-marked";
  if (answered) return "answered";
  if (marked) return "marked-review";
  return "not-answered";
}

export function getExamSummary(questionStates: Map<string, QuestionState>): ExamSummary {
  let s = { totalQuestions: questionStates.size, answered: 0, notAnswered: 0, markedForReview: 0, notVisited: 0, answeredAndMarked: 0 };
  questionStates.forEach((state) => {
    switch (state.status) {
      case "answered": s.answered++; break;
      case "not-answered": s.notAnswered++; break;
      case "marked-review": s.markedForReview++; break;
      case "not-visited": s.notVisited++; break;
      case "answered-marked": s.answeredAndMarked++; break;
    }
  });
  return s;
}