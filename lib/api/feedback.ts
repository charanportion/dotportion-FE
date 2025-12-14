// lib/api/feedback.ts
import api from "./axios";

export interface CreateIdeaDTO {
  type: "idea";
  message: string;
  title?: string;
}

export interface CreateIssueDTO {
  type: "issue";
  message: string;
  subject: string;
  project: string;
  service: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface FeedbackResponse {
  message: string;
  id?: string;
  createdAt?: string;
}

export type CreateFeedbackDTO = CreateIdeaDTO | CreateIssueDTO;

export const feedbackApi = {
  createFeedback: async (
    payload: CreateFeedbackDTO
  ): Promise<FeedbackResponse> => {
    const response = await api.post("/feedback", payload);
    return response.data;
  },
};
