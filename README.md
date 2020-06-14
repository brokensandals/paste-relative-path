# paste-relative-path

This is a VS Code extension that adds a "Paste Relative Path" command.
When the contents of the clipboard are a file path, use this command to paste the relative path to that file from the current document.

For example, if you copy the text `/foo/alpha/file1.md` onto the clipboard, then open the file `/foo/beta/file2.md` and run the Paste Relative Path command, the text `../file1.md` will be inserted.

## Release Notes

### 1.0.0

Initial release.
