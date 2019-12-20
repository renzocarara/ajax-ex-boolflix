// Nome repo: ajax-ex-boolflix
// -----------------------------------------------------------------------------

// ------------------------------- CONSTANTs -----------------------------------
var APIurl = 'https://api.themoviedb.org/3'; // indirizzo base API TMDB
var APIsearchMovie = '/search/movie'; // endpoint dell'API
var APIsearchTV = '/search/tv'; // endpoint dell'API
var APImovie = '/movie/movie_id'; // endpoint dell'API
var APItv = '/tv_id'; // endpoint dell'API
var APIcreditsMovie = '/movie/id/credits'; // endpoint dell'API, 'id' deve essere sostituito con id corrente
var APIcreditsTV = '/tv/id/credits'; // endpoint dell'API, 'id' deve essere sostituito con id corrente
var APIkey = '541a69e2ef5cfc0e4d5d4e563ef1de78'; // la mia chiave per le API TDMB
var APIlang = 'it-IT'; // parametro lingua, quando costruisco la richiesta all'API

var imgUrlFixed = 'https://image.tmdb.org/t/p/'; // indirizzo base per le immagini
var imgUrlSize = 'w342/'; // dimensione dell'immagine
var imgNotAvailable = "images/no_poster.png"; // immagine di default

// array con le lingue per cui è disponibile una bandierina da visualizare
var availableFlags = ['bg', 'zh', 'cs', 'de', 'dk', 'en', 'es', 'et', 'fi', 'fr', 'gr', 'hr', 'hu', 'in', 'is',
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

        // nascondo l'immagine poster, rendendo così visibile il testo sottostante
        $(this).find('.poster').hide();
        // abilito la scrollbar verticale per scrollare il testo, appare solo se necessaria
        $(this).addClass('enableScrollbarY');

    }).on("mouseleave", ".card", function() {

        // riporto lo scroll all'inizio, in caso l'utente avesse scrollato la card
        $(this).scrollTop(0);
        // disabilito la scrollbar verticale
        $(this).removeClass('enableScrollbarY');
        // faccio riapparire l'immagine poster che mi va a coprire il testo
        $(this).find('.poster').show();

    }); // end eventi mouseenter e mouseleave


}); // fine document ready

// ---------------------------- FUNCTIONs --------------------------------------
function handleUserSearch(searchString) {
    // DESCRIZIONE:
    // verifica se c'è una stringa da ricercare e nel caso fa una chiamata AJAX
    // dopodichè resetta il campo di ricerca e svuota il contenitore delle cards

    // verifico che la stringa non sia nulla, se la stringa è nulla non faccio niente
    if (searchString) {
        // chiamata AJAX per recuperare i dati ricercati tramite API -- CERCO I MOVIES
        getMainData(APIsearchMovie, searchString);
        // chiamata AJAX per recuperare i dati ricercati tramite API -- CERCO TV SERIES
        getMainData(APIsearchTV, searchString);
        //resetto il campo di input inserendo una stringa vuota
        $('#search-input').val("");
        // svuoto il contenitore delle cards sulla pagina HTML
        $('.cards-container').empty();
        // visualizzo gli header per le sezioni Film e Serie TV
        $('h2').addClass('visible');
    }
} // fine funzione handleUserSearch()


