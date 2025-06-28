import { Moon, Sun, SunMedium, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  SettingsFormValues,
  SettingsFormSchema,
} from "@/lib/schemas/form-schema";
import { useStore } from "../store/useStore";
import { useEffect } from "react";
import { decrypt } from "@/lib/encryption";

function Settings() {
  const encryptedApiKey = useStore((state) => state.encryptedApiKey);
  const encryptAndSetApiKey = useStore((state) => state.encryptAndSetApiKey);
  const isOpen = useStore((state) => state.isSettingsOpen);
  const setIsOpen = useStore((state) => state.setIsSettingsOpen);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(SettingsFormSchema),
    defaultValues: {
      apiKey: "",
    },
  });

  const {
    control,
    formState: { isValid },
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
    // Decrypt the API key asynchronously when the component mounts
    decrypt(encryptedApiKey).then((apiKey) => {
      if (!apiKey) return;

      // Reset the form with the decrypted API key
      form.reset({ apiKey });
    });
  }, [form, encryptedApiKey]);

  return (
    <div
      className={`overflow-hidden bg-neutral-600 ${isOpen ? "h-10" : "h-0"} px-5 shadow-[inset_0_-1px_5px_1px_rgba(0,0,0,0.25)] transition-all duration-300 ease-in-out`}
    >
      <div className="flex items-center gap-2 pt-2">
        <FormProvider {...form}>
          <Form {...form}>
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
                          className="dark:bg-input/60 dark:hover:bg-input/60 h-6 rounded-xs border-none pr-0 pl-2 text-xs autofill:shadow-[inset_0_0_0px_1000px_hsl(var(--background))] md:text-xs"
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
              <Button
                variant="secondary"
                size={"sm"}
                className="bg-input hover:bg-input h-6 cursor-pointer rounded-sm text-xs text-white"
                  disabled={!isValid || !isDirty}
                  data-action="use-but-dont-save-api-key"
                  type="submit"
              >
                Use now
              </Button>
              <Button
                variant="secondary"
                size={"sm"}
                className="bg-input hover:bg-input h-6 cursor-pointer rounded-sm text-xs text-white"
                type="submit"
                  disabled={!isValid || !isDirty}
                  data-action="save-api-key"
              >
                Save
              </Button>
              <Button
                variant="ghost"
                size={"sm"}
                className="hover:bg-input h-6.5 cursor-pointer rounded-sm border-2 text-xs text-neutral-300"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                <Sun />
                {/* <Moon /> */}
              </Button>
              <Button
                variant="ghost"
                size={"sm"}
                className="hover:bg-input h-6.5 cursor-pointer rounded-sm border-2 text-xs text-white"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                <X />
              </Button>
            </form>
          </Form>
        </FormProvider>
      </div>
    </div>
  );
}

export default Settings;
