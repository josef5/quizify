import { type MainFormValues, MainFormSchema } from "@/lib/schemas/form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleX, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  DIFFICULTY_LABELS,
  QUIZ_PROMPTS_LOCAL_STORAGE_KEY,
} from "@/lib/constants";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

function MainForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: MainFormValues) => void;
  isLoading?: boolean;
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
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value.toString()}
                        defaultValue={field.value.toString()}
                      >
                        <SelectTrigger
                          className="dark:hover:bg-dropdown-bg bg-dropdown-bg dark:bg-dropdown-bg ml-2 h-5 gap-1 rounded-xs border-none py-2 pr-1 pl-2 text-xs shadow dark:shadow-none"
                          data-size="custom"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="w-full">
                          {questionCount.map((count) => (
                            <SelectItem key={count} value={count}>
                              {count}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value.toString()}
                        defaultValue={field.value.toString()}
                      >
                        <SelectTrigger
                          className="dark:hover:bg-dropdown-bg bg-dropdown-bg dark:bg-dropdown-bg ml-2 h-5 gap-1 rounded-xs border-none py-2 pr-1 pl-2 text-xs shadow dark:shadow-none"
                          data-size="custom"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="w-full">
                          {models.map((count) => (
                            <SelectItem key={count} value={count}>
                              {count}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <SelectTrigger
                          className="dark:hover:bg-dropdown-bg bg-dropdown-bg dark:bg-dropdown-bg ml-2 h-5 gap-1 rounded-xs border-none py-2 pr-1 pl-2 text-xs shadow dark:shadow-none"
                          data-size="custom"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="w-full">
                          {diffulties.map((difficulty) => (
                            <SelectItem key={difficulty} value={difficulty}>
                              {DIFFICULTY_LABELS[difficulty]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            disabled={!isValid || isLoading}
            className="from-brand-1-lite to-brand-2-lite text-light hover:from-brand-1 hover:to-brand-2 my-4 h-12 w-full cursor-pointer rounded-sm bg-gradient-to-tr font-bold transition-colors duration-200 ease-in-out"
          >
            <div className="w-4">
              {/* Balance spinner on other side of label */}
            </div>
            Quizify
            <div className="ml-1 w-4">
              {isLoading && <LoaderCircle size={16} className="animate-spin" />}
            </div>
          </Button>

          {promptStore.length > 0 && (
            <div className="my-8">
              <h2 className="mb-2 text-xs font-normal">
                Previous Quiz Subjects:
              </h2>
              <ul className="flex flex-wrap gap-2 pl-0">
                {promptStore.map((prompt, index) => (
                  <li key={index} className="list-none">
                    <Badge
                      variant="secondary"
                      className="dark:bg-badge-bg text-dark dark:text-light bg-badge-bg cursor-pointer rounded-[3px] px-1"
                      onClick={(event) => {
                        event.preventDefault();

                        setValue("prompt", prompt, { shouldValidate: true });
                      }}
                    >
                      {prompt}
                      <div
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();

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
                        <CircleX
                          size={12}
                          className="text-gray-400 hover:text-gray-200"
                        />
                      </div>
                    </Badge>
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
