import { configure } from "@testing-library/react";

configure({
  getElementError: (message, container) => {
    const customMessage = [message].join("\n\n");
    return new Error(customMessage, { cause: container });
  },
});
