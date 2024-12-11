import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
  files: 'src/**/*.test.js',
  workspaceFolder: './zymble_code_workspace.code-workspace',
  
});
