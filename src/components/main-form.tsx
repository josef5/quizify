import { DIFFICULTY_LABELS } from "@/lib/constants";
import { type MainFormValues, MainFormSchema } from "@/lib/schemas/form-schema";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/core/form";
import { Textarea } from "./ui/core/textarea";
import PromptBadge from "./ui/prompt-badge";
import PromptSelect from "./ui/prompt-select";
import StartButton from "./ui/start-button";

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
  const questionCount = MainFormSchema.shape.questionCount._def.options.map(
    (opt: { value: number }) => opt.value.toString(),
  );

  const user = useAuthStore((state) => state.user);
  const savedPrompts = useProfileStore((state) => state.prompts);
  const updateProfile = useProfileStore((state) => state.updateProfile);

  async function updatePromptStore(prompt: string) {
    if (!user) return;
    if (savedPrompts.includes(prompt)) return;

    await updateProfile(user.id, {
      prompts: [...(savedPrompts ?? []), prompt],
    });
  }

  async function handleSubmit(data: MainFormValues) {
    await updatePromptStore(data.prompt);

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
                      className="bg-textarea dark:bg-textarea h-56 border-none p-4 font-normal md:text-xl"
                      aria-label="Prompt"
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
                        aria-label="Select number of questions"
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
                        aria-label="Select OpenAI model"
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
                        aria-label="Select quiz difficulty"
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
            aria-label="Start quiz"
          />

          {/* TODO: Add a spinner while profile loads */}
          {savedPrompts.length > 0 && (
            <div className="my-8">
              <h2 className="mb-2 text-xs font-normal">
                Previous Quiz Subjects:
              </h2>
              <ul className="flex flex-wrap gap-2 pl-0">
                {savedPrompts
                  .slice()
                  .sort((a, b) =>
                    a.toLowerCase().localeCompare(b.toLowerCase()),
                  )
                  .map((prompt, index) => (
                    <li key={index} className="list-none">
                      <PromptBadge
                        onClick={(event) => {
                          event.preventDefault(); // Prevent form submission
                          setValue("prompt", prompt, { shouldValidate: true });
                        }}
                        onDelete={(event) => {
                          event.preventDefault(); // Prevent form submission
                          event.stopPropagation(); // Prevent click from bubbling up

                          updateProfile(user!.id, {
                            prompts: savedPrompts.filter((p) => p !== prompt),
                          });
                        }}
                        tabIndex={0}
                      >
                        {/* TODO: Truncate long prompts */}
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
