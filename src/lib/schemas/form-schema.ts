import { z } from "zod";

export const MainFormSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  questionCount: z.union([
    z.literal(5),
    z.literal(10),
    z.literal(15),
    z.literal(20),
  ]),
  model: z.enum(["gpt-3.5-turbo", "gpt-4o", "gpt-4o-mini"]),
  difficulty: z.enum(["easy", "medium", "hard", "harder"]),
});

export type MainFormValues = z.infer<typeof MainFormSchema>;

export const AuthFormSchema = z.object({
  email: z
    .string()
    .email()
    .min(5, "Email is required")
    .email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type AuthFormValues = z.infer<typeof AuthFormSchema>;

export const SettingsFormSchema = z.object({
  apiKey: z.string().min(156, "OpenAI API Key is required"),
});

export type SettingsFormValues = z.infer<typeof SettingsFormSchema>;
