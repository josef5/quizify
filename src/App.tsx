import { useEffect, useState } from "react";
import "./App.css";
import { OpenAI } from "openai";
import sampleQuestionsData from "../test/sample-questions.json";

type Question = {
  question_number: number;
  question: string;
  correct_answer: string;
  wrong_answers: string[];
};

type Quiz = {
  questions: Question[];
};

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Quiz | null>(null);
  const [userInstructions, setUserInstructions] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  // const [questions, setQuestions] = useState(null);

  async function fetchOpenAi() {
    setData(sampleQuestionsData);
  }

  // temp disabled
  async function fetchOpenAiX() {
    setIsLoading(true);
    setData(null);

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";
      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

      const chatCompletion = await openai.chat.completions.create({
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a expert in multiple choice quiz writing.`,
          },
          {
            role: "user",
            content: userInstructions,
          },
          {
            role: "system",
            content: `The quiz should have 10 questions, each with 4 options. The questions should be diverse and cover different aspects of the presidents' lives and terms.`,
          },
          {
            role: "system",
            content: `Return the quiz in JSON format in this format:
            {
              questions: [
                {
                  "question_number": "<question number here>",
                  "question": "<question here>",
                  "correct_answer": "<correct answer here>",
                  "wrong_answers": [
                    "<wrong answer 1 here>",
                    "<wrong answer 2 here>",
                    "<wrong answer 3 here>"
                  ]
                }
              ]
            }
            `,
          },
          // {
          //   role: "user",
          //   content: `Return a JSON array of American Presidents from 1 - 10,  in this format:
          //     {"name": "<name here>",
          //     "year of term": "<year of term here>",
          //     "party": "<party here>"
          //     "description": "<One sentence about tenure here. For example, 'Led the country during the Great Depression and World War II.'>"
          //     }`,
          // },
        ],
        temperature: 0.7,
        model: "gpt-4o-mini",
      });

      const responseContent = chatCompletion.choices[0].message.content;

      setData(responseContent);
    } catch (error) {
      console.error(error);
    }

    setIsLoading(false);

    console.log("Response data :", data);

    if (!data) {
      console.error("API response is empty");
      return;
    }
  }

  /* useEffect(() => {
    fetchOpenAi();
  }, []); */

  useEffect(() => {
    if (data) {
      setCurrentQuestion(data.questions[0]);
    }
  }, [data]);

  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <h1>Quizify</h1>
        <form className="flex flex-col gap-2">
          <label htmlFor="user_instructions">
            Enter your instructions for the quiz:
          </label>
          <textarea
            name="user_instructions"
            id="user_instructions"
            className="w-full rounded p-2"
            value={userInstructions}
            onChange={(e) => setUserInstructions(e.target.value)}
            placeholder="Write your instructions here..."
            rows={8}
          ></textarea>
          <button
            className="rounded bg-blue-500 p-2 text-white"
            onClick={(event) => {
              event.preventDefault();

              fetchOpenAi();
            }}
          >
            Fetch
          </button>
        </form>

        {isLoading && <p>Loading...</p>}
        {!isLoading && !data && <p>Click the button to fetch data.</p>}
        {!isLoading && data && <p>Data fetched successfully!</p>}
        {/* <pre>{data}</pre> */}
        {currentQuestion && (
          <div className="mt-4">
            <h2 className="text-xl font-bold">
              Question {currentQuestion.question_number}:
            </h2>
            <p>{currentQuestion.question}</p>
            <ul className="list-disc pl-5">
              {currentQuestion.wrong_answers.map((answer, index) => (
                <li key={index}>{answer}</li>
              ))}
              <li className="font-bold">{currentQuestion.correct_answer}</li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
