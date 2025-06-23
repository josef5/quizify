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
  temperature: z
    .number({ required_error: "Required" })
    .min(0, { message: "Enter a value between 0 and 2.0" })
    .max(2, { message: "Enter a value between 0 and 2.0" }),
});

export type MainFormValues = z.infer<typeof MainFormSchema>;
