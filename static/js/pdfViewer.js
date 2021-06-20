/* eslint-disable no-undef */
/**
 * Function to embed a PDF Viewer
 */
document.addEventListener('adobe_dc_view_sdk.ready', () => {
    const adobeDCView = new AdobeDC.View({ clientId: client_id, divId: 'adobe-dc-view' });
    const previewFilePromise = adobeDCView.previewFile(
        {
            content: { location: { url: `/output/${fileName}` } },
            metaData: { fileName, id: fileName },
        },
        {
            enableAnnotationAPIs: true,
            includePDFAnnotations: true,
        },
    );
    const eventOptions = {
        // Pass the events to receive.
        listenOn: [
            'ANNOTATION_ADDED', 'ANNOTATION_DELETED', 'ANNOTATION_UPDATED',
        ],
    };

    // Set up a user prfile
    const profile = {
        userProfile: {
            name: username,
        },
    };

    adobeDCView.registerCallback(
        AdobeDC.View.Enum.CallbackType.GET_USER_PROFILE_API,
        () => new Promise((resolve) => {
            resolve({
                code: AdobeDC.View.Enum.ApiResponseCode.SUCCESS,
                data: profile,
            });
        }),
        {},
    );

    // receive the comments on opening of a PDF
    $.ajax({
        method: 'POST',
        url: '/getComments',
        data: {
            fileName,
            candidate,
        },
        success: (response) => {
            previewFilePromise.then((adobeViewer) => {
                adobeViewer.getAnnotationManager().then((annotationManager) => {
                    annotationManager.addAnnotations(response)
                        // eslint-disable-next-line no-console
                        .then(() => console.log('Success'))
                        // eslint-disable-next-line no-console
                        .catch((error) => console.log(error));
                    // Register events to be sent to the server
                    annotationManager.registerEventListener(
                        (event) => {
                            switch (event.type) {
                            case 'ANNOTATION_ADDED':
                                $.ajax({
                                    method: 'POST',
                                    url: '/post-comment',
                                    data: {
                                        id: event.data.id,
                                        candidate,
                                        fileName,
                                        comment: event.data,
                                    },
                                });
                                break;
                            case 'ANNOTATION_DELETED':
                                $.ajax({
                                    method: 'POST',
                                    url: '/delete-comment',
                                    data: {
                                        id: event.data.id,
                                    },
                                });
                                break;
                            case 'ANNOTATION_UPDATED':
                                $.ajax({
                                    method: 'POST',
                                    url: '/edit-comment',
                                    data: {
                                        id: event.data.id,
                                        comment: event.data,
                                    },
                                });
                                break;
                            default:
                                break;
                            }
                        },
                        eventOptions,
                    );
                });
            });
        },
    });
});
