import { OpenAI } from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { toast } from "sonner";
import { DIFFICULTY_SETTINGS, TOAST_OPTIONS } from "../lib/constants";
import { decryptSync } from "../lib/encryption";
import { MainFormValues } from "../lib/schemas/form-schema";
import { ResponseDataSchema } from "../lib/schemas/response-schema";
import { useStore } from "../store/useStore";
import type { Quiz } from "../types";

export function useFetchQuiz() {
  const encryptedApiKey = useStore((state) => state.encryptedApiKey);
  const setIsSettingsOpen = useStore((state) => state.setIsSettingsOpen);

  const fetchQuiz = async ({
    prompt,
    questionCount,
    model,
    difficulty,
  }: MainFormValues): Promise<Quiz | null> => {
    try {
      if (!encryptedApiKey) {
        setIsSettingsOpen(true);
        throw new Error("API key is not set");
      }

      const decryptedApiKey = decryptSync(encryptedApiKey);
      const difficultySetting = DIFFICULTY_SETTINGS[difficulty];

      if (!decryptedApiKey) {
        throw new Error("Decrypted API key is empty");
      }

      const openai = new OpenAI({
        apiKey: decryptedApiKey,
        dangerouslyAllowBrowser: true,
      });

      const response = await openai.responses.parse({
        model,
        temperature: difficultySetting.temperature,
        instructions: `You are a expert in multiple choice quiz writing. Write a multiple choice quiz based on the input. The quiz should have ${questionCount} questions, each with 1 correct answer and 3 wrong answers. The questions should reflect ${difficultySetting.description}. Return the quiz in json format`,
        input: prompt,
        text: {
          format: zodTextFormat(ResponseDataSchema, "event"),
        },
      });

      if (!response.output_parsed) {
        throw new Error("No quiz data returned from OpenAI API");
      }

      return response.output_parsed as Quiz;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while fetching the quiz.",
        TOAST_OPTIONS.error,
      );

      console.error(error);
      return null;
    }
  };

  return { fetchQuiz };
}
