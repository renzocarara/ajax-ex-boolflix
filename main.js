// Nome repo: ajax-ex-boolflix
// -----------------------------------------------------------------------------

// ---------------------------- CONSTANTs --------------------------------------
// variabili globali che non cambiano valore durante l'esecuzione dello script (costanti)
// array con le lingue per cui è disponibile una bandierina da visualizare
availableFlags = ['bg', 'cn', 'cs', 'de', 'dk', 'en', 'es', 'et', 'fi', 'fr', 'gr', 'hr', 'hu', 'in', 'is',
    'it', 'ja', 'lv', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sl', 'sv', 'tr', 'ua'
];

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

    // intercetto e gestisco eventi mouseenter e mouseleave su una card
    // uso la $(document).on poichè si tratta di elementi creati dinamicamente
    // uso notazione in cascata, concatenando i due eventi
    $(document).on("mouseenter", ".card", function() {

        if ($(this).find('.poster').length > 0) { // verifico se c'è il poster
            // nascondo l'immagine poster, rendendo così visibile il testo sottostante
            $(this).find('.poster').hide();
        }
        // abilito la scrollbar verticale per scrollare il testo, appare solo se necessaria
        $(this).addClass('enableScrollbarY');

    }).on("mouseleave", ".card", function() {

        // riporto lo scroll all'inizio, in caso l'utente avesse scrollato la card
        $(this).scrollTop(0);
        // disabilito la scrollbar verticale
        $(this).removeClass('enableScrollbarY');

        if ($(this).find('.poster').length > 0) { // verifico se c'è il poster
            // faccio riapparire l'immagine poster che mi va a coprire il testo
            $(this).find('.poster').show();
        }

    }); // end eventi mouseenter e mouseleave


}); // fine document ready

// ---------------------------- FUNCTIONs --------------------------------------
function handleUserSearch(searchString) {
    // DESCRIZIONE:
    // verifica se c'è una stringa da ricercare e nel caso fa una chiamata AJAX
    // dopodichè resetta il campo di ricerca e svuota il contenitore delle cards

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
    // DESCRIZIONE:
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
    // DESCRIZIONE:
    // estrae i dati che mi interessano dalla risposta ricevuta dall'API
    // crea un oggetto per HANDLEBARS per valorizzare il template
    // chiama diverse altre funzioni che preparano i singoli valori delle proprietà dell'oggetto

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
                'overview': createOverview(results[i].overview),
                'poster': createImgLink(results[i].poster_path)
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
    // DESCRIZIONE:
    // crea il path completo per recuperare l'immagine (poster) del film/serie tv
    // gestisce il caso in cui il poster non è disponibile

    // var defaultPoster = 'images/no_preview_poster.png';
    var imgUrlFixed = 'https://image.tmdb.org/t/p/'; // indirizzo base per lel immagini
    var imgUrlSize = 'w342/'; // dimensione dell'immagine
    var imgUrlVariable = posterLink; // indirizzo specifico dell'immagine richiesta tramite API
    var path = "";

    if (imgUrlVariable != null) {
        // nel caso in cui l'API mi risponde con un path "null", non c'è il poster ritorno una stringa vuota
        // compongo il path con le parte fissa + la dimensione + il path parziale recuperato con l'API
        path = imgUrlFixed + imgUrlSize + imgUrlVariable;
        path = '<li><img class="poster overlap" src="' + path + '"></li>';
    }

    return path;
}

function createFlag(lang) {
    // DESCRIZIONE:
    // crea il codice HTML da inserire nel template di HANDLEBARS
    // scorre un array con l'elenco delle bandierine disponibili
    // restituisce il codice HTML per visualizzare la bandierina o del semplice testo
    // se un'immagine della bandierina non è disponibile

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
    // DESCRIZIONE:
    // crea il codice HTML da inserire nel template di HANDLEBARS
    // restituisce il codice HTML per visualizzare le stelle (5)

    var starsCounter = Math.round(vote / 2); // numero di stelle piene da visualizzare (da 0 a 5)
    var fullStar = '<i class="fas fa-star"></i>'; // stella piena
    var emptyStar = '<i class="far fa-star grayed"></i>'; // stella vuota
    var stars = ""; // codice HTML ritornato dalla funzione

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

function createOverview(text) {
    // DESCRIZIONE:
    // estrae il dato "overview" dall'oggetto ottenuto in risposta dall'API e lo ritorna
    // se l'overview è vuota ritorna la dicitura "non disponibile"

    var textToBeDisplayed; // overview da inserire in pagina

    if (text == "") {
        // non c'è una Overview
        textToBeDisplayed = "non disponibile";
    } else {
        textToBeDisplayed = text;
    }
    return textToBeDisplayed;
}