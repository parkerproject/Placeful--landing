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

  $("#exampleInputFile").change(function () {

    var image, file;
    var _URL = window.URL || window.webkitURL;

    if ((file = this.files[0])) {
      image = new Image();
      image.onload = function () {
        if (this.width < 500 || this.width > 1500) {
          alert('Image must be between 500px and 1500 wide');
          $('.preview-js').attr("disabled", "disabled");
        } else {
          $('.preview-js').removeAttr("disabled");
        }
      };
      image.src = _URL.createObjectURL(file);
      readURL(this);
    }

  });

  function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
  var coupon_code = makeid();
  $('.coupon-js').text(coupon_code.toUpperCase());
  $('input[name=coupon_code]').val(coupon_code.toUpperCase());

});

function readURL(input) {

  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      $('.deal_image').attr('src', e.target.result);
    };

    reader.readAsDataURL(input.files[0]);
  }
}

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
      required: "category is required",
    },
  },

  rules: {
    discount_value: {
      digits: true
    }
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
      if (data.discount_type === '%') {
        myModal.find('.offer').text(data.discount_value + data.discount_type + ' Off');
      }
      if (data.discount_type === '$') {
        myModal.find('.offer').text(data.discount_type + data.discount_value + ' Off');
      }
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

$('.publish_deal').click(function () {
  $("#dealForm").find('input[name=publish]').val('yes');
  $(this).attr("disabled", "disabled").text('Processing...');
  document.forms.dealForm.submit();
});

$('.save_deal').click(function () {
  $("#dealForm").find('input[name=publish]').val('no');
  $(this).attr("disabled", "disabled").text('Processing...');
  document.forms.dealForm.submit();
});


//Date range picker
$('#reservation').daterangepicker({
  minDate: moment().format('L')
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


//iCheck for checkbox and radio inputs
$('input[type="checkbox"].minimal, input[type="radio"].minimal').iCheck({
  checkboxClass: 'icheckbox_minimal-blue',
  radioClass: 'iradio_minimal-blue'
});
//Red color scheme for iCheck
$('input[type="checkbox"].minimal-red, input[type="radio"].minimal-red').iCheck({
  checkboxClass: 'icheckbox_minimal-red',
  radioClass: 'iradio_minimal-red'
});

// view deal in modal on manage deal page
$('.view-modal').click(function () {
  var self = $(this);
  var viewModal = $('#viewModal');
  viewModal.find('.title').text(self.data('title'));
  viewModal.find('.offer').text(self.data('offer'));
  viewModal.find('.description').text(self.data('description'));
  viewModal.find('.disclosure').text(self.data('fineprint'));
  viewModal.find('.coupon-img').attr('src', self.data('largeimage'));
  viewModal.find('.small_image').attr('src', self.data('smallimage'));
  viewModal.find('.code').text(self.data('code'));
  viewModal.find('.expiry_date').text(self.data('expires'));
  viewModal.find('.edit_deal').attr('href', '/business/deal/edit?id=' + self.data('deal_id'));
  viewModal.modal();
});

// make edit to deal
$('.delete-deal-js').click(function (e) {
  e.preventDefault();
  var result = confirm("Are you sure about deleting this deal?");
  if (result) {
    $('.delete-deal-js').text('Deleting deal...');
    var deal_id = $("#editForm").find('input[name=deal_id]').val();
    var merchant_id = $("#editForm").find('input[name=business_id]').val();
    $.post("/business/deal/delete_deal", {
      deal_id: deal_id,
      merchant_id: merchant_id
    }, function (data, status) {
      if (status === 'success') {
        window.location = '/business/manage_deals';
      }
    });
  }
});

$('.save-change-js').click(function () {
  $(this).text('Saving deal...');
});