import "server-only";

// This function determines the test category based on user input in the FormData object.
export function determineTestCategory(formData: FormData) {
  // Initialize a variable to store the category (either a string or null)
  let category: FormDataEntryValue | null = null;

  // Check if the user provided a value for "newCategory" field
  const newCategory = formData?.get("newCategory");
  const existingCategory = formData?.get("category");

  if (newCategory) {
    // If "newCategory" is present, set the category as the user-provided value
    category = newCategory;
  } else {
    // If "category" is present, set the category as the existing value
    category = existingCategory;
  }

  if (!category) category = "";

  // Return the determined category (a string or null)
  return category;
}
