function update(){
var launch_date = moment().countdown("2014-12-01", countdown.DAYS|countdown.HOURS|countdown.MINUTES|countdown.SECONDS, NaN, 0); //=> '30 years, 10 months, 14 days, 1 hour, 8 minutes, and 14 seconds'
document.querySelector('.days i').textContent = launch_date.days;
document.querySelector('.hours i').textContent = launch_date.hours;
document.querySelector('.mins i').textContent = launch_date.minutes;
document.querySelector('.secs i').textContent = launch_date.seconds;

}

 update();
 setInterval(update, 1000);