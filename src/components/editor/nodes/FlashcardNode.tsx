import {
  $applyNodeReplacement,
  DecoratorNode,
  SerializedLexicalNode,
  LexicalNode,
} from "lexical";

import type { ReactNode } from "react";

export type SerializedFlashcardNode = {
  type: "flashcard";
  version: 1;
  questionText: string;
  answerText: string;
  cardId: string;
} & SerializedLexicalNode;

export class FlashcardNode extends DecoratorNode<ReactNode> {
  __questionText: string;
  __answerText: string;
  __cardId: string;

  static getType(): string {
    return "flashcard";
  }

  static clone(node: FlashcardNode): FlashcardNode {
    return new FlashcardNode(
      node.__questionText,
      node.__answerText,
      node.__cardId,
      node.__key
    );
  }

  constructor(
    questionText: string,
    answerText: string,
    cardId: string,
    key?: string
  ) {
    super(key);
    this.__questionText = questionText;
    this.__answerText = answerText;
    this.__cardId = cardId;
  }

  createDOM(): HTMLElement {
    const element = document.createElement("div");
    element.className =
      "relative inline-block px-3 py-2 my-1 border-2 border-dashed border-purple-400 bg-purple-50/30 rounded-lg cursor-pointer hover:bg-purple-50/50 transition-all duration-200";
    element.dataset.cardId = this.__cardId;
    element.title = `Flashcard: ${this.__questionText}`;
    return element;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): ReactNode {
    return (
      <span className="inline-flex items-center gap-2 text-purple-700 text-sm font-medium">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 00112.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        {this.__questionText}
      </span>
    );
  }

  getQuestionText(): string {
    return this.__questionText;
  }
  getAnswerText(): string {
    return this.__answerText;
  }
  getCardId(): string {
    return this.__cardId;
  }

  setQuestionText(questionText: string) {
    this.getWritable().__questionText = questionText;
  }

  setAnswerText(answerText: string) {
    this.getWritable().__answerText = answerText;
  }

  exportJSON(): SerializedFlashcardNode {
    return {
      type: "flashcard",
      version: 1,
      questionText: this.__questionText,
      answerText: this.__answerText,
      cardId: this.__cardId,
    };
  }

  static importJSON(json: SerializedFlashcardNode): FlashcardNode {
    return $createFlashcardNode(
      json.questionText,
      json.answerText,
      json.cardId
    );
  }
}

export function $createFlashcardNode(
  questionText: string,
  answerText: string,
  cardId: string = `flashcard-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`
): FlashcardNode {
  return $applyNodeReplacement(
    new FlashcardNode(questionText, answerText, cardId)
  );
}

export function $isFlashcardNode(
  node: LexicalNode | null | undefined
): node is FlashcardNode {
  return node instanceof FlashcardNode;
}
