export default function ProgressBar({ text }: { text?: string }){
    return (
      <div className="h-full w-full flex flex-col items-center justify-center px-[10%] animate-fadeInUp">
        {text && <h1 className="mb-2 text-xl font-semibold">{text}</h1>}
        <progress
          className="w-full h-5 [accent-color:rgba(128,255,0,0.3)]"
          max="100"
        />
      </div>
    );
  };