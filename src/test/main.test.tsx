import QuizQuestions from "@/components/quiz-questions";
import Results from "@/components/results";
import "@testing-library/jest-dom";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import sampleQuestions from "./sample-questions.json";

window.scrollTo = vi.fn();

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

vi.mock("@/store/useStore", async () => {
  const actual = (await vi.importActual("@/store/useStore")) as {
    useStore: typeof import("@/store/useStore").useStore;
  };

  return {
    useStore: vi.fn((selector) => {
      // Get the original store state/methods
      const originalStore = actual.useStore((state) => state);

      return selector({
        ...originalStore, // Keep all original methods and values
        encryptedApiKey: "mocked-key",
        setIsSettingsOpen: vi.fn(),
      });
    }),
  };
});

vi.mock("./useFetchQuiz", () => ({
  decryptSync: vi.fn(() => "mockedApiKey"),
}));

vi.mock("@/lib/encryption", () => ({
  decryptSync: vi.fn(() => "mocked-decrypted-key"),
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<App />);

    expect(document.body.innerHTML.length).toBeGreaterThan(0);
  });

  it("shows the settings button", () => {
    render(<App />);
    const settingsButton = screen.queryByRole("button", {
      name: "Open settings",
    });

    expect(settingsButton).toBeTruthy();
  });

  it("can open settings if button exists", async () => {
    render(<App />);

    const btn = screen.queryByRole("button", { name: "Open settings" });

    if (btn) {
      act(() => btn.click());

      expect(screen.getByLabelText("Settings")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    } else {
      throw new Error("Open Settings Button not found");
    }
  });

  it("can call the API", async () => {
    render(<App />);

    const promptInput = screen.getByLabelText("Prompt");
    const submitButton = screen.getByRole("button", { name: "Start quiz" });

    expect(submitButton).toBeInTheDocument();

    act(() => {
      fireEvent.change(promptInput, {
        target: { value: "General knowledge" },
      });
    });

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText("Question 1")).toBeInTheDocument();

      // Check the question in the heading
      // and assert the corresponding correct answer is present
      const questionHeading = screen.getByTestId("question");
      expect(questionHeading).toBeInTheDocument();

      const questionText = questionHeading.textContent;

      const correctAnswer = sampleQuestions.questions
        .map((question) => question)
        .filter((question) => question.text === questionText)[0].correctAnswer;

      expect(screen.getByText(correctAnswer)).toBeInTheDocument();
    });
  });
});

describe("Questions", () => {
  it("renders questions", async () => {
    render(
      <QuizQuestions
        currentQuestionNumber={1}
        currentQuestion={sampleQuestions.questions[0]}
        questionCount={sampleQuestions.questions.length}
        onAnswer={vi.fn()}
      />,
    );

    expect(screen.getByText("Question 1")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(sampleQuestions.questions[0].correctAnswer),
      ).toBeInTheDocument();

      sampleQuestions.questions[0].incorrectAnswers.forEach(
        (incorrectAnswer) => {
          expect(screen.getByText(incorrectAnswer)).toBeInTheDocument();
        },
      );
    });
  });
});

describe("Results", () => {
  it("renders results", async () => {
    render(
      <Results
        userAnswers={sampleQuestions.questions.map((question) => ({
          questionNumber: question.questionNumber,
          question: question.text,
          answer: question.correctAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect: true,
        }))}
        onRestart={vi.fn()}
      />,
    );

    await waitFor(() => {
      sampleQuestions.questions.forEach((question) => {
        expect(
          screen.getByText((content) => content.includes(question.text)),
        ).toBeInTheDocument();

        // If there may be more than one match, use getAllByText and check at least one exists
        const correctAnswers = screen.getAllByText(question.correctAnswer);
        expect(correctAnswers.length).toBeGreaterThan(0);
      });
    });
  });
});
