/* eslint-disable no-console */
/**
 * Function to get the names of all checked candidates
 */
const getValues = () => {
    const candidates = [];
    // eslint-disable-next-line func-names
    $('input:checkbox:checked').each(function () {
        console.log(this);
        candidates.push($(this).val());
    });
    return candidates;
};

/**
 * Function to post data to initiate-contract route
 */
$('#initiate-contract').on('click', () => {
    const candidates = getValues();
    const contractName = $('#contract-name').val();
    let error = false;

    console.log(candidates.length === 0);
    if (candidates.length === 0) {
        $('.error-candidate').text('Please select some candidates');
        error = true;
    }
    if (!contractName) {
        $('.error-name').text('Please provide a name for the contract');
        error = true;
    }
    if (!error) {
        $.ajax({
            method: 'POST',
            url: '/initiate-contract',
            data: {
                // eslint-disable-next-line no-undef
                username,
                contractName,
                candidates,
            },
            success: () => {
                window.location.reload();
            },
            error: (data) => {
                $('.error-name').text(data.responseText);
            },
        });
    }
});

/**
 * Function to approve a contract
 */
$('.approve').on('click', (e) => {
    // Get contractname and candidate name using jquery
    const contractName = $(e.target).parents('tr').find('#fileName').text()
        .split('.')[0];
    const candidate = $(e.target).parents('tr').find('#candidateName').text();
    console.log(contractName, candidate);
    $.ajax({
        url: '/changeStatus',
        method: 'POST',
        data: {
            contractName,
            candidate,
            role: 'Company',
            task: 'Approve',
        },
        success: () => {
            window.location.reload();
        },
    });
});

/**
 * Function to signing page and document also to show sign modal
 */
$('.sign-link').on('click', (e) => {
    const contractName = $(e.target).parents('tr').find('#fileName').text()
        .split('.')[0];
    const candidate = $(e.target).parents('tr').find('#candidateName').text();
    console.log(contractName, candidate);
    window.open('/signPage/company');

    // Settings to show the modal
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
    // Set the status as signed
    $('.signed').on('click', () => {
        $.ajax({
            method: 'POST',
            url: '/changeStatus',
            data: {
                contractName,
                candidate,
                role: 'Company',
                task: 'Sign',
            },
            success: () => {
                window.location.reload();
            },
        });
    });
});

/**
 * Function to cancel the contract
 */
$('.cancel').on('click', (e) => {
    // Get contractname and candidate name using jquery
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
 * Function to delete a contract
 */
$('.delete').on('click', (e) => {
    const contractName = $(e.target).parents('tr').find('#fileName').text()
        .split('.')[0];
    const candidate = $(e.target).parents('tr').find('#candidateName').text();
    $.ajax({
        method: 'POST',
        url: '/deleteContract',
        data: {
            candidate,
            contractName,
        },
        success: () => {
            window.location.reload();
        },
    });
});
