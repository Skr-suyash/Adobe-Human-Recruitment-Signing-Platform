/**
 * Set up Form Validation
 */
$('#pdfForm').validate({
    rules: {
        pageDelete: {
            digits: true,
        },
        splitDocValue: {
            digits: true,
        },
        pageInsertSource: {
            digits: true,
        },
        createFile: {
            extension: 'xlsx|xls|png|jpeg|doc|docx|ppt|pptx|txt',
        },
    },
    messages: {
        file: 'Please select a file',
        fname: 'Please provide a name for the file',
    },
    errorElement: 'span',
});

/**
 * Function to save a PDF when edits are made
 */
$('#savePDF').on('click', () => {
    // Check if the Form is valid
    if ($('#pdfForm').valid()) {
        // Show the loader
        window.scrollTo({ top: 0, behavior: 'smooth' });
        $('.overlay').show();

        const mergableList = [];
        const createFile = $('#createFile').val().split('\\').pop();
        const deletePages = $('#pageDelete').val();
        const reorderPages = $('#reorderPages').val();
        const mergePdfs = $('#multiplePDFs')[0].files;
        const fileNameToBeInserted = $('#insertPageFile').val().split('\\').pop();
        const pageInsert = $('#pageInsert').val();
        const pageInsertSource = $('#pageInsertSource').val();
        // Send all the mergable PDFs in form of an array
        for (let index = 0; index < mergePdfs.length; index += 1) {
            mergableList.push(mergePdfs[index].name);
        }
        const data = {
            // eslint-disable-next-line no-undef
            fileName,
            createFile,
            deletePages,
            reorderPages,
            mergableList,
            fileNameToBeInserted,
            pageInsert,
            pageInsertSource,
        };

        // Send request to the server
        $.ajax({
            method: 'POST',
            url: '/processPDF',
            data,
            success: () => {
                $('.overlay').hide();
                window.location.reload();
            },
            error: () => {
                $('.overlay').hide();
                $('.serverError').text(`
                    Bad input provided. Page number, range or file does not exists`);
            },
        });
    }
});

/**
 * Finalize the contract and send request to server
 */
$('#finalize').on('click', () => {
    $.ajax({
        url: '/finalize-contract',
        method: 'POST',
        data: {
            // eslint-disable-next-line no-undef
            contractName: fileName,
        },
        success: () => {
            // eslint-disable-next-line no-undef
            window.location.href = `/dashboard/company/${company}/${user}`;
        },
    });
});

/**
 * Show the PDF Viewer
 */
document.addEventListener('adobe_dc_view_sdk.ready', () => {
    // eslint-disable-next-line no-undef
    const adobeDCView = new AdobeDC.View({ clientId: 'ef4299cdaee54366b520d02e4436608b', divId: 'adobe-dc-view' });
    adobeDCView.previewFile({
        // eslint-disable-next-line no-undef
        content: { location: { url: `/output/${fileName}.pdf` } },
        // eslint-disable-next-line no-undef
        metaData: { fileName },
    }, { embedMode: 'SIZED_CONTAINER' });
});
