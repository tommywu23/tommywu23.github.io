$(window).scroll(function() {
    alert('aaaa');
    var scrollBottom = $(window).scrollTop() + $(window).height();
    
    if ($(window).scrollTop() > 100) {
        alert('add');
        $('body').addClass('nav-hidden');
    } else {
        alert('remove');
        $('body').removeClass('nav-hidden');
    }
});

$(".full img").click(function() {
  $(".full img").toggleClass('zoom');
});