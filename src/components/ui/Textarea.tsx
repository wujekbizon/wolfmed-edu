import React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={"flex min-h-[80px] w-full resize-none rounded-md border border-border/40 bg-neutral-900 px-3 py-2 text-sm ring-offset-background scrollbar-webkit placeholder:text-muted-foreground focus:border-amber-200/10 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };