import { decrypt } from "@/lib/encryption";
import {
  SettingsFormSchema,
  SettingsFormValues,
} from "@/lib/schemas/form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Moon, Sun, X } from "lucide-react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useStore } from "@/store/useStore";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

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
    // Decrypt the API key asynchronously when store value updates
    decrypt(encryptedApiKey).then((apiKey) => {
      if (!apiKey) return;

      // Reset the form with the decrypted API key
      form.reset({ apiKey });
    });
  }, [form, encryptedApiKey]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [isOpen]);

  return (
    <div
      className={cn(
        "bg-settings-1 overflow-hidden px-5 shadow-[inset_0_-1px_5px_1px_rgba(0,0,0,0.25)] transition-all duration-300 ease-in-out",
        isOpen ? "h-10" : "h-0",
      )}
    >
      <div className="flex items-center gap-2 pt-2">
        <FormProvider {...form}>
          <Form {...form}>
            <div className="flex flex-1 items-center gap-2">
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex flex-1 items-center gap-2"
              >
                <FormField
                  control={control}
                  name="apiKey"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-1 items-center gap-2">
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
                            className="dark:bg-input/60 h-6 rounded-xs border-none pr-0 pl-2 text-xs autofill:shadow-[inset_0_0_0px_1000px_hsl(var(--background))] md:text-xs"
                          />
                        </FormControl>
                      </FormItem>
                    );
                  }}
                />
                <Button
                  variant="secondary"
                  size={"sm"}
                  className="dark:hover:bg-input/60 bg-input hover:bg-input dark:active:border-brand-1 box-border h-6 cursor-pointer rounded-sm border-2 border-transparent px-2.5 text-xs text-white dark:hover:border-2 dark:hover:border-neutral-400"
                  disabled={!isValid || !isDirty}
                  data-action="use-but-dont-save-api-key"
                  type="submit"
                >
                  Use now
                </Button>
                <Button
                  variant="secondary"
                  size={"sm"}
                  className="dark:hover:bg-input/60 bg-input hover:bg-input dark:active:border-brand-1 box-border h-6 cursor-pointer rounded-sm border-2 border-transparent px-2.5 text-xs text-white dark:hover:border-2 dark:hover:border-neutral-400"
                  type="submit"
                  disabled={!isValid || !isDirty}
                  data-action="save-api-key"
                >
                  Save
                </Button>
              </form>
              <Button
                variant="ghost"
                size={"sm"}
                className="dark:active:border-brand-1 h-6.5 cursor-pointer rounded-sm border-2 text-xs text-neutral-300 dark:hover:border-neutral-400 dark:hover:bg-transparent"
                onClick={() => toggleDarkMode()}
              >
                {isDarkMode ? <Sun /> : <Moon />}
              </Button>
              <Button
                variant="ghost"
                size={"sm"}
                className="dark:active:border-brand-1 h-6.5 cursor-pointer rounded-sm border-2 text-xs text-neutral-300 dark:hover:border-neutral-400 dark:hover:bg-transparent"
                onClick={() => setIsOpen(false)}
              >
                <X />
              </Button>
            </div>
          </Form>
        </FormProvider>
      </div>
    </div>
  );
}

export default Settings;
