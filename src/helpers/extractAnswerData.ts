import "server-only";
import { AvailableOption } from "@/types/testData";

// This function extracts answer data from a FormData object,
// which typically represents user input from a form submission.
export function extractAnswerData(formData: FormData) {
  // Create an empty array to store the extracted answer data
  const formDataAnswers: AvailableOption[] = [];

  // Loop through all key-value pairs in the FormData object
  for (const [key, value] of formData.entries()) {
    // Define a regular expression to match option and checkbox keys
    // (optionX or checkboxX, where X is a digit)
    const match = key.match(/^option(\d+)|^checkbox(\d+)$/) as RegExpMatchArray;

    if (match) {
      // If there's a match (option or checkbox key):
      // Extract the option number (either from group 1 or 2)
      const optionNumber = match[1]
        ? parseInt(match[1], 10) // Parse group 1 to integer (optionX)
        : match[2]
          ? parseInt(match[2], 10) // Parse group 2 to integer (checkboxX)
          : null; // No option number found

      // Check if a checkbox exists for the extracted option number
      const isChecked = formData.has(`checkbox${optionNumber}`);

      // If there's a valid option number and it's not a checkbox key
      if (optionNumber && key !== `checkbox${optionNumber}`) {
        // Create an object representing an answer with option text and correctness
        const answerObject: AvailableOption = {
          option: value.toString(), // Convert option value to string
          isCorrect: isChecked, // Set isCorrect based on checkbox presence
        };

        // Push the answer object to the `formDataAnswers` array
        formDataAnswers.push(answerObject);
      }
    }
  }

  // After iterating through all keys, return the array of extracted answer data
  return formDataAnswers;
}
