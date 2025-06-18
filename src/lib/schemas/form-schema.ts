import { z } from "zod";

export const mainFormSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  questionCount: z.number().refine((val) => [5, 10, 15, 20].includes(val), {
    message: "Question count must be 5, 10, 15, or 20",
  }),
});

export type MainFormValues = z.infer<typeof mainFormSchema>;
