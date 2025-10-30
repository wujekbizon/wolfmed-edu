# Comprehensive Testing Plan for Wolfmed

This document outlines a comprehensive strategy for testing the Wolfmed application. It covers recommended tooling, setup, and detailed plans for integration and end-to-end (E2E) testing.

## Part 1: Recommended Tooling & Setup

Since no testing framework is currently configured, we recommend establishing a modern testing stack to ensure code quality, prevent regressions, and facilitate future development.

### 1.1. Proposed Tech Stack

*   **Unit & Integration Testing**: [**Jest**](https://jestjs.io/) with [**React Testing Library (RTL)**](https://testing-library.com/docs/react-testing-library/intro/).
    *   **Why**: Jest is a powerful, widely-adopted test runner. RTL provides user-centric utilities to test components in a way that resembles how a user interacts with them, leading to more resilient tests.
*   **End-to-End (E2E) Testing**: [**Playwright**](https://playwright.dev/).
    *   **Why**: Playwright offers robust, cross-browser testing, excellent debugging tools, and first-class support for Next.js. It allows us to test critical user journeys from start to finish in a real browser environment.
*   **Mocking**: Jest's built-in mocking capabilities will be used for functions and modules. For API mocking in E2E tests, we can use Playwright's network interception.

### 1.2. Initial Setup Steps

1.  **Install Dependencies**:
    ```bash
    pnpm add -D jest @types/jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom playwright
    ```

2.  **Configure Jest**:
    *   Create a `jest.config.js` file in the root directory.
    *   Configure it to work with Next.js, TypeScript, and SWC.

3.  **Configure Playwright**:
    *   Initialize Playwright:
        ```bash
        pnpm exec playwright install
        ```
    *   This will create `playwright.config.ts` and an `e2e` or `tests` directory for E2E tests.

4.  **Add `test` Scripts to `package.json`**:
    ```json
    "scripts": {
      // ... existing scripts
      "test": "jest",
      "test:watch": "jest --watch",
      "test:e2e": "playwright test"
    }
    ```

---

## Part 2: Integration Test Plan

Integration tests will focus on verifying that multiple components and modules work together as expected. We will test component interactions, props, state changes, and server action calls.

### 2.1. Authentication (Clerk)

*   **Feature**: User Sign-In & Sign-Up
    *   **Scenario**: A user navigates to the sign-in page and successfully authenticates.
    *   **Test Steps**: 
        1. Render the `SignIn` page component.
        2. Simulate user input for credentials.
        3. Mock the Clerk `signIn` method to return a successful response.
        4. Verify that the user is redirected to the dashboard or home page.
    *   **Involves**: `src/app/sign-in`, `src/app/sign-up`, `AuthButton` component, Clerk's Next.js provider.

*   **Feature**: Protected Routes
    *   **Scenario**: A logged-out user attempts to access a protected route (e.g., `/panel`).
    *   **Test Steps**:
        1. Mock the `useUser` hook from Clerk to return a `null` user.
        2. Render a component that is on a protected route.
        3. Verify that the user is redirected to the sign-in page.
    *   **Involves**: `middleware.ts`, `src/app/panel/**` pages.

### 2.2. Forum Module

*   **Feature**: Create a Forum Post
    *   **Scenario**: An authenticated user creates a new post in the forum.
    *   **Test Steps**:
        1. Render the `CreatePostForm` component with a mocked signed-in user.
        2. Simulate filling out the title and content fields.
        3. Simulate form submission.
        4. Mock the `createPost` server action.
        5. Verify the action is called with the correct data.
        6. Verify a success message is shown.
    *   **Involves**: `CreatePostForm.tsx`, `createPost` server action from `src/actions/actions.ts`.

*   **Feature**: Comment on a Post
    *   **Scenario**: A user adds a comment to an existing forum post.
    *   **Test Steps**:
        1. Render the `ForumDetailComments` and `CreateCommentForm` components.
        2. Simulate typing a comment and submitting the form.
        3. Mock the `addComment` server action.
        4. Verify the action is called with the post ID and comment text.
        5. Verify the new comment appears in the comment list.
    *   **Involves**: `CreateCommentForm.tsx`, `ForumDetailComments.tsx`, `addComment` server action.

### 2.3. Test-Taking Module

*   **Feature**: Generate and Start a Custom Test
    *   **Scenario**: A user selects custom options and starts a new test.
    *   **Test Steps**:
        1. Render the `StartTestForm` and `CustomTestOptions` components.
        2. Simulate selecting a category, number of questions, etc.
        3. Simulate clicking the "Start Test" button.
        4. Verify the `useGenerateTestStore` (Zustand) is updated with the correct configuration.
        5. Verify the user is navigated to the test-taking page (`/challenge`).
    *   **Involves**: `StartTestForm.tsx`, `CustomTestOptions.tsx`, `useGenerateTestStore.ts`.

*   **Feature**: Submit a Test and View Results
    *   **Scenario**: A user completes a test and submits their answers.
    *   **Test Steps**:
        1. Render the `Challenge` component with a set of questions.
        2. Simulate the user selecting answers for each question.
        3. Simulate submitting the test.
        4. Mock the `submitTest` server action.
        5. Verify the action is called with the correct answers.
        6. Verify the user is navigated to the results page and the `ChallengeResult` component displays the correct score.
    *   **Involves**: `Challenge.tsx`, `ChallengeResult.tsx`, `submitTest` action.

### 2.4. User Panel

*   **Feature**: Create and View a Note
    *   **Scenario**: A user creates a new note associated with a specific topic or question.
    *   **Test Steps**:
        1. Render the `CreateNoteForm` component.
        2. Simulate filling in the note content.
        3. Mock the `createNote` server action.
        4. Verify the action is called with the correct data.
        5. Render the `NotesSection` and verify the newly created note is displayed.
    *   **Involves**: `CreateNoteForm.tsx`, `NotesSection.tsx`, `NotePreviewCard.tsx`, `notes.ts` actions.

*   **Feature**: Manage Custom Categories
    *   **Scenario**: A user creates, renames, and deletes a custom category for organizing questions.
    *   **Test Steps**:
        1. Render the `CustomCategoryManager` component.
        2. Simulate creating a new category and verify the `createCategory` action is called.
        3. Simulate clicking the rename button, changing the name, and verifying the `renameCategory` action is called.
        4. Simulate deleting a category and verify the `deleteCategory` action is called.
    *   **Involves**: `CustomCategoryManager.tsx`, `EditableCategoryName.tsx`, `DeleteCategoryModal.tsx`, and associated server actions.

---

## Part 3: End-to-End (E2E) Test Plan

E2E tests will simulate complete user journeys in a real browser to validate critical flows from the user's perspective.

*   **Test Case 1: The Full "Test-Taking" Flow**
    *   **User Journey**: 
        1. User signs in.
        2. Navigates to the "Tests" section.
        3. Configures a custom test (e.g., 10 questions from the "Cardiology" category).
        4. Starts the test.
        5. Answers all questions and lets the timer run for a few seconds.
        6. Submits the test.
        7. Verifies the score is displayed on the results page.
        8. Navigates to their dashboard (`/panel`) and sees the completed test in their history.

*   **Test Case 2: The Full "Forum Interaction" Flow**
    *   **User Journey**:
        1. User signs in.
        2. Navigates to the forum.
        3. Creates a new post with a title and content.
        4. Verifies their new post appears at the top of the post list.
        5. Clicks on their post to view the detail page.
        6. Adds a comment to their own post.
        7. Verifies the comment is displayed correctly.
        8. Signs out.

*   **Test Case 3: The "Project Support" Flow**
    *   **User Journey**:
        1. A non-logged-in user lands on the homepage.
        2. Clicks on the "Support Project" (`/wsparcie-projektu`) link.
        3. Selects a product/support tier.
        4. Clicks the purchase/support button.
        5. Verifies they are redirected to a Stripe checkout page (the test will mock the actual checkout page and verify the navigation).
        6. Navigates back from the (mocked) success URL and sees a confirmation message.
