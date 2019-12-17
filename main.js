// Nome repo: ajax-ex-boolflix
// -----------------------------------------------------------------------------

// ---------------------------- CONSTANTs --------------------------------------
// variabili globali che non cambiano valore durante l'esecuzione dello script (costanti)



$(document).ready(function() {

    //intercetto click su bottone per la ricerca
    $('#search-button').click(function() {
        var searchInput = $('#search-input').val(); // recupero la stringa da ricercare
        if (searchInput) { // verifico se la stringa non è nulla
            handleUserSearch(searchInput); // chiamo una funzione passandogli la stringa da ricercare
        }
    }); // end evento click su bottone send

    // intercetto pressione ENTER, anzichè click sul bottone, per iniziare ricerca
    $('#search-input').keypress(function(event) {
        if (event.which == 13) { // è stato premuto tasto ENTER (codice 13)
            var searchInput = $('#search-input').val(); // recupero la stringa da ricercare
            handleUserSearch(searchInput); // chiamo una funzione passandogli la stringa da ricercare
        }
    }); // end evento keypress tasto ENTER

}); // fine document ready

// ---------------------------- FUNCTIONs --------------------------------------
function handleUserSearch(searchString) {
    // verifica se c'è una stringa da ricercare e nel caso faccio una chiamata AJAX

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
        // svuoto il contenitore delle cards sulla pagina HTML
        $('.cards-container').empty();
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
            handleResponse(response, endpoint);
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

    if (data.total_results > 0) { // ci sono dei risultati da elaborare

        var APIendpointMovie = '/search/movie'; // identifica un tipo di chiamata API
        var title; // titolo del film o della serie TV
        var original_title; // titolo originale del film o della serie TV
        var results = data.results; // estraggo la parte di risultati che mi interessa

        // recupero il codice html dal template HANDLEBARS
        var cardTemplate = $('#card-template').html();
        // compilo il template HANDLEBARS, lui mi restituisce un funzione
        var cardFunction = Handlebars.compile(cardTemplate);

        // ciclo su tutto l'array composto dai dati ricevuti dal server
        for (var i = 0; i < results.length; i++) {

            // distinguo a seconda se è un movie o una TV series
            if (endpoint == APIendpointMovie) {
                // ramo MOVIES
                console.log("MOVIE");
                title = results[i].title;
                original_title = results[i].original_title;
            } else {
                // ramo TV SERIES
                console.log("TV");
                title = results[i].name;
                original_title = results[i].original_name;
            }

            // creo un oggetto con i dati da inserire in pagina
            var context = {
                'title': title,
                'original-title': original_title,
                // 'original-language': results[i].original_language,
                'flag-image': createFlag(results[i].original_language),
                'vote-average': results[i].vote_average,
                'stars': createStars(results[i].vote_average)
            };

            // chiamo la funzione generata da HANDLEBARS per popolare il template
            var card = cardFunction(context);

            // aggiungo nella mia pagina il codice HTML generato da HANDLEBARS
            $('.cards-container').append(card);

        } // end for

    } // end if su data.total_results>0

} // end handleResponse function

function createFlag(lang) {
    // crea il codice HTML da inserire nel template di HANDLEBARS
    // scorre un array con l'elenco delle bandierine disponibili
    // restituisec il codice per visualizzare la bandierina o del semplice testo
    // se un'immagine della bandierina non è disponibile

    availableFlags = ['bg', 'cn', 'cz', 'de', 'dk', 'en', 'es', 'et', 'fi', 'fr', 'gr', 'hr', 'hu', 'in', 'is', 'it', 'jp', 'lv', 'nl', 'no', 'pl', 'pt', 'ro', 'rs', 'ru', 'si', 'sv', 'tr', 'ua'];
    var flagOrText; // pararametro di ritorno della funzione

    if (availableFlags.includes(lang)) {
        // la bandierina per quel linguaggio è disponibile, costruisco un tag <img>
        flagOrText = '<img class="flag" src="images/' + lang + '.svg" ' + 'alt="ISO 639-1: ' + lang + '">';
    } else {
        // la bandierina per quel linguaggio non è disponibile, restituisco solo testo
        flagOrText = lang;
    }

    return flagOrText;
} // end createFlag function

function createStars(vote) {
    // creo un oggetto per HANDLEBARS, ha 5 proprietà che rappresentano le 5 stelle da visualizzare
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