$(function() {
    //swal("Extra 20% off Groupon Local deals", "enter email to get code");
    window._hash = window.location.hash;

    $('#tabs').tabulous({});

    $('.js-email').val('');
    $(document).on('click', '.js-submit', function() {
        checkEmail();
    });

    $('a[href*=#]:not([href=#])').click(function() {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top
                }, 1000);
                return false;
            }
        }
    });


});

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


function checkEmail() {
    var email = document.querySelector('.js-email').value;
    if (validateEmail(email)) {
        sendEmail(email);
    } else {
        sweetAlert("Oops...", "enter your valid email!", "error");
    }
}

function sendEmail(email) {
    $('.js-submit').text('processing...');

    var hash = window._hash;
    hash = hash.replace('#', '');

    $.post('/process_email/' + email + '/' + hash, function(data) {

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