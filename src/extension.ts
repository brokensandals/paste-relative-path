import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('paste-relative-path.paste', () => {
    vscode.env.clipboard.readText().then((value: string) => {
      const active = vscode.window.activeTextEditor;
      if (!active) {
        return;
      }

      const activePath = active.document.fileName;
      const relPath = path.relative(activePath, value);
      let finalPath: string;
      if (relPath === '') {
        // The path on the clipboard is the same file we're pasting into.
        finalPath = '.';
      } else if (relPath.startsWith('..' + path.sep)) {
        // Given source path "/a/b/c.md" and dest path "/a/b/d.md",
        // path.relative returns "../d.md". But generally you really want
        // the path relative to the directory _containing_ c.md - that's
        // what you would put in a hyperlink href, for example. So, we
        // remove the first '..' path component.
        finalPath = relPath.slice(3);
      } else {
        finalPath = relPath;
      }

      active.edit((eb: vscode.TextEditorEdit) => {
        active.selections.forEach((selection: vscode.Selection) => {
          if (selection.isEmpty) {
            eb.insert(selection.active, finalPath);
          } else {
            eb.replace(selection, finalPath);
          }
        });
      });
    });
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
