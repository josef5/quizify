import { TOAST_OPTIONS } from "@/lib/constants";
import {
  SettingsFormSchema,
  SettingsFormValues,
} from "@/lib/schemas/form-schema";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { useStore } from "@/store/useStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthError } from "@supabase/supabase-js";
import { Moon, Sun, X } from "lucide-react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "./ui/core/form";
import { Input } from "./ui/core/input";
import SaveButton from "./ui/save-button";
import SettingsButton from "./ui/settings-button";

function Settings() {
  const isOpen = useStore((state) => state.isSettingsOpen);
  const setIsOpen = useStore((state) => state.setIsSettingsOpen);
  const isDarkMode = useStore((state) => state.isDarkMode);
  const toggleDarkMode = useStore((state) => state.toggleDarkMode);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const apiKey = useProfileStore((state) => state.apiKey);
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const clearUser = useAuthStore((state) => state.clearUser);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(SettingsFormSchema),
    mode: "onChange",
    defaultValues: {
      apiKey,
    },
  });

  const {
    control,
    formState: { isValid, isDirty },
  } = form;

  async function handleSubmit({ apiKey }: SettingsFormValues) {
    try {
      if (!user) throw new AuthError("No user");

      updateProfile(user.id, { apiKey });

      setIsOpen(false);
    } catch (error) {
      const errorMessage = `Failed to update profile: ${error instanceof Error ? error.message : "Unknown error"}`;

      console.error(errorMessage);
      toast.error(errorMessage, TOAST_OPTIONS.error);
    }
  }

  async function handleSignOut() {
    const { error } = await signOut();

    if (error) {
      console.error("Sign Out Error:", error);

      clearUser();
    } else {
      toast.success("Signed out successfully", TOAST_OPTIONS.success);
    }
  }

  useEffect(() => {
    if (apiKey) {
      form.reset({
        apiKey,
      });
    }
  }, [apiKey]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [isOpen]);

  return (
    <aside
      className={cn(
        "bg-settings-background text-settings-foreground overflow-hidden px-5 shadow-[inset_0_-1px_5px_1px_rgba(0,0,0,0.25)] transition-all duration-300 ease-in-out",
        isOpen ? "h-28 sm:h-10" : "h-0",
      )}
      aria-expanded={isOpen}
      aria-label="Settings"
    >
      <div className="pt-4 sm:pt-2">
        <FormProvider {...form}>
          <Form {...form}>
            <div className="flex flex-1 flex-row items-center gap-3 sm:gap-2">
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
                              "dark:bg-input border-settings-accent/20 h-6 rounded-xs pr-0 pl-2 text-xs autofill:shadow-[inset_0_0_0px_1000px_hsl(var(--background))] md:text-xs",
                              form.formState.errors.apiKey
                                ? "ring-destructive ring-2 ring-offset-0"
                                : "",
                            )}
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                          />
                        </FormControl>
                      </FormItem>
                    );
                  }}
                />
                <div className="mb-0.25 flex w-full flex-row items-center gap-2 sm:mb-0 sm:w-auto">
                  <SaveButton
                    disabled={!isValid || !isDirty}
                    data-action="save-api-key"
                  >
                    Save
                  </SaveButton>
                </div>
              </form>
              <SaveButton onClick={handleSignOut}>Sign Out</SaveButton>
              <div className="flex flex-col-reverse justify-between gap-2 sm:flex-row">
                <SettingsButton
                  aria-label="Toggle dark mode"
                  onClick={() => toggleDarkMode()}
                >
                  {isDarkMode ? <Sun /> : <Moon />}
                </SettingsButton>
                <SettingsButton
                  aria-label="Close settings"
                  onClick={() => setIsOpen(false)}
                >
                  <X />
                </SettingsButton>
              </div>
            </div>
          </Form>
        </FormProvider>
      </div>
    </aside>
  );
}

export default Settings;
