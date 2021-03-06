import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as yaml from 'js-yaml';

const realpath = util.promisify(fs.realpath);
const readFile = util.promisify(fs.readFile);

function refPath(src: string, dest: string) {
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

const YAML_META_RE = /^---\n(.*?)\n(---|\.\.\.)\s*$/ms;
const HEADER_RE = /^#\s+(.+)\s*$/m;
async function getMarkdownTitle(filePath: string) {
  try {
    let text = await readFile(filePath, 'utf8');
    const metaMatch = YAML_META_RE.exec(text);
    if (metaMatch) {
      try {
        const meta: any = yaml.safeLoad(metaMatch[1]);
        if (typeof meta === 'object' && meta?.title) {
          return meta.title;
        }
      } catch (e) {
      }
      text = text.replace(metaMatch[0], '');
    }
    const headerMatch = HEADER_RE.exec(text);
    if (headerMatch) {
      return headerMatch[1];
    }
  } catch (e) {
  }
  return null;
}

async function getTitle(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.md' || ext === '.markdown') {
    return await getMarkdownTitle(filePath);
  }
  return null;
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
    const ref = refPath(realSrc, realDest);

    await vscode.window.activeTextEditor?.edit((eb) => {
      vscode.window.activeTextEditor?.selections?.forEach((selection) => {
        if (selection.isEmpty) {
          eb.insert(selection.active, ref);
        } else {
          eb.replace(selection, ref);
        }
      });
    });
  })().catch((e) => {
    vscode.window.showErrorMessage(`${e}`);
  });});
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('paste-relative-path.paste-markdown', () => {(async () => {
    const rawDest = await vscode.env.clipboard.readText();
    const realDest = await realpath(rawDest);
    const rawSrc = vscode.window.activeTextEditor?.document?.fileName;
    if (!rawSrc) {
      return;
    }
    const realSrc = await realpath(rawSrc);
    const href = refPath(realSrc, realDest).split(path.sep).map(encodeURIComponent).join(path.sep);

    let useTitle = vscode.workspace.getConfiguration('pasteRelativePath').get('useTitleForMarkdownLinks') === true;
    let title = (useTitle && await getTitle(realDest)) || path.basename(realDest).replace(/\..*/, '');

    await vscode.window.activeTextEditor?.edit((eb) => {
      vscode.window.activeTextEditor?.selections?.forEach((selection) => {
        if (selection.isEmpty) {
          eb.insert(selection.active, `[${title}](${href})`);
        } else {
          const text = vscode.window.activeTextEditor?.document.getText(selection);
          eb.replace(selection, `[${text}](${href})`);
        }
      });
    });
  })().catch((e) => {
    vscode.window.showErrorMessage(`${e}`);
  });});
  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
