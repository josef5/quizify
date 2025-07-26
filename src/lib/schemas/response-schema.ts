import { z } from "zod";

export const ResponseSchema = z.object({
  id: z.string(),
  object: z.literal("chat.completion"),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.literal("assistant"),
        content: z.string(),
      }),
      finish_reason: z.string().nullable(),
    }),
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

export type Response = z.infer<typeof ResponseSchema>;

export const QuestionSchema = z.object({
  questionNumber: z.number(),
  question: z.string(),
  correctAnswer: z.string(),
  incorrectAnswers: z.array(z.string()),
});

export type Question = z.infer<typeof QuestionSchema>;

export const ResponseDataSchema = z.object({
  questions: z.array(QuestionSchema),
});

export type ResponseData = z.infer<typeof ResponseDataSchema>;
