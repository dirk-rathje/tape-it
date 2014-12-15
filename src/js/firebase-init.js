

function readFromGoogle() {

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


        $.get("filme/" + key + ".html").success(function(response) {

            $(".film-" + key + "__body").html(response);

        }

    };

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


        });
    }

}

readFromGoogle();


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
