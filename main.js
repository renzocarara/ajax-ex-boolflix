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
} // fine funzione handleUserSearch()


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
} // fine funzione callAJAX()


function handleResponse(data, endpoint) {
    // estraggo i dati che mi interessano dalla risposta ricevuta dall'API
    // creo un oggetto per HANDLEBARS per valorizzare il template


    if (data.total_results > 0) { // ci sono dei risultati da elaborare

        var APIendpointMovie = '/search/movie'; // endpoint dell'API
        var APIendpointTV = '/search/tv'; // endpoint dell'API
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
                title = results[i].title;
                original_title = results[i].original_title;
            } else {
                // ramo TV SERIES
                title = results[i].name;
                original_title = results[i].original_name;
            }

            // creo un oggetto per HANDLEBARS con i dati da inserire in pagina
            var context = {
                'title': title,
                'original-title': original_title,
                'flag-image': createFlag(results[i].original_language),
                'stars': createStars(results[i].vote_average),
                'img-link': createImgLink(results[i].poster_path),
                'overview': results[i].overview
            };

            // chiamo la funzione generata da HANDLEBARS per popolare il template
            var card = cardFunction(context);

            // aggiungo nella mia pagina il codice HTML generato da HANDLEBARS
            $('.cards-container').append(card);

        } // end for

        // da rivedere il caso in cui la 1a AJAX call non da risultati e la seconda invece si
        // } else {
        //
        //     if ($('.cards-container').html() == "") {
        //         $('.cards-container').append("Non ci sono risultati");
        //     }
    }

} // fine funzione handleResponse()


function createImgLink(posterLink) {
    // crea il path completo per recuperare l'immagine (poster) del film/serie tv
    // gestisce il caso in cui il poster non è disponibile

    var imgUrlStart = 'https://image.tmdb.org/t/p/'; // indirizzo base per lel immagini
    var imgUrlSize = 'w92/'; // dimensione dell'immagine
    var imgUrlEnd = posterLink; // indirizzo specifico dell'immagine corrente
    var wholePath = "";

    if (imgUrlEnd == null) {
        // caso limite in cui l'API mi risponde con un path "null", non c'è il poster
        // in questo caso utilizzo un immagine di default
        wholePath = "images/default_poster.png";
    } else {
        // compongo il path con le parti fisse + il path parziale recuperato con l'API
        wholePath = imgUrlStart + imgUrlSize + imgUrlEnd;
    }

    return wholePath;
}

function createFlag(lang) {
    // crea il codice HTML da inserire nel template di HANDLEBARS
    // scorre un array con l'elenco delle bandierine disponibili
    // restituisce il codice per visualizzare la bandierina o del semplice testo
    // se un'immagine della bandierina non è disponibile

    // array con le lingue per cui è disponibile una bandierina da visualizare
    availableFlags = ['bg', 'cn', 'cz', 'de', 'dk', 'en', 'es', 'et', 'fi', 'fr', 'gr', 'hr', 'hu', 'in', 'is', 'it', 'ja', 'lv', 'nl', 'no', 'pl', 'pt', 'ro', 'rs', 'ru', 'si', 'sv', 'tr', 'ua'];
    var flagOrText; // valore di ritorno della funzione

    if (availableFlags.includes(lang)) {
        // la bandierina per quel linguaggio è disponibile, costruisco un elemento <img>
        flagOrText = '<img class="flag" src="images/' + lang + '.svg" ' + 'alt="ISO 639-1: ' + lang + '">';
    } else {
        // la bandierina per quel linguaggio non è disponibile, restituisco solo testo (il codice lingua)
        flagOrText = lang;
    }

    return flagOrText;
} // fine funzione createFlag()

function createStars(vote) {
    // crea il codice HTML da inserire nel template di HANDLEBARS
    // restituisce il codice HTML per visualizzare le stelle

    var starsCounter = Math.round(vote / 2); // numero di stelle piene da visualizzare
    var fullStar = '<i class="fas fa-star"></i>'; // stella piena
    var emptyStar = '<i class="far fa-star grayed"></i>'; // stella vuota
    var stars = ""; // valore ritornato dalla funzione

    // ciclo sempre 5 volte e inserisco le stelle piene o vuote in base a starsCounter
    for (var i = 0; i < 5; i++) {
        if (starsCounter > 0) {
            stars += fullStar; // aggiungo una stella piena
            starsCounter--; // decremento il contatore delle stelle
        } else {
            stars += emptyStar; // aggiungo una stella vuota
        }
    } // end for

    return stars;
} // fine funzione createStars()