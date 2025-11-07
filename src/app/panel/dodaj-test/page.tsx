import ChooseAnswerCount from "@/components/ChooseAnswerCount";
import CreateTestForm from "@/components/CreateTestForm";
import UploadTestForm from "@/components/UploadTestForm";

async function CreateTests() {

  return (
    <>
      <CreateTestForm categories={[]} />
    </>
  );
}

export default function CreateTestPage() {
  return (
    <section className="flex w-full flex-col items-center p-4">
      <div className="flex w-full flex-col items-center justify-center gap-8 px-0 pb-10 sm:px-4 lg:w-3/4">
        <ChooseAnswerCount />
        <CreateTests />
        <UploadTestForm />
      </div>
    </section>
  );
}
