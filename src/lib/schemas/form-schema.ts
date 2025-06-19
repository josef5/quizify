import { z } from "zod";

export const mainFormSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  questionCount: z.number().refine((val) => [5, 10, 15, 20].includes(val), {
    message: "Question count must be 5, 10, 15, or 20",
  }),
  // .default(5),
  model: z.enum(["gpt-3.5-turbo", "gpt-4o", "gpt-4o-mini"]),
  // .default("gpt-4o-mini"),
  temperature: z
    .number({ required_error: "Required" })
    .min(0, { message: "Enter a value between 0 and 2.0" })
    .max(2, { message: "Enter a value between 0 and 2.0" }),
});

export type MainFormValues = z.infer<typeof mainFormSchema>;