function getMainData(endpoint, query) {
    // DESCRIZIONE:
    // chiamata ad AJAX usando i parametri in ingresso alla funzione
    // per recuperare tutti i dati base del film o serie TV

    $.ajax({
        url: APIurl + endpoint,
        data: {
            'api_key': APIkey,
            'query': query,
            'language': APIlang
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
    // esegue un ciclo 'for' su tutti i film o serie TV precedentemente trovate
    // per ognuno chiama una funzione per recuperare i dati del cast
    // se non ci sono film o serie Tv da scorrere scrive un messaggio in pagina

    if (data.total_results > 0) { // ci sono dei risultati da elaborare

        var mainInfo = data.results; // estraggo la parte di risultati che mi interessa

        // ciclo su tutto l'array composto dai dati ricevuti dal server
        // ovvero i film o serie TV trovati
        for (var i = 0; i < mainInfo.length; i++) {
            // chiamo funzione per recuperare i dati del cast
            getCast(mainInfo[i]);
        } // end for

    } else {

        if (endpoint == APIsearchMovie) {
            // non è stato trovato nessun Film
            $('#movies-container').append("Non sono stati trovati Film");

        } else {
            // non è stata trovata nessuna Serie TV
            $('#series-container').append("Non sono state trovate Serie TV");
        }
    }

} // fine funzione handleResponse()

function getCast(mainInfo) {
    // DESCRIZIONE:
    // effettua chiamata AJAX per recuperare i dati relativi al cast
    // in caso di successo chiama una funzione che crea la card con tutte le info

    var creditsPath = ""; // path parziale per la chiamata API
    var currentId = mainInfo.id; // id del film o serie TV corrente

    console.log("currentId", currentId);
    console.log("mainInfo", mainInfo);

    // costruisco il path per la chiamata API a seconda che sia Movie o TV Series
    if (mainInfo.hasOwnProperty('title')) {
        console.log("è un movie");
        creditsPath = APIcreditsMovie.replace("id", currentId); // ramo MOVIES
    } else {
        console.log("è una serie");
        creditsPath = APIcreditsTV.replace("id", currentId); // ramo TV SERIES
    }

    console.log("credits", creditsPath);

    // chiamata ajax per recuperare il cast
    $.ajax({
        url: APIurl + creditsPath,
        data: {
            'api_key': APIkey,
            'language': APIlang
        },
        method: 'get',
        success: function(castInfo) {

            createCard(castInfo, mainInfo);
        },
        error: function() {
            alert("ERROR! there's a problem...");
        }
    }); // end AJAX call

} // fine getCast()

function createCard(castData, mainData) {
    // DESCRIZIONE:
    // questa funzione ha tutti i dati necessari per preparare l'oggetto da passare ad HANDLEBARS
    // incluso le info sul cast che riceve in ingresso come parametro
    // chiama diverse altre funzioni che preparano i singoli valori delle proprietà dell'oggetto

    var title; // titolo del film o della serie TV
    var original_title; // titolo originale del film o della serie TV
    var MovieOrTV; // tipologia, distingue se FILM o SERIE TV

    // distinguo a seconda se è un film o una serie TV
    // solo i film hanno la proprietà 'title', le serie TV hanno invece la proprietà 'name'
    if (mainData.hasOwnProperty('title')) {
        // ramo MOVIES
        title = mainData.title;
        original_title = mainData.original_title;
        MovieOrTV = "Film";
    } else {
        // ramo TV SERIES
        title = mainData.name;
        original_title = mainData.original_name;
        MovieOrTV = "Serie TV";
    }

    // creo un oggetto per HANDLEBARS con i dati da inserire in pagina
    var context = {
        'title': title,
        'original-title': original_title,
        'flag-image': createFlag(mainData.original_language),
        'stars': createStars(mainData.vote_average),
        'overview': createOverview(mainData.overview),
        'img-link': createImgLink(mainData.poster_path),
        'type': MovieOrTV,
        'cast': createCast(castData)
    };

    // recupero il codice html dal template HANDLEBARS
    var cardTemplate = $('#card-template').html();
    // compilo il template HANDLEBARS, lui mi restituisce un funzione
    var cardFunction = Handlebars.compile(cardTemplate);
    // chiamo la funzione generata da HANDLEBARS per popolare il template
    var card = cardFunction(context);

    // aggiungo nella mia pagina le cards, ovvero il codice HTML generato da HANDLEBARS
    if (MovieOrTV == "Film") {
        // aggiungo la card nella sezione Film
        $('#movies-container').append(card);
    } else {
        // aggiungo la card nella sezione Serie TV
        $('#series-container').append(card);
    }
} // fine funzione createCard()

function createCast(castList) {
    // DESCRIZIONE:
    // estrae i dati del cast dall'oggetto in ingresso e li restituisce
    // sotto forma di stringa
    var castNames = [];
    var names;

    if (castList.cast.length == 0) {
        // non ci sono elementi nell'array del cast
        names = "non disponibile";
    } else {

        // estraggo i primi 5 elementi o quelli che ci sono
        castList.cast = castList.cast.slice(0, 5);

        // estraggo solo la proprietà 'name' e la metto in un array
        for (var i = 0; i < castList.cast.length; i++) {
            castNames[i] = castList.cast[i].name;
        }
        // unisco gli elementi dell'array in un'unica stringa separata da virgola+spazio
        names = castNames.join(", ");
    }

    return names;
}

function createImgLink(posterLink) {
    // DESCRIZIONE:
    // crea il path completo per recuperare l'immagine (poster) del film/serie tv
    // gestisce il caso in cui il poster non è disponibile

    var imgUrlVariable = posterLink; // indirizzo specifico dell'immagine richiesta tramite API
    var path = "";

    if (imgUrlVariable != null) {
        // compongo il path con le parti fisse + il path parziale recuperato con l'API
        path = imgUrlFixed + imgUrlSize + imgUrlVariable;
    } else {
        // non c'è il poster, utilizzo un'immagine di default
        path = imgNotAvailable;
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
        flagOrText = "codice ISO-693-1: " + lang;
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