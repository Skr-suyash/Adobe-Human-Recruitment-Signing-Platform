// Show the company form fields
$('#company_radio').on('click', () => {
    $('.candidate_register').hide();
    $('.company_register').show();
});

// Show the candidate form fields
$('#candidate_radio').on('click', () => {
    $('.candidate_register').show();
    $('.company_register').hide();
});

// Set up form validation
$('.signin__form').validate({
    rules: {
        company_pass_confirm: {
            equalTo: '#companyPassword',
        },
        candidate_pass_confirm: {
            equalTo: '#candidate_password',
        },
    },
    errorElement: 'span',
});
