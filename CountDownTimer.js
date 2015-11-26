// Code taken from http://stackoverflow.com/questions/20618355/the-simplest-possible-javascript-countdown-timer.
// Written by robbmj (http://stackoverflow.com/users/2126755/robbmj)
// Downloaded by Peter Brown on 2015-11-24
// Modified to allow the timer to be stopped.  (Restarting is not supported.)


function CountDownTimer(duration, granularity) {
    this.duration = duration;
    this.granularity = granularity || 1000;
    this.tickFtns = [];
    this.timeoutID = undefined;
    this.timeLeft = 0;
}

CountDownTimer.prototype.start = function() {
    if (this.timeoutID !== undefined) {
	return;
    }
    var start = Date.now(),
	that = this,
	obj;

    (function timer() {
	that.timeLeft = that.duration - (((Date.now() - start) / 1000) | 0);

	if (that.timeLeft > 0) {
	    that.timeoutID = setTimeout(timer, that.granularity);
	} else {
	    that.timeLeft = 0;
	    that.timeoutID = undefined;
	}

	obj = CountDownTimer.parse(that.timeLeft);
	that.tickFtns.forEach(function(ftn) {
	    ftn.call(this, obj.minutes, obj.seconds);
	}, that);
    }());
};

CountDownTimer.prototype.onTick = function(ftn) {
    if (typeof ftn === 'function') {
	this.tickFtns.push(ftn);
    }
    return this;
};

CountDownTimer.prototype.expired = function() {
    return this.timeLeft === 0;
};

CountDownTimer.prototype.stop = function() {
    if (this.timeoutID !== undefined) {
	clearTimeout(this.timeoutID);
	this.timeoutID = undefined;
    }
};

CountDownTimer.parse = function(seconds) {
    return {
	'minutes': (seconds / 60) | 0,
	'seconds': (seconds % 60) | 0
    };
};
