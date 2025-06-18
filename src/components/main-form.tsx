import { type MainFormValues, mainFormSchema } from "@/lib/schemas/form-schema";
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

function MainForm({ onSubmit }: { onSubmit: (data: MainFormValues) => void }) {
  const form = useForm<MainFormValues>({
    resolver: zodResolver(mainFormSchema),
    mode: "onChange",
    defaultValues: {
      prompt: "",
      questionCount: 5,
    },
  });

  const {
    control,
    // formState: { isValid },
  } = form;

  function handleSubmit(data: MainFormValues) {
    onSubmit(data);
  }

  // const models = mainFormSchema.shape.questionCount._def.values;
  const questionCount = [5, 10, 15, 20].map((count) => count.toString());

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={control}
            name="prompt"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel className="flex text-xs">
                  Quiz Subject
                  <FormMessage className="text-xs" />
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="e.g. Roman Emperors"
                    rows={10}
                    className="border-none"
                  />
                </FormControl>
              </FormItem>
            )}
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
                        // Convert number to string for the Select component
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
          </div>
          <Button
            type="submit"
            /* disabled={!isValid} */ className="w-full cursor-pointer bg-blue-500 text-white hover:bg-blue-600"
          >
            Quizify
          </Button>
        </form>
      </Form>
    </FormProvider>
  );
}

export default MainForm;
