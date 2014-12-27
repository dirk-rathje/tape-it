
var currentGuestId,
userIsInvited = false,
currentGuestTeam = "",
currentGuestHitCount = 0,
currentGuestHitCountRef = new Firebase("http://tape-it-hamburg.firebaseio.com/dev/hitCounts/" + currentGuestId + ""),
guestRef =  new Firebase("http://tape-it-hamburg.firebaseio.com/dev/guests"),
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


function createGuestUser() {

    var defaultHitsArray = [];

    for (var i = 0; i < 50; i++) {
        defaultHitsArray.push(0);
    }



    currentGuestId = generateUUID();
    // console.log(currentGuestId);
    currentGuestRef = new Firebase("http://tape-it-hamburg.firebaseio.com/dev/guests/" + currentGuestId);
    currentGuestRef.child("hits").set(defaultHitsArray);
    userIsInvited = false;
    currentGuestTeam = "teamless";
    watchCurrentGuestHitCount();
    watchCurrentGuestHits();
    $(".currentGuestHitCount").html("0");

    $(".teamAssociation--teamless").show();

    // window.setInterval("showLoginModal()", 3000);
    // showLoginModal();
}


function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

function showLoginModal() {

    $("#no-invitation-code").modal("show");
}



function initialize() {

    $.urlParam = function(name) {
        var results = new RegExp('[\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
        if (results != null) {
            return results[1];
        }
        return 0;
    }


    $(document).ready(function(){

        $("#btn-registration-coming").on("click", function(event) {
            registration("coming");
        });
        $("#btn-registration-not-coming").on("click", function(event) {
            registration("not-coming");
        });
        $("#btn-registration-coming-plus-one").on("click", function(event) {
            // console.log("XXX");
            registration("coming-plus-one");
        });


        $(".ball").each(function(key, value){

            $(this).attr("id", "ball-" + key);
            $(this).on("click", function(event) {
                toggleHit(key);
            });

        });

        var id = $.urlParam('id');

        var directors = {

            "dominik": "http://docs.google.com/document/d/1YM7cOKJk68b3xUHAtb9g9YLuXZWBxb8FqX-rUjtsTZ0/export?format=html",
            "nora": "https://docs.google.com/document/d/1Czdb3wT9AIdHShfzdXf_pJEFPhplV4Geh6iM7NVxh0E/export?format=html",
            "diana": "https://docs.google.com/document/d/1KCVVbW_7rxjNEqqXoatnTik6MTK66GLJVhW_GY_ZIFI/export?format=html",
            "elisabeth": "https://docs.google.com/document/d/1qdjm2RgEx_r4gL9KMZab_ZJlPqqlLz1nPoikC9pcSQo/export?format=html",
            "vivian": "https://docs.google.com/document/d/1dIZtvqKe1TB0UBcy0EjxFcnsUkxhV3DYqykh9-zcoII/export?format=html",
            "yannic": "https://docs.google.com/document/d/1CZ4gl23EB4frTL5li40QEfcFdDUFXVnrWo_r7krucgM/export?format=html",
            "phillip": "https://docs.google.com/document/d/1C-zmlshnhUJSEhOcU2KTz97336_PVPF-dY6P4whxUOc/export?format=html",

        };


        function loadContent(director) {

            $.get("filme/" + director + ".html").success(function(response) {

                //console.log(".film-" + director + "__body");

                $(".film-" + director + "__body").html(response);

            });

        }

        for (var key in directors) {

            loadContent(key);


        };




        if (id) {

            currentGuestId = id;
            currentGuestRef = new Firebase("http://tape-it-hamburg.firebaseio.com/dev/guests/" + currentGuestId);
            currentGuestRef.once("value", function(snapshot) {

                var guest = snapshot.val();

                if (guest !== null) {

                    currentGuestTeam = guest.team;
                    //console.log(".teamAssociation--" + currentGuestTeam);
                    $(".teamAssociation--" + currentGuestTeam).show();

                    userIsInvited = true;
                    $(".currentGuestId").html(currentGuestId);
                    $(".currentGuestTeam").html(guest.team);
                    $("body").addClass("logged-in");
                    $(".loggedStatusMessage").html("angemeldet (id: " + currentGuestId + ", team: " + guest.team + ")");

                    watchCurrentGuestRegristration();
                    watchCurrentGuestHitCount();
                    watchCurrentGuestHits();



                } else {

                    $(".loggedStatusMessage").html("Gast nicht bekannt.");

                    createGuestUser();
                }

            }, function (errorObject) {

                $(".loggedStatusMessage").html("Fehler: " + errorObject.code);

                //console.log("The read failed: " + errorObject.code);

                $(".loggedStatusMessage").html("Gast nicht bekannt.");

                createGuestUser();

            });

        } else {

            createGuestUser();

        }

        watchScore();


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

        if (userIsInvited) {
            hitCountsRef.child(currentGuestTeam).child(currentGuestId).set(count);
        } else {
            $(".currentGuestHitCount").html(currentGuestHitCount);
        }

    });

}


function watchCurrentGuestRegristration() {

    //console.log("watchCurrentGuestRegristration");

    if (userIsInvited) {

        currentGuestRef.child("registration").on("value", function(snapshot) {

            if (snapshot.val() === "coming") {

                $(".btn-registration ").removeClass("btn--active");
                $("#btn-registration-coming").addClass("btn--active");

            }
            if (snapshot.val() === "coming-plus-one") {

                $(".btn-registration ").removeClass("btn--active");
                $("#btn-registration-coming-plus-one").addClass("btn--active");

            }
            if (snapshot.val() === "not-coming") {

                $(".btn-registration").removeClass("btn--active");
                $("#btn-registration-not-coming").addClass("btn--active");

            }
        });


    } else {

        $("#btn-registration-coming").disable();
        $("#btn-registration-coming-plus-one").disable();
        $("#btn-registration-not-coming").disable();

    }

}


function watchCurrentGuestHitCount() {

    //console.log("watchCurrentGuestHitCount");

    if (userIsInvited) {

        hitCountsRef.child(currentGuestTeam).child(currentGuestId).on("value", function(snapshot) {

            var hitCount = snapshot.val();

            $(".currentGuestHitCount").html(hitCount);

        }, function (errorObject) {

            //console.log("The read failed: " + errorObject.code);

        });
    }
}

function watchCurrentGuestHits() {

    //console.log("watchCurrentGuestHits");

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

        //console.log("The read failed: " + errorObject.code);

    });

}


