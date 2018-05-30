// clean and annotate code
// logout functionality, decline challenges, fix referee function running twice per round (double stats)
// reset 'Challenger' and 'Playing' keys when leaving game (otherwise game breaks when logging back in)

var dbref = firebase.database().ref();
var timer = setInterval(lobby, 10000);
var name = 'Anonymous';
var challengedUser = '';
var opponent = '';
var uChoice = '';
var oChoice = '';
var plays = 0;
var wins = 0;
var losses = 0;
var startMsg = null;

dbref.once('value', function(snapshot) {
    if (snapshot.hasChild('Users')) {
      console.log('Users folder already exists.');
    }
    else {
        dbref.child('Users').set(0);
    }
});

$('.container-fluid').on('click', '#name-submit', function() {
    name = $('#username').val();
    $('#logged-in-as').text(name);
    dbref.once('value', function(snapshot) {
        if (name == '' || name == 'Anonymous') {
            alert('Please enter a valid username.')
        }
        else if (snapshot.hasChild('Users/' + name)) {
            console.log('Username already exists.');
            dbref.child('Users/' + name).update({
                Online: true
            });
            loginAnimation();
            lobby();
            pullStats();
            updateStats();
            challenges();
        }
        else {
            dbref.child('Users/' + name).set(0);
            dbref.child('Users/' + name).set({
                Online: true,
                Playing: false,
                Choice: '',
                Plays: 0,
                Wins: 0,
                Losses: 0,
                Challenger: '',
                Opponent: ''
            });
            loginAnimation();
            lobby();
            updateStats();
            challenges();
        }
    });
});

function loginAnimation() {
    setTimeout( function() {
        $('body').css({'overflow': 'auto'});
    }, 4000);
    $('#banner').animate( {
        'margin-top': '20px'
    }, 2000 );
    $('#login-area').animate( {
        'opacity': '0'
    }, 2000);
    setTimeout( function() {
        $('#login-area').addClass('d-none');
    }, 2000);
    setTimeout( function() {
        $('#play-area').removeClass('d-none').addClass('d-flex');
        $('#play-area').animate( {
            'opacity': '1',
            'margin-top': '20px'
        }, 2000);
        $('#stats').animate( {
            'opacity': '1'
        }, 2000);
    }, 2000);
    setTimeout( function() {
        $('#lower-ui').removeClass('d-none');
        $('#lower-ui').animate( {
            'opacity': '1'
        }, 2000);
    }, 4000);
};

$('#send-button').on('click', function() {
    var message = $('#message-input').val();
    dbref.child('Messaging').push({
        userName: name,
        userMessage: message
    });
});

dbref.child('Messaging').on('child_added', function(childsnapshot) {
    if ($('#message-list').text() === null) {
        $('#message-list').text('');
    }
    var previousMessages = $('#message-list').text();
    $('#message-list').text(previousMessages + '\n' + childsnapshot.val().userName + ': ' + childsnapshot.val().userMessage);
});

function lobby() {
    $('#lobby').empty();
    dbref.child('Users').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var lobbyUser = childSnapshot.key;
            if (lobbyUser !== name) {
                var btn = $('<button>').text(lobbyUser).addClass('btn btn-light w-100 rounded-0');
                $('#lobby').append(btn);
            }
        });
    });
};

$('#lobby').on('click', 'button', function() {
    $('#hud').empty();
    challengedUser = $(this).text();
    var challengerHead = $('<h4>').text(challengedUser);
    var challengeBtn = $('<button id="challenge-btn">').text('Challenge');
    var surrenderBtn = $('<button id="surrender-btn">').text('Surrender');
    $('#hud').append(challengerHead, challengeBtn, surrenderBtn);
});

$('#hud').on('click', '#challenge-btn', function() {
    dbref.child('Users/' + challengedUser).update({
        Challenger: name
    });
    var waitingMsg = $('<h4>').text('Waiting for player to accept your challenge.');
    $('#hud').empty().append(waitingMsg);
});

function challenges() {
    dbref.child('Users/' + name).on('value', function(snapshot) {
        if (snapshot.val().Playing === true && startMsg === null) {
            startMsg = $('<h4>').text('Challenge accepted! Choose your weapon.');
            $('#hud').empty().append(startMsg);
        }
        else if (snapshot.val().Playing === false && snapshot.val().Challenger !== '') {
            $('#hud').empty();
            var challengeMsg = $('<h4>').text(snapshot.val().Challenger);
            var acceptBtn = $('<button id="accept-btn">').text('Accept');
            var declineBtn = $('<button id="decline-btn">').text('Decline');
            $('#hud').append(challengeMsg, acceptBtn, declineBtn);
        };
    });
};

$('#hud').on('click', '#accept-btn', function() {
    opponent = $('h4').text();
    dbref.child('Users/' + name).update({
        Playing: true,
        Opponent: opponent
    });
    dbref.child('Users/' + opponent).update({
        Playing: true,
        Opponent: name
    });
    // Message
});

$('.game-btn').on('click', function() {
    var temp = $(this).attr('value');
    dbref.child('Users/' + name).once('value', function(snapshot) {
        if (snapshot.val().Playing === true) {
            uChoice = temp;
            opponent = snapshot.val().Opponent;
            dbref.child('Users/' + name).update({
                Choice: uChoice
            });
        }
    });
});

dbref.child('Users/').on('value', function() {
    dbref.child('Users/' + opponent).once('value', function(snapshot) {
        if (opponent !== '') {
            oChoice = snapshot.val().Choice;
        }
    });
    if (uChoice !== '' && oChoice !== '') {
        referee();
        updateStats();
        reset();
    }
});

//
//
//pushStats();
//
//

function referee() {
    if (oChoice == uChoice) {
        var gameMessage = $('<h4>').text("You Tied!");
    }
    else if ((oChoice == "sword" && uChoice == "shield") || (oChoice == "shield" && uChoice == "daggers") || (oChoice == "daggers" && uChoice == "sword")) {
        var gameMessage = $('<h4>').text("You Win!");
        wins++;
    }
    else if ((oChoice == "sword" && uChoice == "daggers") || (oChoice == "shield" && uChoice == "sword") || (oChoice == "daggers" && uChoice == "shield")) {
        var gameMessage = $('<h4>').text("You Lose!");
        losses++;
    }
    $('#hud').empty().append(gameMessage);
    plays++;
}

function updateStats()  {
    $('#plays').text(plays.toString());
    $('#wins').text(wins.toString());
    $('#losses').text(losses.toString());
};

function pullStats() {
    dbref.child('Users/' + name).once('value', function(snapshot) {
        plays = snapshot.val().Plays;
        wins = snapshot.val().Wins;
        losses = snapshot.val().Losses;
    });
};

function pushStats() {
    dbref.child('Users/' + name).update({
        Plays: plays,
        Wins: wins,
        Losses: losses
    });
};

function reset() {
    uChoice, oChoice = '';
    dbref.child('Users/' + name).update({
        Choice: ''
    });
    dbref.child('Users/' + opponent).update({
        Choice: ''
    });
};