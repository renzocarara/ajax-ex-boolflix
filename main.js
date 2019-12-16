// Nome repo: ajax-ex-boolflix
// -----------------------------------------------------------------------------
$(document).ready(function() {

    //intercetto click su bottone per la ricerca
    $('#search-button').click(function() {
        var searchInput = $('#search-input').val(); // recupero la stringa da ricercare
        if (searchInput) { // verifico se la stringa non è nulla
            handleUserSearch(searchInput); // chiamo una funzione passandogli la stringa da ricercare
        }
    }); // end evento click su bottone send

    // intercetto pressione ENTER, anzichè click su bottone, per iniziare ricerca
    $('#search-input').keypress(function(event) {
        if (event.which == 13) { // è stato premuto tasto ENTER (codice 13)
            var searchInput = $('#search-input').val(); // recupero la stringa da ricercare
            handleUserSearch(searchInput); // chiamo una funzione passandogli la stringa da ricercare
        }
    }); // end evento keypress tasto ENTER

}); // fine document ready

// ---------------------------- FUNCTIONs --------------------------------------
function handleUserSearch(searchString) {
    // verifico se c'è una stringa da ricercare  enel caso faccio una chiamata AJAX

    var APIurl = 'https://api.themoviedb.org/3';
    var APIendpointMovie = '/search/movie';
    var APIendpointTV = '/search/tv';
    var APIkey = '541a69e2ef5cfc0e4d5d4e563ef1de78';
    var lang = 'it-IT';

    // verifico che la stringa non sia nulla, se la stringa è nulla non faccio niente
    if (searchString) {
        // chiamata AJAX per recuperare i dati ricercati tramite API -- CERCO I MOVIES
        callAJAX(APIurl, APIendpointMovie, APIkey, searchString, lang);
        // chiamata AJAX per recuperare i dati ricercati tramite API -- CERCO TV SERIES
        callAJAX(APIurl, APIendpointTV, APIkey, searchString, lang);
        //resetto il campo di input inserendo una stringa vuota
        $('#search-input').val("");
    }
} // end function

function callAJAX(url, endpoint, key, query, lang) {
    // chiamata AJAX usando i parametri in ingresso alla funzione

    $.ajax({
        url: url + endpoint,
        data: {
            'api_key': key,
            'query': query,
            'language': lang
        },
        method: 'get',
        success: function(response) {
            handleResponse(response.results, endpoint);
        },
        error: function() {
            alert("ERROR! there's a problem...");
        }
    }); // end AJAX call
} // end callAJAX function


function handleResponse(data, endpoint) {
    // estraggo i dati che mi interessano dalla risposta ricevuta dall'API
    // creo un oggetto per HANDLEBARS
    // appendo in pagina il codice HTML generato

    var title; // titolo del film o della serie TV
    var original_title; // titolo originale del film o della serie TV

    // recupero il codice html dal template HANDLEBARS
    var cardTemplate = $('#card-template').html();
    // compilo il template HANDLEBARS, lui mi restituisce un funzione
    var cardFunction = Handlebars.compile(cardTemplate);

    // ciclo su tutto l'array composto dai dati ricevuti dal server
    for (var i = 0; i < data.length; i++) {

        // chiamo una funzione che mi trasforma il voto da 1 a 10 in un intero da 1 a 5
        // e poi mi restituisce un ogetto con 5 proprietà che corrispondono alle 5 stelle
        var starsObj = createStars(data[i].vote_average);

        // distinguo a seconda se è un movie o una TV series
        if (endpoint == "/search/movie") {
            // ramo MOVIES
            console.log("MOVIE");
            title = data[i].title;
            original_title = data[i].original_title;
        } else {
            // ramo TV SERIES
            console.log("TV");
            title = data[i].name;
            original_title = data[i].original_name;
        }

        // creo un oggetto con i dati da inserire in pagina
        var context = {
            'title': title,
            'original-title': original_title,
            'original-language': data[i].original_language,
            'nation': data[i].original_language,
            'vote-average': data[i].vote_average,
            'stars': starsObj
        };

        // chiamo la funzione generata da HANDLEBARS per popolare il template
        var card = cardFunction(context);

        // aggiungo nella mia pagina il codice HTML generato da HANDLEBARS
        $('.cards-container').append(card);

    } // end for
} // end handleResponse function

function createStars(vote) {
    // creo un oggetto per HANDLEBARS, ha 5 proprità che rappresentano le 5 stelle da visualizzare
    // la proprietà ha valore 'r' o 's' e serve a completare il nome della classe di fontawesome
    // associata ad una stella piena o vuota

    var starsCounter = Math.round(vote / 2); // numero di stelle piene da visualizzare
    var fullStar = 's'; // identifica la classe stella piena
    var emptyStar = 'r'; // identifica la classe stella vuota

    // inizializzo l'oggetto stars con 5 stelle vuote
    var stars = {
        star1: emptyStar,
        star2: emptyStar,
        star3: emptyStar,
        star4: emptyStar,
        star5: emptyStar
    };

    // ciclo sull'oggetto e inserisco le stelle piene in base a starsCounter
    for (var key in stars) {
        if (starsCounter > 0) {
            stars[key] = fullStar; // aggiungo una stella piena
            starsCounter--; // decremento il contatore delle stelle
        } // end for
    }

    return stars;
} // end createStars function