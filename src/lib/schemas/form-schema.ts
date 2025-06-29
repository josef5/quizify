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
  difficulty: z.enum(["easy", "medium", "hard"]),
});

export type MainFormValues = z.infer<typeof MainFormSchema>;

export const SettingsFormSchema = z.object({
  apiKey: z.string().min(156, "OpenAI API Key is required"),
});

export type SettingsFormValues = z.infer<typeof SettingsFormSchema>;
