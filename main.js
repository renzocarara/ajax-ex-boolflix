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

    var APIurl = 'https://api.themoviedb.org/3';
    var APIendpointMovie = '/search/movie';
    // var APIendpointTV = '/search/tv';
    var APIkey = '541a69e2ef5cfc0e4d5d4e563ef1de78';
    var lang = 'it-IT';

    // verifico che la stringa non sia nulla, se la stringa è nulla non faccio niente
    if (searchString) {
        // chiamata AJAX per recuperare i dati ricercati tramite API
        callAJAX(APIurl, APIendpointMovie, APIkey, searchString, lang);
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
            handleResponse(response.results);
        },
        error: function() {
            alert("ERROR! there's a problem...");
        }
    }); // end AJAX call
} // end callAJAX function


function handleResponse(data) {

    // estraggo i dati che mi interessano dalla risposta ricevuta dall'API

    console.log("response.results", data);

    // recupero il codice html dal template HANDLEBARS
    var cardTemplate = $('#card-template').html();
    // compilo il template HANDLEBARS, lui mi restituisce un funzione
    var cardFunction = Handlebars.compile(cardTemplate);

    // ciclo su tutto l'array composto dai dati ricevuti dal server
    for (var i = 0; i < data.length; i++) {
        // creo un oggetto con i dati da inserire in pagina
        var context = {
            'title': data[i].title,
            'original_title': data[i].original_title,
            'vote_average': data[i].vote_average,
            'original_language': data[i].original_language,
        };

        // chiamo la funzione generata da HANDLEBARS per popolare il template
        var card = cardFunction(context);

        // aggiungo nella mia pagina il codice HTML generato da HANDLEBARS
        $('.cards-container').append(card);

    } // end for
}