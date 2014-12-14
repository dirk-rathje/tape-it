
var currentGuestId,
currentGuestTeam,
currentGuestHitCount = 0,
currentGuestHitCountRef = new Firebase("http://tape-it-hamburg.firebaseio.com/dev/hitCounts/" + currentGuestId + ""),
guestRef = new Firebase("http://tape-it-hamburg.firebaseio.com/dev/guests"),
currentGuestRef,
hitCountsRef = new Firebase("http://tape-it-hamburg.firebaseio.com/dev/hitCounts"),
hitCountsOrangeRef = new Firebase("http://tape-it-hamburg.firebaseio.com/dev/hitCounts/orange"),
hitCountsBlueRef = new Firebase("http://tape-it-hamburg.firebaseio.com/dev/hitCounts/blue"),

guestList = [];


// "92F28C2E"


function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

function readGoogleDoc(key, url) {

    $.get(url).success(function(response) {

        var html = $.parseHTML(response);
        var output = "";


        $(html).each(function(key, value){
            console.log(value);
            var tagName = $(value).prop("tagName");



            if (tagName === "H1") {

                output += "<h3>" + $(value).html() + "</h3>";
            }
            if (tagName === "P") {

                output += "<p>" + $(value).html() + "</p>";
            }
        });

        console.log(key, output);


        $('.film-' + key + '__body').html(output);
    });
}


function initialize() {

    $.urlParam = function(name){
        var results = new RegExp('[\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
        return results[1] || 0;
    }


    $(document).ready(function(){

        $("#btn-registration-coming").on("click", function(event) {
            registration("coming");
        });
        $("#btn-registration-not-coming").on("click", function(event) {
            registration("not-coming");
        });

        var projectTextUrls = {

            "dominik": "http://docs.google.com/document/d/1YM7cOKJk68b3xUHAtb9g9YLuXZWBxb8FqX-rUjtsTZ0/export?format=html",
            "nora": "https://docs.google.com/document/d/1Czdb3wT9AIdHShfzdXf_pJEFPhplV4Geh6iM7NVxh0E/export?format=html",
            "diana": "https://docs.google.com/document/d/1KCVVbW_7rxjNEqqXoatnTik6MTK66GLJVhW_GY_ZIFI/export?format=html",
            "elisabeth": "https://docs.google.com/document/d/1qdjm2RgEx_r4gL9KMZab_ZJlPqqlLz1nPoikC9pcSQo/export?format=html",
            "vivian": "https://docs.google.com/document/d/1dIZtvqKe1TB0UBcy0EjxFcnsUkxhV3DYqykh9-zcoII/export?format=html",
            "yannic": "https://docs.google.com/document/d/1CZ4gl23EB4frTL5li40QEfcFdDUFXVnrWo_r7krucgM/export?format=html",
            "phillip": "https://docs.google.com/document/d/1C-zmlshnhUJSEhOcU2KTz97336_PVPF-dY6P4whxUOc/export?format=html",

        };

        for (var key in projectTextUrls) {

            readGoogleDoc(key, projectTextUrls[key]);

        }





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

                    currentGuestTeam = guest.team;

                    $(".currentGuestId").html(currentGuestId);
                    $(".currentGuestTeam").html(guest.team);
                    $("body").addClass("logged-in");
                    $(".loggedStatusMessage").html("angemeldet (id: " + currentGuestId + ", team: " + guest.team + ")");

                } else {

                    $(".loggedStatusMessage").html("Gast nicht bekannt.");

                }

                watchCurrentGuestHitCount();
                watchCurrentGuestHits();
                watchCurrentGuestRegristration();




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


        var hits = snapshot.val(),
        count = 0;

        for (var key in hits) {

            if (hits[key]) {

                count++;

            }
        }


        currentGuestHitCount = count;

        hitCountsRef.child(currentGuestTeam).child(currentGuestId).set(count);

    });

}


function watchCurrentGuestRegristration() {

    currentGuestRef.child("registration").on("value", function(snapshot) {

        console.log(snapshot.val());
        if (snapshot.val() === "coming") {

            $("#btn-registration-coming").addClass("btn--active");
            $("#btn-registration-not-coming").removeClass("btn--active");

        }
        if (snapshot.val() === "not-coming") {

            $("#btn-registration-coming").removeClass("btn--active");
            $("#btn-registration-not-coming").addClass("btn--active");

        }


    });

}


function watchCurrentGuestHitCount() {

    hitCountsRef.child(currentGuestTeam).child(currentGuestId).on("value", function(snapshot) {

        var hitCount = snapshot.val();

        $(".currentGuestHitCount").html(hitCount);

    }, function (errorObject) {

        console.log("The read failed: " + errorObject.code);

    });

}

function watchCurrentGuestHits() {

    currentGuestRef.on("value", function(snapshot) {

        var guest = snapshot.val(),
        hits = guest.hits;

        for (var key in hits) {

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
        key,
        scoreOrange = 0;

        console.log(hitCounts);

        for (key in hitCounts.orange) {

            scoreOrange += hitCounts.orange[key];

        }

        $(".scoreOrange").html(pad(scoreOrange, 3));

        scoreBlue = 0;

        for (key in hitCounts.blue) {

            scoreBlue += hitCounts.blue[key];
        }

        $(".scoreBlue").html(pad(scoreBlue, 3));



    });

}



function registration(value) {

    currentGuestRef.child("registration").set(value);

}

function toggleHit(hitId) {

    console.log("toggleHit (hitId: " + hitId + ", guestId: " + currentGuestId + ")");

    currentGuestRef.child("hits").child(hitId).once("value", function(snapshot) {

        var hit = snapshot.val();

        if (hit === 1) {

            currentGuestRef.child("hits").child(hitId).set(0);

        } else {

            currentGuestRef.child("hits").child(hitId).set(1);

        }

        updateHitCount();

        console.log("new hit count for guest: " + currentGuestHitCount);

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

                guestRef.child(id).set({
                    "team": team,
                    "hits": defaultHitsArray}, function(){

                        console.log("guest " + id + " added.");
                    }
                );

                hitCountsRef.child(team).child(id).set(0);


            } else {

                console.log("guest " + id + " already in database.");

            }

        });

    }


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

// updateGuests();
initialize();
