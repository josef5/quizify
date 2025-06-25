import { type MainFormValues, MainFormSchema } from "@/lib/schemas/form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { CircleX, LoaderCircle } from "lucide-react";

// TODO: Error handling

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
      temperature: 0.7, // Default temperature value
    },
  });

  const {
    control,
    formState: { isValid },
    setValue,
  } = form;

  const models = MainFormSchema.shape.model._def.values;
  const questionCount = [5, 10, 15, 20].map((count) => count.toString());
  const LOCAL_STORAGE_KEY = "quizifyPrompts"; // TODO: Move to better place

  // Initialize promptStore from localStorage or empty array
  // Use a function to avoid re-initialization on every render
  const [promptStore, setPromptStore] = useState<string[]>(() => {
    const storedPrompts = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedPrompts ? JSON.parse(storedPrompts) : [];
  });

  function updatePromptStore(prompt: string) {
    if (!promptStore.includes(prompt)) {
      setPromptStore((prev) => [...prev, prompt]);

      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify([...promptStore, prompt]),
      );
    }
  }

  function handleSubmit(data: MainFormValues) {
    updatePromptStore(data.prompt);

    onSubmit(data);
  }

  // TODO: Consolidate colours
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
                      className="h-36 border-none p-4 font-normal md:text-xl"
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />
          <div className="flex items-center justify-end gap-2">
            <FormField
              control={control}
              name="questionCount"
              render={({ field, formState: { errors } }) => (
                <FormItem className="flex gap-1">
                  <FormLabel className="flex text-xs font-normal">
                    Questions
                    {errors?.questionCount?.message &&
                      `. ${errors?.questionCount?.message}`}
                  </FormLabel>
                  <div className="my-4 flex-shrink-0">
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value.toString()}
                        defaultValue={field.value.toString()}
                      >
                        <SelectTrigger
                          className="dark:bg-input dark:hover:bg-input ml-2 h-5 gap-1 rounded-xs border-none py-2 pr-1 pl-2 text-xs"
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
              render={({ field, formState: { errors } }) => (
                <FormItem className="flex gap-1">
                  <FormLabel className="flex text-xs font-normal">
                    Model
                    {errors?.model?.message && `. ${errors?.model?.message}`}
                  </FormLabel>
                  <div className="my-4 flex-shrink-0">
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value.toString()}
                        defaultValue={field.value.toString()}
                      >
                        <SelectTrigger
                          className="dark:bg-input dark:hover:bg-input ml-2 h-5 gap-1 rounded-xs border-none py-2 pr-1 pl-2 text-xs"
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
              name="temperature"
              render={({ field, formState: { errors } }) => (
                <FormItem className="flex gap-1">
                  <FormLabel className="flex text-xs font-normal">
                    Temperature
                    {errors?.temperature?.message &&
                      `. ${errors?.temperature?.message}`}
                  </FormLabel>
                  <div className="my-4 flex-shrink-0">
                    <FormControl>
                      <Input
                        type="number"
                        step={0.1}
                        placeholder="0.7"
                        min={0.0}
                        max={2.0}
                        {...field}
                        onChange={(event) =>
                          field.onChange(Number(event.target.value))
                        }
                        className="dark:bg-input/60 dark:hover:bg-input/60 h-6 w-full rounded-xs border-none pr-0 pl-2 text-xs autofill:shadow-[inset_0_0_0px_1000px_hsl(var(--background))] md:text-xs"
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            disabled={!isValid || isLoading}
            className="my-4 h-12 w-full cursor-pointer rounded-sm bg-gradient-to-tr from-blue-500 to-blue-600 font-bold text-white hover:from-blue-600"
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
                      className="bg-input dark:bg-input cursor-pointer rounded-[3px] px-1 text-white"
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
                            LOCAL_STORAGE_KEY,
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
