/**
 * Function to approve the comment and send data to server
 */
$('.approve').on('click', (e) => {
    const contractName = $(e.target).parents('tr').find('#fileName').text()
        .split('.')[0];
    const candidate = $(e.target).parents('tr').find('#candidateName').text();
    $.ajax({
        method: 'POST',
        url: '/changeStatus',
        data: {
            contractName,
            candidate,
            role: 'Candidate',
            task: 'Approve',
        },
        success: () => {
            window.location.reload();
        },
    });
});

/**
 * Function to cancel a contract and hide the contract
 */
$('.cancel').on('click', (e) => {
    const contractName = $(e.target).parents('tr').find('#fileName').text()
        .split('.')[0];
    const candidate = $(e.target).parents('tr').find('#candidateName').text();
    $.ajax({
        url: '/changeStatus',
        method: 'POST',
        data: {
            contractName,
            candidate,
            role: 'Company',
            task: 'Cancel',
        },
        success: () => {
            window.location.reload();
        },
    });
});

/**
 * Function to open the sign link and show a modal for status
 */
$('.sign-link').on('click', (e) => {
    const contractName = $(e.target).parents('tr').find('#fileName').text()
        .split('.')[0];
    const candidate = $(e.target).parents('tr').find('#candidateName').text();
    window.open('/signPage/candidate');
    $(window).on('focus', () => {
        $('.modal').trigger('focus');
    });
    $('.modal').modal('show');
    $('.closeModal').on('click', () => {
        $('.modal').modal('hide');
    });
    $('.close').on('click', () => {
        $('.modal').modal('hide');
    });
    // Send data to server
    $('.signed').on('click', () => {
        $.ajax({
            method: 'POST',
            url: '/changeStatus',
            data: {
                contractName,
                candidate,
                role: 'Candidate',
                task: 'Sign',
            },
            success: () => {
                window.location.reload();
            },
        });
    });
});
