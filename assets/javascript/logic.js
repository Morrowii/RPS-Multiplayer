// Clean and annotate code, write README, add to portfolio, submit
// Online/offline functionality, send/recieve challenges, accept/decline challenges, start game, get game working, create/dynamically update stats section

var dbref = firebase.database().ref();

dbref.once('value', function(snapshot) {
    if (snapshot.hasChild('Users')) {
      console.log('Users folder already exists.');
    }
    else {
        dbref.child('Users').set(0);
    }
  });

var name = 'Anonymous';

$('.container-fluid').on('click', '#name-submit', function() {

    name = $('#username').val();

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
        }
        else {
            dbref.child('Users/' + name).set(0);
    
            dbref.child('Users/' + name).set({
                Online: true,
                Choice: 'None',
                Plays: 0,
                Wins: 0,
                Losses: 0,
                Challenger: 'None'
            });
            loginAnimation();
            lobby();
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

var timer = setInterval(lobby, 15000);

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

var challenger = '';

$('#lobby').on('click', 'button', function() {
    $('#hud').empty();
    challenger = $(this).text();
    var challengerHead = $('<h4>').text(challenger);
    var challengeBtn = $('<button id="challenge-btn">').text('Challenge');
    var surrenderBtn = $('<button id="surrender-btn">').text('Surrender');
    $('#hud').append(challengerHead, challengeBtn, surrenderBtn);

    dbref.child('Users/' + challenger).once('value', function(snapshot) {
        // Something
    });
});

$('#hud').on('click', '#challenge-btn', function() {
    dbref.child('Users/' + challenger).update({
        Challenger: name
    });
});

dbref.child('Users/' + name + '/Challenger').on('value', function() {

});