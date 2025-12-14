import api from "./axios";

export interface waitlistSubscriptionResponse {
  message: string;
  data: {
    email: string;
    status: "subscribed" | string;
    createdAt: string; // ISO date string
  };
}

export interface NewsletterSubscriptionResponse {
  message: string;
  data: {
    email: string;
    status?: "subscribed" | string;
    emails_sent?: number;
    createdAt?: string; // ISO date string
  };
}

export const landingApi = {
  joinWaitList: async (
    email: string
  ): Promise<waitlistSubscriptionResponse> => {
    const response = await api.post("/landing/waitlist", { email });
    return response.data;
  },

  joinNewsLetter: async (
    email: string
  ): Promise<NewsletterSubscriptionResponse> => {
    const response = await api.post("/landing/subscribe", { email });
    return response.data;
  },
};
