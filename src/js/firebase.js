
var currentGuestId,
currentGuestTeam,
currentUserHitCount = 0,
currentUserHitCountRef = new Firebase("http://tape-it-hamburg.firebaseio.com/dev/hitCounts/" + currentGuestId + ""),
guestRef = new Firebase("http://tape-it-hamburg.firebaseio.com/dev/guests"),
currentGuestRef,
hitCountsRef = new Firebase("http://tape-it-hamburg.firebaseio.com/dev/hitCounts"),
hitCountsOrangeRef = new Firebase("http://tape-it-hamburg.firebaseio.com/dev/hitCounts/orange"),
hitCountsBlueRef = new Firebase("http://tape-it-hamburg.firebaseio.com/dev/hitCounts/blue"),

guestList = [];


// "92F28C2E"

function initialize() {

    $.urlParam = function(name){
        var results = new RegExp('[\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
        return results[1] || 0;
    }


    $(document).ready(function(){


        $(".ball").each(function(key, value){

            $(this).attr("id", "ball-" + key);
            $(this).on("click", function(event) {
                toggleHit(key);
            });

        });

        var id = $.urlParam('id');

        if (id) {
            currentGuestId = id;

            currentGuestRef = new Firebase("http://tape-it-hamburg.firebaseio.com/dev/guests/" + currentGuestId);
            currentGuestRef.once("value", function(snapshot) {

                var guest = snapshot.val();

                if (guest !== null) {

                    $(".currentGuestId").html(currentGuestId);
                    $(".currentGuestTeam").html(guest.team);
                    $(".loggedStatusMessage").html("angemeldet (id: " + currentGuestId + ", team: " + guest.team + ")");

                } else {

                    $(".loggedStatusMessage").html("Gast nicht bekannt.");

                }

                watchCurrentGuestHitCount();
                watchCurrentGuestHits();




            }, function (errorObject) {

                $(".loggedStatusMessage").html("Fehler: " + errorObject.code);


                console.log("The read failed: " + errorObject.code);

            });

            watchScore();

        }

    });

}


function updateHitCount() {

    currentGuestRef.child("hits").once("value", function(snapshot) {

        var hits = snapshot.val(), count = 0;

        for (var key in hits) {

            if (hits[key]) {

                count++;

            }
        }

        currentUserHitCount = count;

        hitCountsRef.child("'" + currentGuestTeam + "'").child("'" + currentGuestId + "'").set(currentUserHitCount);


    });

}


function watchCurrentGuestHitCount() {

    currentGuestRef.on("value", function(snapshot) {

        var guest = snapshot.val();
        currentUserHitCount = guest.hitCount;

        $(".currentUserHitCount").html(currentUserHitCount);

    }, function (errorObject) {

        console.log("The read failed: " + errorObject.code);

    });

}

function watchCurrentGuestHits() {

    currentGuestRef.on("value", function(snapshot) {

        var guest = snapshot.val(),
        hits = guest.hits;

        console.log(hits);


        for (var key in hits) {

            console.log(hits[key]);

            if (hits[key]) {

                $("#ball-" + key).addClass("ball--hit");

            } else {

                $("#ball-" + key).removeClass("ball--hit");

            }
        }

    }, function (errorObject) {

        console.log("The read failed: " + errorObject.code);

    });

}



function watchScore() {

    var scoreOrange, scoreBlue;

    hitCountsRef.on("value", function(snapshot) {

        var hitCounts = snapshot.val(),
        scoreOrange = 0;

        for (var key in hitCounts.orange) {

            scoreOrange += hitCounts[key].hitCount;
        }

        $(".scoreOrange").html(scoreOrange);

        scoreBlue = 0;

        for (key in hitCounts.blue) {

            scoreBlue += hitCounts[key].hitCount;
        }

        $(".scoreBlue").html(scoreBlue);



    });

}


function toggleHit(hitId) {

    console.log("toggleHit (hitId: " + hitId + ", guestId: " + currentGuestId + ")");

    var currentGuestHitRef = new Firebase("http://tape-it-hamburg.firebaseio.com/dev/guests/" + currentGuestId + "/hits/" + hitId);

    currentGuestRef.child("hits").child(hitId).once("value", function(snapshot) {

        var hit = snapshot.val();

        if (hit === 1) {

            currentGuestHitRef.set(0);

        } else {

            currentGuestHitRef.set(1);

        }

        updateHitCount();

        console.log("new hit count for guest: " + currentUserHitCount);

    }, function (errorObject) {

        console.log("The read failed: " + errorObject.code);

    });


}


function updateGuests() {


    var defaultHitsArray = [];

    for (var i = 0; i < 50; i++) {
        defaultHitsArray.push(0);
    }


    function addNewGuest(id, team) {

        guestRef.child(id).once('value', function(snapshot) {

            if (snapshot.val() === null) {

                if (team === "orange") {

                    hitCountsOrange.child(id).set({'hitCount': 0});

                } else if (team === "blue") {

                    hitCountsBlue.child(id).set({'hitCount': 0});

                }

                guestRef.child(id).set({
                    "team": team,
                    "hitCount" : 0,
                    "hits": defaultHitsArray}, function(){

                        console.log("guest " + id + " added.");
                    }
                );


            } else {

                console.log("guest " + id + " already in databse.");

            }

        });

    }



    function readGoogleSheetAndPublishToFirebase() {


        Papa.parse(

            "https://docs.google.com/spreadsheets/d/1-184_2Axar-YTlrybhsQLiByG0MMuftBWjYwTGK6JqI/export?format=csv", {
                download: true,
                header: true,

                complete: function(result) {


                    for (var rowItr in result.data) {

                        var row = result.data[rowItr];

                        addNewGuest(row.id, row.team);

                    }
                }
            }
        );
    }

    // readGoogleSheetAndPublishToFirebase();


}

initialize();
