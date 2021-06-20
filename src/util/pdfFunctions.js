/* eslint-disable no-console */
const PDFToolsSdk = require('@adobe/documentservices-pdftools-node-sdk');
const fs = require('fs');

/**
 * Function to delete the previous file if it exists
 * @param {String} fileName
 */
const deleteIfExists = (fileName) => {
    console.log(`static/output/${fileName}.pdf`, `static/output/${fileName}.pdf`);
    if (fs.existsSync(`static/output/${fileName}.pdf`)) {
        console.log('yes');
        fs.unlinkSync(`static/output/${fileName}.pdf`);
    }
};

/**
 * Function that takes several params and processes the PDF
 * @param {any} credentials
 * @param {String} fileName - Name of file
 * @param {String} createFile - Name of the external file to be created and merged
 * @param {Number} reorderPages
 * @param {Array} mergableList - Array of fileNames of PDFs to be merged
 * @param {String} fileNameToInsertPage - Name of the PDF whose page is to be inserted
 * @param {Number} insertablePage - Page Number in the selected file to be inserted
 * @param {Number} sourcePage - Page Number in the source file
 * @param {Number} pageToBeDeleted
 * @returns {String} Whether the task was successfully completed or not
 */
async function editPDF(credentials,
    fileName,
    createFile,
    reorderPages,
    mergableList,
    fileNameToInsertPage,
    insertablePage,
    sourcePage,
    pageToBeDeleted) {
    const executionContext = PDFToolsSdk.ExecutionContext.create(credentials);
    const input = PDFToolsSdk.FileRef.createFromLocalFile(`static/output/${fileName}.pdf`);
    let result = null;
    let operations = 0;

    // Merge PDFs operation
    if (mergableList) {
        const combineFilesOperation = PDFToolsSdk.CombineFiles.Operation.createNew();

        // Check if previous PDF exists and if it exists set it as input
        if (result) {
            combineFilesOperation.addInput(result);
        } else {
            combineFilesOperation.addInput(input);
        }

        for (let index = 0; index < mergableList.length; index += 1) {
            const combineSource = PDFToolsSdk.FileRef.createFromLocalFile(`static/pdf/${mergableList[index]}`);
            combineFilesOperation.addInput(combineSource);
        }

        try {
            result = await combineFilesOperation.execute(executionContext);
            operations += 1;
        } catch (err) {
            if (err instanceof PDFToolsSdk.Error.ServiceApiError
                || err instanceof PDFToolsSdk.Error.ServiceUsageError) {
                console.log('Exception encountered while executing operation', err);
            } else {
                console.log('Exception encountered while executing operation', err);
            }
            throw err;
        }
    }

    // Create the PDF and merge with the existing one
    if (createFile) {
        // Create the PDF with the given file
        const createPdfOperation = PDFToolsSdk.CreatePDF.Operation.createNew();
        const insertInput = PDFToolsSdk.FileRef.createFromLocalFile(`static/pdf/${createFile}`);
        createPdfOperation.setInput(insertInput);

        // Execute the operation and Save the result to the specified location.
        try {
            const insertResult = await createPdfOperation.execute(executionContext);
            operations += 1;

            // Start mergePDF results
            const combineFilesOperation = PDFToolsSdk.CombineFiles.Operation.createNew();

            // Check if previous PDF exists and if it exists set it as input
            if (result) {
                combineFilesOperation.addInput(result);
            } else {
                combineFilesOperation.addInput(input);
            }

            combineFilesOperation.addInput(insertResult);

            try {
                result = await combineFilesOperation.execute(executionContext);
                operations += 1;
            } catch (err) {
                if (err instanceof PDFToolsSdk.Error.ServiceApiError
                    || err instanceof PDFToolsSdk.Error.ServiceUsageError) {
                    console.log('Exception encountered while executing operation', err);
                } else {
                    console.log('Exception encountered while executing operation', err);
                }
                throw err;
            }
        } catch (err) {
            if (err instanceof PDFToolsSdk.Error.ServiceApiError
                || err instanceof PDFToolsSdk.Error.ServiceUsageError) {
                console.log('Exception encountered while executing operation', err);
            } else {
                console.log('Exception encountered while executing operation', err);
            }
            throw err;
        }
    }

    // Delete pages operation
    if (pageToBeDeleted) {
        const deletePagesOperation = PDFToolsSdk.DeletePages.Operation.createNew();
        // Check if previous PDF exists and if it exists set it as input
        if (result) {
            deletePagesOperation.setInput(result);
        } else {
            deletePagesOperation.setInput(input);
        }

        const getPageRangesForDeletion = () => {
            // Specify pages for deletion.
            const pageRangesForDeletion = new PDFToolsSdk.PageRanges();
            // Add page
            pageRangesForDeletion.addSinglePage(Number(pageToBeDeleted));
            return pageRangesForDeletion;
        };
        // Delete pages of the document (as specified by PageRanges).
        const pageRangesForDeletion = getPageRangesForDeletion();
        deletePagesOperation.setPageRanges(pageRangesForDeletion);

        try {
            result = await deletePagesOperation.execute(executionContext);
            operations += 1;
        } catch (err) {
            if (err instanceof PDFToolsSdk.Error.ServiceApiError
                || err instanceof PDFToolsSdk.Error.ServiceUsageError) {
                console.log('Exception encountered while executing operation', err);
            } else {
                console.log('Exception encountered while executing operation', err);
            }
            throw err;
        }
    }

    // Reorder Page Operation
    if (reorderPages) {
        const reorderPagesOperation = PDFToolsSdk.ReorderPages.Operation.createNew();
        const getPageRangeForReorder = () => {
            // Specify order of the pages for an output document.
            const pageRanges = new PDFToolsSdk.PageRanges();
            const ranges = reorderPages.split(',');
            ranges.forEach((obj) => {
                if (obj.includes('-')) {
                    const second = obj.split('-');
                    pageRanges.addPageRange(Number(second[0]), Number(second[1]));
                } else {
                    pageRanges.addSinglePage(Number(obj));
                }
            });
            return pageRanges;
        };

        const pageRanges = getPageRangeForReorder();
        // Check if previous PDF exists and if it exists set it as input
        if (result) {
            reorderPagesOperation.addInput(result);
        } else {
            reorderPagesOperation.addInput(input);
        } reorderPagesOperation.setPagesOrder(pageRanges);
        try {
            result = await reorderPagesOperation.execute(executionContext);
            operations += 1;
        } catch (err) {
            if (err instanceof PDFToolsSdk.Error.ServiceApiError
                || err instanceof PDFToolsSdk.Error.ServiceUsageError) {
                console.log('Exception encountered while executing operation', err);
            } else {
                console.log('Exception encountered while executing operation', err);
            }
            throw err;
        }
    }
    if (fileNameToInsertPage && sourcePage && insertablePage) {
        console.log(fileNameToInsertPage, sourcePage, insertablePage);
        const getPageRangesForFirstFile = () => {
            // Specify which pages of the first file are to be inserted in the base file.
            const pageRangesForFirstFile = new PDFToolsSdk.PageRanges();
            const ranges = insertablePage.split(',');

            ranges.forEach((obj) => {
                if (obj.includes('-')) {
                    const second = obj.split('-');
                    pageRangesForFirstFile.addPageRange(Number(second[0]), Number(second[1]));
                    console.log(Number(second[0]), Number(second[1]));
                } else {
                    pageRangesForFirstFile.addSinglePage(Number(obj));
                }
            });
            return pageRangesForFirstFile;
        };

        const insertPagesOperation = PDFToolsSdk.InsertPages.Operation.createNew();

        // Check if previous PDF exists and if it exists set it as input
        if (result) {
            insertPagesOperation.setBaseInput(result);
        } else {
            insertPagesOperation.setBaseInput(input);
        }

        // Create a FileRef instance using a local file.
        const fileToInsert = PDFToolsSdk.FileRef.createFromLocalFile(`static/pdf/${fileNameToInsertPage}`);
        const pageRanges = getPageRangesForFirstFile();

        // Adds the pages (specified by the page ranges) of the input PDF file to be inserted at
        // the specified page of the base PDF file.
        insertPagesOperation.addPagesToInsertAt(Number(sourcePage), fileToInsert, pageRanges);

        // Execute the operation and Save the result to the specified location.
        try {
            result = await insertPagesOperation.execute(executionContext);
            operations += 1;
        } catch (err) {
            if (err instanceof PDFToolsSdk.Error.ServiceApiError
                || err instanceof PDFToolsSdk.Error.ServiceUsageError) {
                console.log('Exception encountered while executing operation', err);
            } else {
                console.log('Exception encountered while executing operation', err);
            }
            throw err;
        }
    }
    // Save the file
    try {
        if (operations !== 0) {
            // Remove the previous file
            deleteIfExists(fileName);
            await result.saveAsFile(`static/output/${fileName}.pdf`);
            console.log('Not printing');
        }
    } catch (err) {
        // If error, send it
        console.log(err);
        return 'Error';
    }
    return 'Success';
}

module.exports = editPDF;
