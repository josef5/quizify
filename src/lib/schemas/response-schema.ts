import { z } from "zod";

export const QuestionSchema = z.object({
  text: z.string(),
  correctAnswer: z.string(),
  incorrectAnswers: z.array(z.string()),
});

export type QuestionSchemaType = z.infer<typeof QuestionSchema>;

export const ResponseDataSchema = z.object({
  questions: z.array(QuestionSchema),
});

export type ResponseData = z.infer<typeof ResponseDataSchema>;
