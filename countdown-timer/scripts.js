let interval;
const timerDisplay = document.querySelector('.display__time-left');
const endTime = document.querySelector('.display__end-time');
const buttons = document.querySelectorAll('[data-time]');

function timer(seconds) {
  clearInterval(interval);
  const now = Date.now();
  const then = now + seconds * 1000;
  displayLeftTime(seconds);
  displayEndTime(then)

  interval = setInterval(() => {
    const secondsLeft = Math.round((then - Date.now()) / 1000)

    if(secondsLeft < 0) return clearInterval(interval);
    
    displayLeftTime(secondsLeft);

  }, 1000);
}

function displayLeftTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const hoursRemainder = seconds % 3600;

  const minutes = Math.floor(hoursRemainder / 60);
  const minutesRemainder = hoursRemainder % 60;

  const secondsLeft = Math.floor(minutesRemainder % 60);

  const toDisplay = formatTime(hours, minutes, secondsLeft);

  timerDisplay.textContent = toDisplay;
  document.title = toDisplay;
}

function displayEndTime(timestamp) {
  const end = new Date(timestamp);
  const hour = end.getHours();
  const minutes = end.getMinutes();
  const seconds = end.getSeconds();
  endTime.textContent = `Be Back At ${formatTime(hour, minutes, seconds)}`;
}

function formatTime(hours, minutes, seconds) {
  return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

buttons.forEach(button => button.addEventListener('click', startTimer));
function startTimer() {
  const seconds = parseInt(this.dataset.time);
  timer(seconds);
}


document.customForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const mins = this.minutes.value;
  timer(mins * 60);
  this.reset();
});
