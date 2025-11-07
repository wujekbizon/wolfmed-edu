interface TestDataInterface {
    question: string;
    answers: {
      option: string;
      isCorrect: boolean;
    }[];
  }
  
  export default TestDataInterface;
  
  export interface AvailableOption {
    option: string;
    isCorrect: boolean;
  }
  
  export interface TestsData {
    id: string;
    data: TestDataInterface;
    userId: string;
    category: string;
    createdAt: Date;
    updatedAt: Date | null;
  }
  
  // Create a custom type that uses the Omit utility type to exclude the data property
  // from TestsData and then adds it back with the type unknown.
  // this is because Drizzle doesn't support typed JSON in their schemas
  export type ExtendedTestsData = Omit<TestsData, "data"> & { data: unknown };