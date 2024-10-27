# Guide to Building and Running the SmartGrow/SmartCourse App

## Prerequisites

- Node.js (v14 or later)
- npm (usually comes with Node.js)
- Git (for version control)

## Setup

1. Clone the repository:
```bash
git clone https://your-repository-url.git
cd your-project-directory
```

2. Install dependencies:
```bash
npm install
```

## Running the App in Development Mode

1. Start the development server:
```bash
npm start
```

2. Open your browser and navigate to `http://localhost:3000`

3. Use the "Switch to SmartGrow/SmartCourse" button in the DashboardDesigner to toggle between brands during development.

## Building for Production

### For SmartGrow

1. Set the environment variable for the brand:

For Unix-like systems (Linux, macOS)

```bash
export REACT_APP_BRAND=smartgrow
```

For Windows (Command Prompt)

```bash
set REACT_APP_BRAND=smartgrow
```

For Windows (PowerShell)

```bash
$env:REACT_APP_BRAND="smartgrow"
```

2. Build the app:

```bash
npm run build
```

### For SmartCourse

1. Set the environment variable for the brand:

For Unix-like systems (Linux, macOS)
`export REACT_APP_BRAND=smartcourse`

For Windows (Command Prompt)
`set REACT_APP_BRAND=smartcourse`

For Windows (PowerShell)
`$env:REACT_APP_BRAND="smartcourse"`

2. Build the app:
`npm run build`

## Running the Production Build

1. Install a static server (if not already installed):
`npm install -g serve`

2. Serve the built app:
`serve -s build`

3. Open your browser and navigate to the URL provided by the serve command (usually `http://localhost:5000`)

## Notes

- The production build will use the brand specified by the `REACT_APP_BRAND` environment variable.
- Make sure to remove the brand switching button from the DashboardDesigner component before creating a production build.
- You may want to create separate npm scripts for building each brand version, e.g.:

```json
"scripts": {
 "build:smartgrow": "REACT_APP_BRAND=smartgrow react-scripts build",
 "build:smartcourse": "REACT_APP_BRAND=smartcourse react-scripts build"
}
```

Then you can run npm run build:smartgrow or npm run build:smartcourse to build the respective versions.

## Troubleshooting

If you encounter any issues with the brand not switching, ensure that the BrandContext is properly set up and the BrandProvider is wrapping your app in the root component.

Check that all components using brand-specific elements (like logos or taglines) are correctly using the useBrand hook.
Clear your browser cache or use incognito mode if you're not seeing changes after switching brands.

## License

This project is licensed under the s10-smartgrow-frontend License. Use of this software is restricted to individuals or organizations actively working on a project where the copyright holder or an authorized developer is directly involved.

For more information, see the [LICENSE](./LICENSE) file.