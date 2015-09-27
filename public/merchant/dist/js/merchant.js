$(function () {
  $(document).on('click', '.cta', function (e) {
    e.preventDefault();
    checkEmail();
  });

});

function validateEmail(email) {
  var re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}


function checkEmail() {
  var business_name = $('input[name=business_name]').val();
  var business_email = $('input[name=business_email]').val();
  var password = $('input[name=password]').val();

  if (!validateEmail(business_email)) {
    $('.error').text('Enter valid business email');
  }

  if (business_name === '') {
    $('.error').text('Enter business name');
  }

  if (password === '') {
    $('.error').text('Enter password');
  }


  if (validateEmail(business_email) && business_name !== '' && password !== '') {
    sendEmail(business_email, business_name, password);
  }
}

function sendEmail(email, name, password) {
  $('.error').text('');
  $('.cta').text('processing...');


  var post_data = {
    'business_email': email,
    'business_name': name,
    'password': password
  };

  $.post('/business/register_post', post_data, function (response) {

    if (response.status !== 'failed') {
      $('.login-box-body').html('<a href="/business/login">'+response+'</a>');
    } else {
      document.querySelector('.error').innerHTML =
        'An error occured. Please try again later.';
      $('.cta').val('Signup');
    }

  });
}