function watchScore() {

    var scoreOrange, scoreBlue;

    //console.log("watchScore");

    hitCountsRef.on("value", function(snapshot) {

        var hitCounts = snapshot.val(),
        key,
        scoreOrange = 0;

        //console.log(hitCounts);

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

    //console.log("registration: " + value);

    currentGuestRef.child("registration").set(value);

}

function toggleHit(hitId) {

    //console.log("toggleHit (hitId: " + hitId + ", guestId: " + currentGuestId + ")");

    currentGuestRef.child("hits").child(hitId).once("value", function(snapshot) {

        var hit = snapshot.val();

        if (hit === 1) {

            currentGuestRef.child("hits").child(hitId).set(0);
        } else {

            currentGuestRef.child("hits").child(hitId).set(1);
        }

        updateHitCount();

        //console.log("new hit count for guest: " + currentGuestHitCount);

    }, function (errorObject) {

        //console.log("The read failed: " + errorObject.code);

    });
}


initialize();


var guests = [];


function getReport() {


    Papa.parse(

        "/gaeste.csv", {
            download: true,
            header: true,

            error: function(error) {
                console.log(error);
            },

            complete: function(result) {

                console.log("google sheet read.");

                guestRef.once("value", function(snapshot) {

                    console.log("guestRef read: " + guestRef);

                    var fbGuests = snapshot.val();

                    for (var rowItr in result.data) {

                        var guest = result.data[rowItr];

                        guest.registration = fbGuests[guest.ident].registration;
                        guest.hits = fbGuests[guest.ident].hits;

                        guest.hitCount = 0;

                        $.each(guest.hits,function() {
                            guest.hitCount += this;
                        });

                        guests.push(guest);

                    }

                    for (var k in guests) {

                        var guest = guests[k],
                        guestHTML = "<li>" + guest.Name + " " + guest.Nachname + " (Bälle: " + guest.hitCount + ")</li>";


                        if (guest.registration === "coming") {

                            $("ol.report-coming").append(guestHTML);

                        } else if (guest.registration === "coming-plus-one") {

                            $("ol.report-coming-plus-one").append(guestHTML);

                        } else if (guest.registration === "not-coming") {

                            $("ol.report-not-coming").append(guestHTML);

                        } else {

                            $("ol.report-no-registration").append(guestHTML);
                        }

                    }

                });



            }
        }
    );
}
