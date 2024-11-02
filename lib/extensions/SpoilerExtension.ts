import { Mark, mergeAttributes } from "@tiptap/core";

export const Spoiler = Mark.create({
  name: "spoiler",

  addOptions() {
    return {
      HTMLAttributes: {
        class: "spoiler",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span",
        class: "spoiler",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      toggleSpoiler:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
    };
  },
});
