// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const UglifyJS = require("./uglify/tools/node");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "javascript-minifier" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.minifyCode', minifyCode);
    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;


// MARK: Private Methods
function minifyCode() {
    let editor = vscode.window.activeTextEditor;
        if (!editor) {
            // There is no editor open in VSCode.
            vscode.window.showErrorMessage("You should open a JavaScript file first.");
            return;
        }
        
        let text = editor.document.getText();
        if (!text) {
            // There is no text in file.
            vscode.window.showInformationMessage("There is no code to minify.");
            return;
        }
        var result = UglifyJS.minify(text);
        if (result.error) {
            let ex = result.error;
            if (ex.name == "SyntaxError") {
                vscode.window.showErrorMessage("Parse error at " + editor.document.fileName +  ", error: " + ex.message + " at line: " + ex.line + ", " + "column: " + ex.col);
            }
            return;
        } else {
            let minifiedCodeText = result.code;
            vscode.workspace.openTextDocument({
                language: 'javascript'
            })
            .then( doc =>  vscode.window.showTextDocument(doc))
            .then( editor => {
                let editBuilder = textEdit => {
                    textEdit.insert(new vscode.Position(0, 0), String(minifiedCodeText) );
                };
                return editor.edit( editBuilder, {
                        undoStopBefore: true,
                        undoStopAfter: false
                    } )
                    .then(() => editor );
            } );
        }
}