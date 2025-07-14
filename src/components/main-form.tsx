import {
  DIFFICULTY_LABELS,
  QUIZ_PROMPTS_LOCAL_STORAGE_KEY,
} from "@/lib/constants";
import { type MainFormValues, MainFormSchema } from "@/lib/schemas/form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import PromptBadge from "./ui/prompt-badge";
import PromptSelect from "./ui/prompt-select";
import StartButton from "./ui/start-button";
import { Textarea } from "./ui/textarea";

function MainForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: MainFormValues) => void;
  isLoading: boolean;
}) {
  const form = useForm<MainFormValues>({
    resolver: zodResolver(MainFormSchema),
    defaultValues: {
      prompt: "",
      questionCount: 5,
      model: "gpt-4o-mini",
      difficulty: "hard",
    },
  });

  const {
    control,
    formState: { isValid },
    setValue,
  } = form;

  const models = MainFormSchema.shape.model._def.values;
  const diffulties = MainFormSchema.shape.difficulty._def.values;
  const questionCount = [5, 10, 15, 20].map((count) => count.toString());

  // Initialize promptStore from localStorage or empty array
  // Use a function to avoid re-initialization on every render
  const [promptStore, setPromptStore] = useState<string[]>(() => {
    const storedPrompts = localStorage.getItem(QUIZ_PROMPTS_LOCAL_STORAGE_KEY);
    return storedPrompts ? JSON.parse(storedPrompts) : [];
  });

  function updatePromptStore(prompt: string) {
    if (!promptStore.includes(prompt)) {
      setPromptStore((prev) => [...prev, prompt]);

      localStorage.setItem(
        QUIZ_PROMPTS_LOCAL_STORAGE_KEY,
        JSON.stringify([...promptStore, prompt]),
      );
    }
  }

  function handleSubmit(data: MainFormValues) {
    updatePromptStore(data.prompt);

    onSubmit(data);
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={control}
            name="prompt"
            render={({ field }) => {
              return (
                <FormItem className="flex flex-col gap-1">
                  <FormLabel className="mb-2 flex text-xs font-normal">
                    Quiz Subject
                    <FormMessage className="text-xs" />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="e.g. Capital cities"
                      rows={10}
                      className="bg-textarea-bg dark:bg-textarea-bg h-36 border-none p-4 font-normal md:text-xl"
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />
          <div className="mt-4 flex flex-col items-end justify-end gap-4 sm:flex-row sm:items-center">
            <FormField
              control={control}
              name="questionCount"
              render={({ field }) => (
                <FormItem className="flex gap-1">
                  <FormLabel className="flex text-xs font-normal">
                    Questions
                  </FormLabel>
                  <div className="my-0 flex-shrink-0 sm:my-4">
                    <FormControl>
                      <PromptSelect
                        options={questionCount}
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value.toString()}
                        defaultValue={field.value.toString()}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="model"
              render={({ field }) => (
                <FormItem className="flex gap-1">
                  <FormLabel className="flex text-xs font-normal">
                    Model
                  </FormLabel>
                  <div className="my-0 flex-shrink-0 sm:my-4">
                    <FormControl>
                      <PromptSelect
                        options={models}
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value}
                        defaultValue={field.value}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="difficulty"
              render={({ field }) => (
                <FormItem className="flex gap-1">
                  <FormLabel className="flex text-xs font-normal">
                    Difficulty
                  </FormLabel>
                  <div className="my-0 flex-shrink-0 sm:my-4">
                    <FormControl>
                      <PromptSelect
                        options={diffulties}
                        optionLabels={DIFFICULTY_LABELS}
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value}
                        defaultValue={field.value}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <StartButton
            label="Quizify"
            isLoading={isLoading}
            disabled={!isValid || isLoading}
          />

          {promptStore.length > 0 && (
            <div className="my-8">
              <h2 className="mb-2 text-xs font-normal">
                Previous Quiz Subjects:
              </h2>
              <ul className="flex flex-wrap gap-2 pl-0">
                {promptStore.map((prompt, index) => (
                  <li key={index} className="list-none">
                    <PromptBadge
                      onClick={(event) => {
                        event.preventDefault(); // Prevent form submission
                        setValue("prompt", prompt, { shouldValidate: true });
                      }}
                      onDelete={(event) => {
                        event.preventDefault(); // Prevent form submission
                        event.stopPropagation(); // Prevent click from bubbling up

                        setPromptStore((prev) =>
                          prev.filter((p) => p !== prompt),
                        );

                        localStorage.setItem(
                          QUIZ_PROMPTS_LOCAL_STORAGE_KEY,
                          JSON.stringify(
                            promptStore.filter((p) => p !== prompt),
                          ),
                        );
                      }}
                    >
                      {prompt}
                    </PromptBadge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </Form>
    </FormProvider>
  );
}

export default MainForm;
