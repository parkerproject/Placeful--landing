$(function () {
  $(document).on('click', '.cta', function (e) {
    e.preventDefault();
    checkEmail();
  });

  $('a[href*=#]:not([href=#])').click(function () {
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
  var re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}


function checkEmail() {
  var business_name = $('input[name=business_name]').val();
  var business_email = $('input[name=business_email]').val();
  var business_yelp = $('input[name=yelp_url]').val();
  var password = $('input[name=password]').val();
  var yelpFlag = false;

  if (!validateEmail(business_email)) {
    $('.error').text('Enter valid business email');
  }

  if (business_name === '') {
    $('.error').text('Enter business name');
  }

  if (password === '') {
    $('.error').text('Enter password');
  }

  if (business_yelp === '') {
    $('.error').text('Enter Yelp Business Page Url');
  }

  if (business_yelp.startsWith('http://www.yelp.com/biz/') || business_yelp.startsWith('www.yelp.com/biz/') || business_yelp.startsWith(
      'yelp.com/biz/')) {
    yelpFlag = true;
  } else {
    $('.error').text('Oops! Your Yelp URL doesn\'t look right');
  }


  if (validateEmail(business_email) && business_name !== '' && password !== '' && yelpFlag) {
    sendEmail(business_email, business_name, password, business_yelp);
  }
}

function sendEmail(email, name, password, yelp) {
  $('.error').text('');
  $('.cta').attr("disabled", "disabled");
  $('.cta').text('Processing');

  var form = $('#register-form');

  $.post('/business/register_post', form.serialize(), function (response) {

    if (response.status !== 'failed') {
      $('.login-box-body').html('<a href="/business/login">' + response + '</a>');
    } else {
      document.querySelector('.error').innerHTML = 'An error occured. Please try again later.';
    }

  });
}


$("#profileForm, #dealForm").validate({
  messages: {
    category: {
      required: "This field is required",
    },
  },
  submitHandler: function (form) {
    $('.preview-js').text('Processing...');
    var data = {};
    $("#dealForm").serializeArray().map(function (x) {
      data[x.name] = x.value;
    });
    var myModal = $('#myModal');

    $.get('/lab/yelp', {
      yelp_URL: data.yelp_URL
    }, function (res) {
      myModal.find('h2').text(data.title);
      myModal.find('.business_name').text(res.name);
      myModal.find('.finePrint').text(data.fine_print);
      myModal.find('.dealPrice').text(data.deal_price);
      myModal.find('.normalPrice').text(data.normal_price);
      myModal.find('.dealDescription').text(data.description);
      myModal.find('.dealDate span').text(data.deal_date);
      myModal.find('.dealPhone').text(res.display_phone);
      myModal.find('.dealCategory span').text(data.category);
      myModal.find('.dealAddress').text(res.location.display_address);
      $('#myModal').modal();
      $('.preview-js').text('Preview Deal');
      //form.submit();
    });
  }
});



//Date range picker
$('#reservation').daterangepicker();
//Date range picker with time picker
$('#reservationtime').daterangepicker({
  timePicker: true,
  timePickerIncrement: 30,
  format: 'MM/DD/YYYY h:mm A'
});
//Date range as a button
$('#daterange-btn').daterangepicker({
    ranges: {
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    },
    startDate: moment().subtract(29, 'days'),
    endDate: moment()
  },
  function (start, end) {
    $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
  }
);