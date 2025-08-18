import { TOAST_OPTIONS } from "@/lib/constants";
import { AuthFormSchema, AuthFormValues } from "@/lib/schemas/form-schema";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
import { Switch } from "./ui/switch";

function Auth() {
  const isOpen = useStore((state) => state.isSettingsOpen);
  const setIsOpen = useStore((state) => state.setIsSettingsOpen);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(AuthFormSchema),
    // mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { control } = form;

  function handleSubmit(
    { email, password }: AuthFormValues,
    event?: React.BaseSyntheticEvent,
  ) {
    event?.preventDefault();
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [isOpen]);

  return (
    <aside
      className={cn(
        "bg-settings-background text-settings-foreground transition-height overflow-hidden px-5 shadow-[inset_0_-1px_5px_1px_rgba(0,0,0,0.25)] duration-300 ease-in-out",
        isOpen ? "h-28 sm:h-10" : "h-0",
      )}
      aria-expanded={isOpen}
      aria-label="Login or Sign Up"
    >
      <div className="mx-auto max-w-xl pt-4 sm:pt-2">
        <FormProvider {...form}>
          <Form {...form}>
            <div className="flex flex-1 flex-row gap-3 sm:gap-2">
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex flex-1 flex-col items-center gap-2 sm:flex-row"
              >
                <FormField
                  control={control}
                  name="email"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex w-full flex-1 flex-col items-start gap-2 sm:flex-row sm:items-center">
                        <FormLabel className="flex-shrink-0 text-xs">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="email@example.com"
                            {...field}
                            onChange={(event) =>
                              field.onChange(event.target.value)
                            }
                            className={cn(
                              "dark:bg-input border-settings-accent/20 h-6 rounded-xs pr-0 pl-2 text-xs autofill:shadow-[inset_0_0_0px_1000px_hsl(var(--background))] md:text-xs",
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
                <FormField
                  control={control}
                  name="password"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex w-full flex-1 flex-col items-start gap-2 sm:flex-row sm:items-center">
                        <FormLabel className="flex-shrink-0 text-xs">
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••"
                            {...field}
                            onChange={(event) =>
                              field.onChange(event.target.value)
                            }
                            className={cn(
                              "dark:bg-input border-settings-accent/20 h-6 rounded-xs pr-0 pl-2 text-xs autofill:shadow-[inset_0_0_0px_1000px_hsl(var(--background))] md:text-xs",
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
                <SaveButton>
                  {mode === "login" ? "Login" : "Sign Up"}
                </SaveButton>
                <Switch className="dark:data-[state=unchecked]:bg-settings-accent relative my-0 scale-60 rotate-90" />
              </form>
            </div>
          </Form>
        </FormProvider>
      </div>
    </aside>
  );
}

export default Auth;
