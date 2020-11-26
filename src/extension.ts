import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

const realpath = util.promisify(fs.realpath);

function hrefRelPath(src: string, dest: string) {
  const relPath = path.relative(src, dest);
  if (relPath === '') {
    // The path on the clipboard is the same file we're pasting into.
    return '.';
  } else if (relPath.startsWith('..' + path.sep)) {
    // Given source path "/a/b/c.md" and dest path "/a/b/d.md",
    // path.relative returns "../d.md". But generally you really want
    // the path relative to the directory _containing_ c.md - that's
    // what you would put in a hyperlink href, for example. So, we
    // remove the first '..' path component.
    return relPath.slice(3);
  } else {
    return relPath;
  }
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('paste-relative-path.paste', () => {(async () => {
    const rawDest = await vscode.env.clipboard.readText();
    const realDest = await realpath(rawDest);
    const rawSrc = vscode.window.activeTextEditor?.document?.fileName;
    if (!rawSrc) {
      return;
    }
    const realSrc = await realpath(rawSrc);
    const href = hrefRelPath(realSrc, realDest);

    await vscode.window.activeTextEditor?.edit((eb) => {
      vscode.window.activeTextEditor?.selections?.forEach((selection) => {
        if (selection.isEmpty) {
          eb.insert(selection.active, href);
        } else {
          eb.replace(selection, href);
        }
      });
    });
  })().catch((e) => {
    vscode.window.showErrorMessage(`${e}`);
  })});
  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
