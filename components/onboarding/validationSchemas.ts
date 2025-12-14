import { z } from "zod";

const phoneRegex = /^[0-9]{10}$/; // basic 10-digit number

export const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  contact_number: z
    .string()
    .regex(phoneRegex, "Phone number must be 10 digits"),
  occupation: z.string().min(1, "Select an occupation"),
  tools: z.array(z.string()).min(1, "Select at least one tool"),
  experience_level: z.enum([
    "beginner",
    "intermediate",
    "advanced",
    "no_experience",
  ]),
  subscription_tutorials: z.boolean().optional(),
  subscription_newsletter: z.boolean().optional(),
});

export type ProfileData = z.infer<typeof profileSchema>;
