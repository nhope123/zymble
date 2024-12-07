# Zymble ![Zymble Logo](src/assets/logo.png)

## Description

Zymble is a VS Code extension that simplifies the React workflow by providing commands to generate React components and hooks with ease.

## Commands
- **Create React Component**
- **Create React Hook**

## Features

- **Create React Component**: 
  - Generate a folder from the component name.
  - Generate a React functional components with or without props. 
  - Generate a component test file.
  - Generate a types file for components with props.
  - The file extensions depending on TypeScript installation:
    - Component and test files are `.jsx` or `.tsx`.
    - Type files are `.js` or `.ts`.

- **Create React Hook** 
  - Generate a folder from the hook name in the hooks folder or a User selected folder.
  - Generate custom React hooks with optional useState and useEffect.
  - Generate a hook test file.
  - Generate a types file for a Typescript hook.
  - The file extensions depending on TypeScript installation:
    - Hook and test files are `.jsx` or `.tsx`.
    - Type files are `.js` or `.ts`.

- **Seamless integration with VS Code**

## Screenshots

<!-- ![Generate Component](images/generate-component.png)
![Generate Hook](images/generate-hook.png) -->

## Instructions

### Download installation file
1. Open the [package folder](https://github.com/nhope123/zymble/tree/main/packages) and select the `zymble<version>.vsix`.
2. Download and save the raw file to your local directory.

### Install Extension
1. Open `vscode`
2. Open the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window.
3. Click the `Views and more Actions` menu to the right of the Extension refresh button.
4. At the bottom, click the `Install from VSIX`
5. Locate and select the `zymble-<version>` installation file
6. Click install
7. View the extension by Typing `zymble` in the extension search

### Cloning the Repository

````sh
git clone https://github.com/nhope123/zymble.git
cd zymble
yarn install
````


### Running in Debug Mode

1. Open the project in Visual Studio Code.
2. Press `F5` to open a new window with your extension loaded.

### How to Run the Commands
1. From the Command Palette:
   - Open the Command Palette by pressing Ctrl+Shift+P.
   - Type the name of the extension / command (e.g., Zymble: Create Component) and select it from the list.
2. Pressing F1 and Typing the Name of the Command:
   - Press F1 to open the Command Palette.
   - Type the name of the extension / command (e.g., Zymble: Create Component) and select it from the list.
3. Right-Click the Workspace Folder Tree in a React or Prettier Project:
   - Right-click on the workspace folder in the Explorer view.
   - If the project is a React or Prettier project, the context menu will show options based on the isReactProject and noPrettierConfig contexts set by the commands.

### Package the Extension

1. Run `yarn package`
2. Locate extension file in `packages/` folder.

<!-- ## Extension Settings

This extension contributes the following settings:

- `zymble.enable`: Enable/disable this extension.
- `zymble.someSetting`: Description of what this setting does. -->

<!-- ## Release Notes

### 1.0.0

- Initial release of Zymble.

### 1.0.1

- Fixed issue #.

### 1.1.0

- Added features X, Y, and Z.

--- -->

[MIT License](https://github.com/nhope123/zymble/blob/main/LICENSE.md)

**Enjoy!**
