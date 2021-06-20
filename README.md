# Adobe  Use case 1 - Human Recruitment Signing Platform
A Web Application that allows companies to hire potential employee candidates and make them sign a Labour Contract.
## Requirements
You should have **NodeJS** installed on your system.

## Installation
Extract the submission file and run ```npm install``` to install all the required packages.

## Configuration
Change the **PORT**, **Adobe View SDK** credentials according to your need in the **config.js** file.

## Folder Structure
1. **config.js** - Settings for the app
2. **views** - Handlebars(.hbs) files
3. **src** - main directory where server lies
4. **static** -
    1. **css/js** folders
    2. **output** folders - The edited output contracts reside here.
    3. **pdf** - The sample PDFs provided lies here. Please select the PDF files from this folder only.

## Usage
1. Open a terminal in the folder and run ```npm start```.
2. Open a web browser and go to  http://localhost:3000/.
3. Start by registering as a **Company User**, then register as **Candidate User**.
4. Select the candidates and initiate a contract. A Black PDF  is created. Click on the contract link to open a PDF Viewer.
5. Click on **Edit PDF** button, you will be redirected to a full-fledged PDF editor where you can **Add, Delete, Edit** contents of your PDF. Finalize the contract
(**Note**: Select the file only from the **static/pdf** directory, file upload is not in scope as verified by the copilot.)
6. Open the Embedded Viewer and use the comment/annotation tools.
7. Approve the Contract from both sides.
(**Note**: Please refresh the page on the other dashboard, to see the status changes)
8. Open the signing link and sign the Labor Contract, verify the email then come back to the Dashboard page.
9. Delete the PDF using the delete button and cancel the contract using **Cancel** button.

## Linting
To see the linting results run  ```npm run lint```.

## Adobe Services Used
1. **PDF Tools API** - For editing of the PDF.
2. **Adobe Embed API** - To display the PDF Viewer.
3. **Adobe Sign API** - The Web Form to sign the PDF Document.