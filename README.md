# paste-relative-path

This is a VS Code extension that adds a "Paste Relative Path" command.
When the contents of the clipboard are a file path, use this command to paste the relative path to that file from the current document.

For example, if you copy the text `/foo/alpha/file1.md` onto the clipboard, then open the file `/foo/beta/file2.md` and run the Paste Relative Path command, the text `../file1.md` will be inserted.

There is also a "Paste Relative Path as Markdown" command, which pastes a link using Markdown syntax.
If you run the command with text already selected, the selected text becomes a link: for example, `foo` would change to `\[foo\](../file1.md)`.
If you run the command without any text selected, a new link is inserted and the text is either the title of the target document (if it can be determined) or the filename of the target.
The title of the target document can currently only be guessed if its file extension is `.md` or `.markdown` and it contains either a YAML metadata block with a `title` field, or a top-level markdown heading (eg `# Foo`).

(If you never want to use the title for the link text, set the config `pasteRelativePath.useTitleForMarkdownLinks` to `false`.)

## Release Notes

## 1.4.0

- Add commands to the editor context menu. There is a setting to disable this if you don't like it.

## 1.3.0

- Add option to disable reading titles of Markdown files.

## 1.2.1

- Fix excessive percent-encoding when pasting Markdown links

## 1.2.0

- Add 'Paste Relative Path as Markdown' command
- Refactoring

## 1.1.0

- Resolve symlinks before calculating relative path

## 1.0.0

- Initial release

## License

This is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
