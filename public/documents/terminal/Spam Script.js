$(function() {
    // 1. Initialize the terminal
    var term = $('body').terminal(function(command) {
        // Basic interpreter
        this.echo('You typed: ' + command);
    }, {
        greetings: 'Spammer Ready'
    });

    // 2. Spam "hello"
    setInterval(function() {
        term.echo('hello');
    }, 100); // 100ms interval
});
