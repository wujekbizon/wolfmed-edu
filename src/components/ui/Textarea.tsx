import React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={"flex min-h-[80px] w-full resize-none rounded-lg border border-zinc-200 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-zinc-700 scrollbar-webkit placeholder:text-zinc-400 focus:ring-2 focus:ring-[#ff9898]/50 focus:border-transparent outline-none transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };