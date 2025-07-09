import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function getAvailableTemplates(): string[] {
  const templateDir = path.join(__dirname, '..', 'templates');
  return fs.readdirSync(templateDir).filter(f => {
    return fs.existsSync(path.join(templateDir, 'convox.yml')) ||
           fs.existsSync(path.join(templateDir, f, 'convox.yml'));
  });
}

function getTemplatePath(template: string): string {
  const customPath = path.join(__dirname, '..', 'templates', template, 'convox.yml');
  return fs.existsSync(customPath)
    ? customPath
    : path.join(__dirname, '..', 'templates', 'default', 'convox.yml');
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('convox-yaml-generator.generate', async (args) => {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) {
      vscode.window.showErrorMessage('No workspace is open.');
      return;
    }

    const rootPath = folders[0].uri.fsPath;

    // Use argument or prompt user
    let template = args?.template;
    if (!template) {
      const templates = getAvailableTemplates();
      template = await vscode.window.showQuickPick(templates, {
        placeHolder: 'Select a template for convox.yml',
      });
    }

    if (!template) {
      vscode.window.showErrorMessage('Template selection cancelled.');
      return;
    }

    const templatePath = getTemplatePath(template);
    const destPath = path.join(rootPath, 'convox.yml');

    if (fs.existsSync(destPath)) {
      const overwrite = await vscode.window.showWarningMessage(
        'convox.yml already exists. Overwrite?',
        'Yes', 'No'
      );
      if (overwrite !== 'Yes') return;
    }

    fs.copyFileSync(templatePath, destPath);
    vscode.window.showInformationMessage(`convox.yaml created using ${template} template.`);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}