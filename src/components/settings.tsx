import { TOAST_OPTIONS } from "@/lib/constants";
import { decryptSync } from "@/lib/encryption";
import {
  SettingsFormSchema,
  SettingsFormValues,
} from "@/lib/schemas/form-schema";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Moon, Sun, X } from "lucide-react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";

function Settings() {
  const encryptedApiKey = useStore((state) => state.encryptedApiKey);
  const encryptAndSetApiKey = useStore((state) => state.encryptAndSetApiKey);
  const encryptAndSaveApiKey = useStore((state) => state.encryptAndSaveApiKey);
  const isOpen = useStore((state) => state.isSettingsOpen);
  const setIsOpen = useStore((state) => state.setIsSettingsOpen);
  const isDarkMode = useStore((state) => state.isDarkMode);
  const toggleDarkMode = useStore((state) => state.toggleDarkMode);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(SettingsFormSchema),
    mode: "onChange",
    defaultValues: {
      apiKey: "",
    },
  });

  const {
    control,
    formState: { isValid, isDirty },
    trigger,
  } = form;

  function handleSubmit(
    { apiKey }: SettingsFormValues,
    event?: React.BaseSyntheticEvent,
  ) {
    const submitter = (event?.nativeEvent as SubmitEvent).submitter;
    const action = submitter?.getAttribute("data-action");

    if (action === "use-but-dont-save-api-key") {
      // If the action is to use the API key without saving, just encrypt and set it
      encryptAndSetApiKey(apiKey);
      setIsOpen(false);
    } else if (action === "save-api-key") {
      // If the action is to save the API key, encrypt and save it
      encryptAndSaveApiKey(apiKey);
      setIsOpen(false);
    }
  }

  useEffect(() => {
    if (!encryptedApiKey) {
      trigger("apiKey");
      return;
    }
    try {
      const decryptedApiKey = decryptSync(encryptedApiKey);

      if (!decryptedApiKey) {
        throw new Error("Decrypted API key is empty");
      }

      form.reset({
        apiKey: decryptedApiKey,
      });
    } catch (error) {
      const errorMessage = `Failed to decrypt API key: ${error instanceof Error ? error.message : "Unknown error"}`;

      console.error(errorMessage);
      toast.error(errorMessage, TOAST_OPTIONS.error);
    }
  }, [form, encryptedApiKey, trigger]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [isOpen]);

  return (
    <div
      className={cn(
        "bg-settings-1 overflow-hidden px-5 shadow-[inset_0_-1px_5px_1px_rgba(0,0,0,0.25)] transition-all duration-300 ease-in-out",
        isOpen ? "h-28 sm:h-10" : "h-0",
      )}
    >
      <div className="pt-4 sm:pt-2">
        <FormProvider {...form}>
          <Form {...form}>
            <div className="flex flex-1 flex-row gap-3 sm:gap-2">
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex flex-1 flex-col items-center gap-2 sm:flex-row"
              >
                <FormField
                  control={control}
                  name="apiKey"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex w-full flex-1 flex-col items-start gap-2 sm:flex-row sm:items-center">
                        <FormLabel className="flex-shrink-0 text-xs">
                          OpenAI API Key
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="abc123..."
                            {...field}
                            onChange={(event) =>
                              field.onChange(event.target.value)
                            }
                            className={cn(
                              "dark:bg-input h-6 rounded-xs border-none pr-0 pl-2 text-xs autofill:shadow-[inset_0_0_0px_1000px_hsl(var(--background))] md:text-xs",
                              form.formState.errors.apiKey
                                ? "ring-destructive ring-2 ring-offset-0"
                                : "",
                            )}
                          />
                        </FormControl>
                      </FormItem>
                    );
                  }}
                />
                <div className="mb-0.25 flex w-full flex-row items-center gap-2 sm:mb-0 sm:w-auto">
                  <Button
                    variant="secondary"
                    size={"sm"}
                    className="bg-input hover:bg-input dark:active:border-brand-1 text-primary dark:hover:border-settings-2 dark:hover:bg-input box-border h-6 grow cursor-pointer rounded-sm border-2 border-transparent px-2.5 text-xs sm:grow-0"
                    disabled={!isValid || !isDirty}
                    data-action="use-but-dont-save-api-key"
                    type="submit"
                  >
                    Use
                  </Button>
                  <Button
                    variant="secondary"
                    size={"sm"}
                    className="bg-input hover:bg-input dark:active:border-brand-1 text-primary dark:hover:border-settings-2 dark:hover:bg-input box-border h-6 grow cursor-pointer rounded-sm border-2 border-transparent px-2.5 text-xs sm:grow-0"
                    type="submit"
                    disabled={!isValid || !isDirty}
                    data-action="save-api-key"
                  >
                    Save
                  </Button>
                </div>
              </form>
              <div className="flex flex-col-reverse justify-between gap-2 sm:flex-row">
                <Button
                  variant="ghost"
                  size={"sm"}
                  className="dark:active:border-brand-1 dark:hover:border-settings-2 text-settings-3 h-6.5 grow cursor-pointer rounded-sm border-2 text-xs dark:hover:bg-transparent"
                  onClick={() => toggleDarkMode()}
                >
                  {isDarkMode ? <Sun /> : <Moon />}
                </Button>
                <Button
                  variant="ghost"
                  size={"sm"}
                  className="dark:active:border-brand-1 dark:hover:border-settings-2 text-settings-3 h-6.5 grow cursor-pointer rounded-sm border-2 text-xs dark:hover:bg-transparent"
                  onClick={() => setIsOpen(false)}
                >
                  <X />
                </Button>
              </div>
            </div>
          </Form>
        </FormProvider>
      </div>
    </div>
  );
}

export default Settings;
