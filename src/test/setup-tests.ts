import { vi } from "vitest";
import sampleQuestions from "./sample-questions.json";

window.scrollTo = vi.fn();

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

vi.mock("@/store/authStore", async () => {
  const actual = (await vi.importActual("@/store/authStore")) as {
    useAuthStore: typeof import("@/store/authStore").useAuthStore;
  };

  console.log("Auth store called");

  return {
    useAuthStore: vi.fn((selector) => {
      // Get the original store state/methods
      const originalStore = actual.useAuthStore((state) => state);

      return selector({
        ...originalStore, // Keep all original methods and values
        user: {
          id: "test-user-id",
          email: "test@example.com",
        },
        initialize: vi.fn(() => Promise.resolve()),
        signIn: vi.fn(() => Promise.resolve()),
        signOut: vi.fn(() => Promise.resolve()),
        signUp: vi.fn(() => Promise.resolve()),
        clearUser: vi.fn(),
      });
    }),
  };
});

vi.mock("@/store/profileStore", async () => {
  const actual = (await vi.importActual("@/store/profileStore")) as {
    useProfileStore: typeof import("@/store/profileStore").useProfileStore;
  };

  console.log("Profile store called");

  return {
    useProfileStore: vi.fn((selector) => {
      // Get the original store state/methods
      const originalStore = actual.useProfileStore((state) => state);

      return selector({
        ...originalStore, // Keep all original methods and values
        profile: {
          apiKey: "test-api-key-1234567890abcdefgHIJKLMNOPQRSTUV",
          apiKeyId: "test-api-key-id",
          createdAt: "2023-10-01T00:00:00.000Z",
          prompts: ["General knowledge", "Science", "History"],
        },
        apiKey: "test-api-key-1234567890abcdefgHIJKLMNOPQRSTUV",
        prompts: ["General knowledge", "Science", "History"],
        loadProfile: vi.fn(() => Promise.resolve()),
        updateProfile: vi.fn(() => Promise.resolve()),
        clearProfile: vi.fn(),
      });
    }),
  };
});

// Mock OpenAI class and its methods
vi.mock("openai", () => {
  return {
    OpenAI: vi.fn().mockImplementation(() => ({
      responses: {
        parse: vi.fn().mockImplementation(() => {
          console.log("OpenAI mock called!");

          return Promise.resolve({
            output_parsed: { ...sampleQuestions },
          });
        }),
      },
    })),
  };
});

// Mock main store
vi.mock("@/store/useStore", async () => {
  const actual = (await vi.importActual("@/store/useStore")) as {
    useStore: typeof import("@/store/mainStore").useStore;
  };

  return {
    useStore: vi.fn((selector) => {
      // Get the original store state/methods
      const originalStore = actual.useStore((state) => state);

      return selector({
        ...originalStore, // Keep all original methods and values
        setIsSettingsOpen: vi.fn(),
      });
    }),
  };
});

// Mock the useFetchQuiz hook from useFetchQuizDev
// Only used if this is imported instead of useFetchQuiz
vi.mock("@/hooks/useFetchQuizDev", () => {
  return {
    apiKey: "mockedApiKey",
    useFetchQuiz: () => {
      const slicedQuestions = { ...sampleQuestions };
      slicedQuestions.questions = slicedQuestions.questions.slice(0, 5);

      return {
        fetchQuiz: vi.fn(() => Promise.resolve({ ...slicedQuestions })),
      };
    },
  };
});
