$(function() {
    $('.js-email').val('');
    $(document).on('click', '.js-submit', function() {
        checkEmail();
    });


});

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


function checkEmail() {
    var email = document.querySelector('.js-email').value;
    if (validateEmail(email)) {
        //$('.js-email').removeClass('js-error');
        sendEmail(email);
    } else {
			sweetAlert("Oops...", "enter your valid email!", "error");
        //$('.js-email').addClass('js-error');
    }
}

function sendEmail(email) {
    $('.js-submit').text('processing...');
    $.post('/process_email/' + email, function(data) {
        console.log(data);
        if (data === 1) {
            window.location = "/fbconfirm";
        } else {
					$('.js-submit').text('get invite');
					swal('You have already submitted your email.');
            //document.querySelector('.form').innerHTML = '<i class="notify animated bounceInRight">' + data + '</i>';
        }


    });
}

function animationBoxedSales() {
    $('.move-1').addClass('bounceInDown');
}