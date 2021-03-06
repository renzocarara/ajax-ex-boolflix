// Nome repo: ajax-ex-boolflix
// -----------------------------------------------------------------------------
// EXTRAS:
// Le api sono molto vaste, quindi le potenzialità sono tantissime; alcune feature aggiuntive potrebbero quindi essere:
// gestire la paginazione: assieme ai risultati abbiamo visto che arriva la proprietà "total_pages" che contiene proprio il numero di pagine totali
// di risultati (i risultati sono restituiti in "pagine", intese come blocchi, di 20 film/serie). Passando il parametro "page" alla chiamata api,
// è quindi possibile recuperare anche le pagine di risultati successive alla prima (che è quella che viene restituita di default)
// aggiungere la possibilità di chiedere i risultati in una lingua diversa, scelta dall'utente quando fa la ricerca,
// ad esempio con una tendina con un'opzione per ogni lingua (consideratene 3/4, le principali, ad es: IT, EN, ES, FR)
// aggiungere al filtro per genere, il filtro in base alle stelline: in questo punto è da capire come gestire il "doppio filtro",
// cioè se l'utente seleziona un genere e ad esempio le 5 stelle => dovrei mostrare i risultati solo di quel genere e solo con 5 stelline!
// se vogliamo ripassare anche il css, si potrebbe ad esempio aggiungere l'effetto "flip" delle card

// -----------------------------------------------------------------------------
var APIurl = 'https://api.themoviedb.org/3'; // indirizzo base API TMDB
var APIsearchMovie = '/search/movie'; // endpoint per ricercare i film
var APIsearchTV = '/search/tv'; // endpoint per ricercare le serie TV
var APIcreditsMovie = '/movie/id/credits'; // endpoint per richiedere il Cast di un film, la stringa 'id' deve essere sostituita con l'id del film
var APIcreditsTV = '/tv/id/credits'; // endpoint per richiedere Cast di una serieTV , la stringa 'id' deve essere sostituita con l'id della serieTV
var APIgenresMovie = '/genre/movie/list'; // endpoint per recuperare lista generi per i film
var APIgenresTV = '/genre/tv/list'; // endpoint per recuperare lista generi per le serie TV
var APItrendingMovie = '/trending/movie/week'; // endpoint per recuperare i film più popolari
var APItrendingTV = '/trending/tv/week'; // endpoint per recuperare le serieTV più popolari
var APIpageDefault = 1; // indica il numero di pagina da richiedere all'API
var APIkey = '541a69e2ef5cfc0e4d5d4e563ef1de78'; // la mia chiave per le API TDMB
var APIlangIt = 'it-IT'; // parametro lingua, quando costruisco la richiesta all'API
var APIlangEn = 'en-US'; // parametro lingua, quando costruisco la richiesta all'API
var APIlangEs = 'es-ES'; // parametro lingua, quando costruisco la richiesta all'API
var APIlangFr = 'fr-FR'; // parametro lingua, quando costruisco la richiesta all'API

var imgUrlFixed = 'https://image.tmdb.org/t/p/'; // indirizzo base per le immagini
var imgUrlSize = 'w342/'; // dimensione dell'immagine
var imgNotAvailable = "images/no_poster.png"; // immagine di default

var notAvailable = "non disponibile"; // stringa da visualizzare quando non ci sono dati
var maxCastLength = 5; // numero max di componeneti del cast da visualizzare in pagina
var maxStars = 5; // numero massimo di stelle per rappresentare il voto
var minSearchLen = 3; // numero minimo di caratteri per una ricerca
var movie = "movie"; // discriminante per capire su quale sezione sto lavorando
var series = "series"; // discriminante per capire su quale sezione sto lavorando

// elenco lingue per cui è disponibile una bandierina da visualizare
var availableFlags = ['bg', 'zh', 'cs', 'de', 'da', 'en', 'es', 'et', 'fi', 'fr', 'gr', 'hr', 'hu', 'in', 'is',
    'it', 'ja', 'lv', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sl', 'sv', 'tr', 'ua'
];

// lista generi per i film
var movieGenresList = {
    'genres': []
};
// lista generi per le serieTV
var tvGenresList = {
    'genres': []
};
// -----------------------------------------------------------------------------

handleTrendingData(); // recupero i dati dei titoli più popolari

getGenres(APIgenresMovie); // valorizza l'oggetto che contiene la lista dei generi per i film: 'movieGenresList'
getGenres(APIgenresTV); // valorizza l'oggetto che contiene la lista dei generi per le serieTV: 'tvGenresList'

$(document).ready(function() {

    //intercetto click su bottone per la ricerca
    $('#search-button').click(function() {
        var searchInput = $('#search-input').val(); // recupero la stringa da ricercare
        if (searchInput) { // verifico se la stringa non è nulla

            // chiamo una funzione passandogli la stringa da ricercare e la pagina
            handleSearchInput(searchInput, APIpageDefault);
        }
    }); // fine evento click su bottone send

    // intercetto pressione ENTER, anzichè click sul bottone, per iniziare ricerca
    $('#search-input').keypress(function(event) {
        if (event.which == 13) { // è stato premuto tasto ENTER (codice 13)
            var searchInput = $('#search-input').val(); // recupero la stringa da ricercare
            // chiamo una funzione passandogli la stringa da ricercare e la pagina da restituire
            handleSearchInput(searchInput, APIpageDefault);
        }
    }); // fine evento keypress tasto ENTER

    // intercetto evento cambiamento sul selettore genere per i film
    $('#movie-card-genre select').change(function() {
        // verifico genere selezionato e visualizzo le card associate a quel genere
        applyGenreAndVoteFilters(movie);
    }); // fine evento change

    // intercetto evento cambiamento sul selettore genere per le serieTV
    $('#series-card-genre select').change(function() {
        // verifico genere selezionato e visualizzo le card associate a quel genere
        applyGenreAndVoteFilters(series);
    }); // fine evento change

    // intercetto evento cambiamento sul selettore voto per i film
    $('#movie-card-vote select').change(function() {
        // verifico genere selezionato e visualizzo le card associate a quel genere
        applyGenreAndVoteFilters(movie);
    }); // fine evento change

    // intercetto evento cambiamento sul selettore voto per le serieTV
    $('#series-card-vote select').change(function() {
        // verifico genere selezionato e visualizzo le card associate a quel genere
        applyGenreAndVoteFilters(series);
    }); // fine evento change

    // intercetto evento cambiamento sul selettore pagina per i film
    $('#movie-page').change(function() {
        // gestisco selezione nuova pagina
        handlePageChange(movie);
    }); // fine evento change

    // intercetto evento cambiamento sul selettore pagina per le serie
    $('#series-page').change(function() {
        // gestisco selezione nuova pagina
        handlePageChange(series);
    }); // fine evento change

    // intercetto evento mouseenter sul campo stringa cercata
    $('#searched-string-text').mouseenter(function() {
        // verifico se la stringa è in overflow
        var element = document.getElementById('searched-string-text');
        if (element.offsetWidth < element.scrollWidth) {
            // il testo è in overflow, visualizzo popup
            $('#searched-string-popup').removeClass('hidden');
        }
    }); // fine evento mouseenter

    // intercetto evento mouseleave sul campo stringa cercata
    $('#searched-string-text').mouseleave(function() {
        // nascondo popup
        $('#searched-string-popup').addClass('hidden');
    }); // fine evento mouseleave

}); // fine document ready

// ---------------------------- FUNCTIONs --------------------------------------
function handleSearchInput(searchString, page) {
    // DESCRIZIONE:
    // verifica se c'è una stringa da ricercare e nel caso chiama una funzione
    // per effettuare una chiamata AJAX (una per i FILM e una per le SERIE TV)
    // dopodichè resetta il campo di ricerca e svuota il contenitore delle cards
    // visualizza le intestazioni delle sezioni FILM e SERIE TV e i selettori per genere e voto

    // indica che si tratta di una richiesta dati per 'cambio pagina' se uguale a 'true'
    // quando è 'false' indica che si tratta di una richiesta dati per una 'nuova ricerca'
    var isPageChange = false;

    // verifico che la stringa non sia nulla, se la stringa è nulla avviso l'utente
    if (searchString.length >= minSearchLen) {

        // set/reset placeholder per il campo ricerca
        $("#search-input").val("").prop("placeholder", "Cerca qui...");
        // chiamata AJAX per recuperare i dati ricercati tramite API -- CERCO I MOVIES
        getMainData(APIsearchMovie, searchString, getLanguage(), page, isPageChange);
        // chiamata AJAX per recuperare i dati ricercati tramite API -- CERCO TV SERIES
        getMainData(APIsearchTV, searchString, getLanguage(), page, isPageChange);
        // resetto il campo di input inserendo una stringa vuota
        $('#search-input').val("");
        // visualizzo stringa cercata
        $('#searched-string').removeClass('hidden');
        $('#searched-string-text, #searched-string-popup').text(searchString);
        // elimino tutte le cards sulla pagina HTML
        $('.cards-container').empty();
        // nascondo le message bar
        $('#movie-message-bar, #series-message-bar').addClass("hidden");
        // nascondo le results bar
        $('#movie-results-bar, #series-results-bar').addClass('hidden');
        // nascondo l'intestazione dei titoli più popolari
        $('.main-container section:first-child').addClass('hidden');

    } else {
        // avviso utente di inserire una stringa con un minimo di 3 caratteri....
        $("#search-input").val("").prop("placeholder", "Minimo " + minSearchLen + " caratteri!");
    }
} // fine funzione handleSearchInput()


function getMainData(endpoint, query, language, page, isPageChange) {
    // DESCRIZIONE:
    // chiamata AJAX usando i parametri in ingresso alla funzione
    // per recuperare tutti i dati base del film o serie TV
    // viene chiamata in tre casi:
    // - per una nuova ricerca
    // - per una richiesta di 'cambio pagina' per una ricerca già in corso
    // - inizialmente per recuperare i titoli più popolari

    $.ajax({
        url: APIurl + endpoint,
        data: {
            'api_key': APIkey,
            'query': query,
            'language': language,
            'page': page

        },
        method: 'get',
        success: function(response) {
            handleMainData(response, endpoint, isPageChange);
        },
        error: function() {
            alert("ERRORE! C'è stato un problema nell'accesso ai dati");
        }
    }); // fine chiamata AJAX
} // fine funzione getMainData()


function handleMainData(data, endpoint, isPageChange) {
    // DESCRIZIONE:
    // esegue un ciclo 'for' su tutti i film o serie TV precedentemente trovate
    // per ognuno chiama una funzione per recuperare i dati del cast
    // se non ci sono film o serie Tv da scorrere scrive un messaggio in pagina

    if (data.total_results > 0) { // ci sono dei risultati da elaborare

        var results = data.results; // estraggo la parte di risultati che mi interessa

        // se non è una richiesta di 'cambio pagina' ma una 'nuova ricerca', reinizializzo filtri e contatori
        if (!isPageChange) { // nuova ricerca o richiesta iniziale dei titoli più popolari

            // re-inizializzo i selettori genere e voto
            $('#movie-card-genre select, #series-card-genre select').val("Tutti");
            $('#movie-card-vote select, #series-card-vote select').val("Qualsiasi");

            // nel caso di nuova ricerca visualizzo la barra filtri (selettori genere e voto)
            // e inizializzo e visualizzo la barra results (n. titoli trovati e selettore pagine)
            if (endpoint == APIsearchMovie) {
                // visualizzo barra filtri per i film
                $('#movie-filters-bar').removeClass('hidden').addClass('flex');
                showQtyAndPages(data, endpoint); // inizializzo q.tà film e il selettore pagine
                $('#movie-results-bar').removeClass('hidden');
            } else if (endpoint == APIsearchTV) {
                // visualizzo barra filtri per le SerieTv
                $('#series-filters-bar').removeClass('hidden').addClass('flex');
                showQtyAndPages(data, endpoint); // inizializzo q.tà serie e il selettore pagine
                $('#series-results-bar').removeClass('hidden');
            }
        } else { // cambio pagina
            // entro in questo ramo else quando i dati sono stati recuperati per
            // una richiesta di 'cambio pagina' e non una 'nuova ricerca'
            if (endpoint == APIsearchMovie) {
                // elimino tutte le cards dei film sulla pagina HTML
                $('#movie-container').empty();
            } else {
                // elimino tutte le cards delle serieTV sulla pagina HTML
                $('#series-container').empty();
            }

        } // fine if verifica se 'cambio pagina'

        // ciclo su tutto l'array composto dai dati base precedentemente recuperati
        // ovvero i film o serie TV trovati
        for (var i = 0; i < results.length; i++) {
            // per ogni film/serieTV chiamo una funzione per recuperare i dati del cast
            getCast(results[i], isPageChange, results.length);
        }

    } else { // non ci sono risultati da visualizzare
        // in questo ramo else ci dovrei entrare solo in caso sia una 'nuova ricerca'
        // nel caso di 'cambio pagina' i dati sono disponibili e dovrebbereo essere stati recuperati

        if (endpoint == APIsearchMovie) { // non è stato trovato nessun Film
            // nascondo barra filtri per i film
            $('#movie-filters-bar').addClass('hidden').removeClass('flex');
            // visualizzo avviso
            $('#movie-message-bar').removeClass('hidden').text("Non sono stati trovati Film");

        } else { // non è stata trovata nessuna Serie TV
            // nascondo barra filtri per le serie TV
            $('#series-filters-bar').addClass('hidden').removeClass('flex');
            // visualizzo avviso
            $('#series-message-bar').removeClass('hidden').text("Non sono state trovate Serie TV");
        }
    }
} // fine funzione handleMainData()

function getGenres(movieOrTv) {
    // DESCRIZIONE:
    // esegue chiamata AJAX per recuperare la lista generi
    // valorizza poi 2 oggetti:
    // 'movieGenresList' lista generi per i film
    // 'tvGenresList' lista generi per le serie TV

    // chiamata AJAX per recuperare i generi
    $.ajax({
        url: APIurl + movieOrTv,
        data: {
            'api_key': APIkey,
            'language': APIlangIt
        },
        method: 'get',
        success: function(genres) {

            if (movieOrTv == APIgenresMovie) {
                movieGenresList = genres; // mi salvo la lista dei generi
            } else {
                tvGenresList = genres; // mi salvo la lista dei generi
            }

            addGenreOptions(movieOrTv); // creo il selettore dei generi
        },
        error: function(error) {

            // alert("ERRORE! C'è stato un problema nel recupero dati Generi");
            // inizializzo la lista dei generi con un oggetto vuoto
            if (movieOrTv == APIgenresMovie) {
                movieGenresList = emptyGenresList;
            } else {
                tvGenresList = emptyGenresList;
            }
            console.log(
              "ERRORE! C'è stato un problema nel recupero dati Generi", error
            );
        }
    }); // fine chiamata AJAX

} // fine funzione getGenres()

function getCast(cardInfo, isPageChange, numOfCardsToBeDisplayed) {
    // DESCRIZIONE:
    // effettua chiamata AJAX per recuperare i dati relativi al cast
    // in entrambi i casi (success/error) chiama una funzione che crea la card con tutte le info

    var creditsPath = ""; // path parziale per la chiamata API
    var currentId = cardInfo.id; // id del film o serie TV corrente
    var emptyCastInfo = { // inizializzo a vuoto la proprietà cast
        'cast': ""
    };

    // costruisco il path per la chiamata API a seconda che sia Movie o TV Series
    if (cardInfo.hasOwnProperty('title')) {
        creditsPath = APIcreditsMovie.replace("id", currentId); // ramo MOVIES
    } else {
        creditsPath = APIcreditsTV.replace("id", currentId); // ramo TV SERIES
    }

    // chiamata ajax per recuperare il cast
    $.ajax({
        url: APIurl + creditsPath,
        data: {
            'api_key': APIkey,
            'language': APIlangIt
        },
        method: 'get',
        success: function(castInfo) {
            createCard(castInfo, cardInfo, isPageChange, numOfCardsToBeDisplayed);
        },
        error: function(error) {
            // chiamo comunque la funzione per creare la card, anche se non ho recuperato il cast
            createCard(emptyCastInfo, cardInfo, isPageChange, numOfCardsToBeDisplayed);
            // alert("ERRORE! C'è stato un problema nel recupero dati Cast");
            console.log(
              "ERRORE! C'è stato un problema nel recupero dati Cast:",
              error
            );

        }
    }); // fine chiamata AJAX

} // fine funzione getCast()

function createCard(castData, cardInfo, isPageChange, numOfCardsToBeDisplayed) {
    // DESCRIZIONE:
    // questa funzione ha tutti i dati necessari per preparare l'oggetto su cui lavora HANDLEBARS
    // incluso le info sul cast che riceve in ingresso come parametro
    // chiama diverse altre funzioni che preparano i singoli valori delle proprietà dell'oggetto
    // nel caso di un 'cambio pagina' verifica se la pagina è completata con tutte le cards e nel
    // caso chiama una funzione per applicare i filtri correnti sulla pagina

    var title; // titolo del film o della serie TV
    var original_title; // titolo originale del film o della serie TV
    var itemType; // tipologia, distingue se FILM o SERIE TV
    var numOfCurrentCards = 0; // contatore delle card inserite in pagina
    var movieOrTv; // identifica se Film o serieTV


    // distinguo a seconda se è un film o una serie TV
    // solo i film hanno la proprietà 'title', le serie TV hanno invece la proprietà 'name'
    if (cardInfo.hasOwnProperty('title')) {
        // ramo Film
        title = cardInfo.title;
        original_title = cardInfo.original_title;
        itemType = "Film";
        movieOrTv = movie;

    } else {
        // ramo SerieTV
        title = cardInfo.name;
        original_title = cardInfo.original_name;
        itemType = "Serie TV";
        movieOrTv = series;
    }

    var whichContainer = movieOrTv + '-container'; // contenitore cards

    // ------------------------- HANDLEBARS ------------------------------------
    // creo un oggetto per HANDLEBARS con i dati da inserire in pagina
    var context = {
        'id': cardInfo.id,
        'title': title,
        'original-title': original_title,
        'type': itemType,
        'genres': createGenres(cardInfo),
        'year': createYear(cardInfo),
        'flag-image': createFlag(cardInfo.original_language),
        'stars': createStars(cardInfo.vote_average),
        'vote': Math.round(cardInfo.vote_average / 2),
        'cast': createCast(castData),
        'overview': createOverview(cardInfo.overview),
        'img-link': createPosterLink(cardInfo.poster_path),
        'genre-ids': cardInfo.genre_ids.join(" ")
    };
    // recupero il codice html dal template HANDLEBARS
    var cardTemplate = $('#card-template').html();
    // compilo il template HANDLEBARS, lui mi restituisce un funzione
    var cardFunction = Handlebars.compile(cardTemplate);
    // chiamo la funzione generata da HANDLEBARS per popolare il template
    var card = cardFunction(context);
    // ------------------------- HANDLEBARS ------------------------------------

    // aggiungo nella mia pagina la card, ovvero il codice HTML generato da HANDLEBARS
    $('#' + whichContainer).append(card);
    // conto quante card ho già inserito
    numOfCurrentCards = $('#' + whichContainer + ' .card').length;

    // se sto creando una pagina relativa ad un 'cambio pagina',
    // devo applicare i filtri correnti (genere e voto),
    // se la pagina è completa, ho scritto l'ultima card, allora chiamo la funzione
    // per applicare i filtri correnti (genere e voto)
    if (isPageChange && (numOfCurrentCards == numOfCardsToBeDisplayed)) {
        // è un cambio pagina, e ho completato l'inserimento di tutte le card sulla pagina,
        // applico i filtri correnti
        applyGenreAndVoteFilters(movieOrTv);
    }


} // fine funzione createCard()

function createGenres(cardInfo) {
    // DESCRIZIONE:
    // identifica quali sono i generi associati al film/serieTV e ritorna una stringa che li contiene
    // lavora su 2 oggetti: movieGenresList e tvGenresList (ovvero le liste generi)
    // NOTA: la lista generi ricevuta dall'API è un oggetto con dentro un array,
    // l'array contiene degli oggetti, ogni oggetto ha 2 proprietà:
    // "id": codice_genere (è un numero) ,
    // "name": nome_genere (è una stringa)

    // lista generi su cui lavorare
    var genresList = {
        'genres': []
    };

    //verifico quale lista usare: film o serieTV
    if (cardInfo.hasOwnProperty('title')) {
        genresList = movieGenresList; // lavoro sulla lista dei film
    } else {
        genresList = tvGenresList; // lavoro sulla lista delle serieTV
    }

    var genresArray = []; // array con tutti i generi associati a un singolo film/serieTV
    var genresString = ""; // stringa con tutti i generi associati a un singolo film/serieTV

    // scorro tutti i generi (formato numerico) associati al film/serieTV corrente
    for (var j = 0; j < cardInfo.genre_ids.length; j++) {

        // scorro tutta la lista globale dei generi ricevuta dall'API
        for (var k = 0; k < genresList.genres.length; k++) {

            // cerco il genere del film/serie all'interno della lista
            if (genresList.genres[k].id == cardInfo.genre_ids[j]) {

                // costruisco un array con tutti i generi (formato stringa) per il film/serie corrente
                genresArray.push(genresList.genres[k].name);
            }
        } // end for sui generi del film/serie corrente
    } // end for sulla lista globale generi

    if (genresArray.length > 0) { // ci sono dei generi da visualizzare
        // unisco gli elementi dell'array in un'unica stringa separata da virgola+spazio
        genresString = genresArray.join(", ");

    } else { // non ci sono generi da visualizzare

        genresString = notAvailable; // visualizzo la stringa "non disponibile"
    }

    return genresString;

} // fine funzione createGenres()

function createCast(castList) {
    // DESCRIZIONE:
    // estrae i dati del cast dall'oggetto in ingresso e li restituisce sotto forma di stringa

    var castNames = [];
    var names = ""; // stringa per i nomi che compongono il cast

    if (castList.cast.length == 0) {
        names = notAvailable; // non ci sono elementi nell'array del cast
    } else {

        // estraggo i primi 5 elementi o quelli che ci sono se meno di 5
        castList.cast = castList.cast.slice(0, maxCastLength);

        // estraggo solo la proprietà 'name' e la metto in un array
        for (var i = 0; i < castList.cast.length; i++) {
            castNames.push(castList.cast[i].name);
        }
        // unisco gli elementi dell'array in un'unica stringa separata da virgola+spazio
        names = castNames.join(", ");
    }

    return names;

} // fine funzione createCast()

function createPosterLink(posterLink) {
    // DESCRIZIONE:
    // crea il path completo per recuperare l'immagine (poster) del film/serie tv
    // gestisce il caso in cui il poster non è disponibile

    var imgUrlVariable = posterLink; // indirizzo specifico dell'immagine richiesta tramite API
    var path = "";

    if (imgUrlVariable == null || imgUrlVariable == "") {
        // non c'è il poster, utilizzo un'immagine di default
        path = imgNotAvailable;
    } else {
        // compongo il path con le parti fisse + il path parziale recuperato con l'API
        path = imgUrlFixed + imgUrlSize + imgUrlVariable;
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
    // piene o vuote

    var starsCounter = Math.round(vote / 2); // numero di stelle piene da visualizzare (da 0 a 5)
    var fullStar = '<i class="fas fa-star"></i>'; // stella piena
    var emptyStar = '<i class="far fa-star grayed"></i>'; // stella vuota
    var stars = ""; // codice HTML ritornato dalla funzione

    // ciclo sempre 5 volte e inserisco le stelle piene o vuote in base a starsCounter
    for (var i = 0; i < maxStars; i++) {
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

    if (text == "" || text == null) {
        textToBeDisplayed = notAvailable; // non c'è una Overview
    } else {
        textToBeDisplayed = text;
    }
    return textToBeDisplayed;
}

function createYear(cardInfo) {
    // DESCRIZIONE:
    // estrae l'anno di uscita del film/serieTv, se disponibile
    // il valore da manipolare è 'null', stringa vuota ("")
    // o è un valore nel formato stringa "yyyy-mm-dd"

    var release = "";

    if (cardInfo.hasOwnProperty('title')) {
        // caso Film
        release = cardInfo.release_date;
    } else {
        // caso serie TV
        release = cardInfo.first_air_date;
    }


    if (release == "" || release == null) {
        // visualizzo "non disponibile"
        release = notAvailable;
    } else {
        // estraggo solo i primi 4 caratteri, l'anno
        release = release.slice(0, 4);
    }

    return release;
}


function addGenreOptions(movieOrTv) {
    // DESCRIZIONE:
    // inizializza l'elenco delle option sulla select dei generi

    var selectOption = ""; // codice HTML da inserire in pagina
    var genresList = ""; // oggetto con la lista globale dei generi

    if (movieOrTv == APIgenresMovie) { // lavoro su i film

        genresList = movieGenresList; // oggetto con la lista globale dei generi
        container = 'movie-card-genre'; // contenitore dove fare l'append
    } else { // lavoro su le serieTV

        genresList = tvGenresList; // oggetto con la lista globale dei generi
        container = 'series-card-genre'; // contenitore dove fare l'append
    }

    // ricavo l'elenco dei generi da inserire
    for (var i = 0; i < genresList.genres.length; i++) {
        // creo il codice HTML da aggiungere in pagina
        selectOption = '<option value="' + genresList.genres[i].name + '">' + genresList.genres[i].name + '</option>';

        // faccio un append della singola option
        $('#' + container + ' select').append(selectOption);
    }

} // fine funzione addGenreOptions()

function applyGenreAndVoteFilters(movieOrTv) {
    // DESCRIZIONE:
    // usa l'attributo data-genre associato ad ogni card per verificre se la card ha
    // il genere che vuol vedere l'utente un film/serieTV può avere più generi associati,
    // ad ogni genere corrisponde un id numerico
    // usa l'attributo data-vote associato ad ogni card per verificare il voto di quella card
    // combina poi la selezione del genere con la selezione del voto e stabilisce se visualizzare la card
    // o lasciarla nascosta

    var wholeGenresList; // lista completa dei generi per i filmm/serieTV

    // compongo i nomi degli elementi HTML su cui lavorare
    var whichGenreSelect = movieOrTv + '-card-genre'; // selettore genere
    var whichVoteSelect = movieOrTv + '-card-vote'; // selettore voto
    var whichContainer = movieOrTv + '-container'; // contenitore cards
    var whichMessageBar = movieOrTv + '-message-bar'; // barra messaggi

    // recupero la lista completa dei generi per film o serie TV
    if (movieOrTv == movie) {
        wholeGenresList = movieGenresList; // caso film
        // nascondo la message bar per i film
        $('#movie-message-bar').addClass("hidden");
    } else {
        wholeGenresList = tvGenresList; // caso serieTV
        // nascondo la message bar per le serie TV
        $('#series-message-bar').addClass("hidden");
    }

    // mi salvo il genere e il voto correnti selezionati dall'utente
    var genreSelected = $('#' + whichGenreSelect + ' select').val();
    var voteSelected = $('#' + whichVoteSelect + ' select').val();

    // parto da una situazione in cui tutte le card sono visibili e nascondo
    // quelle che non soddisfano i criteri dei filtri
    $('#' + whichContainer + ' .card').fadeIn();
    var noneDisplayed = true; // se uguale a 'false' indica che almeno una card rimane visualizzata

    // scorro tutte le card con un ciclo 'each'
    $('#' + whichContainer + ' .card').each(function() {

        // mi salvo gli id dei generi associati al singolo movie/serieTV in una stringa
        var itemGenres = $(this).attr("data-genre");
        // trasformo la stringa in array di elementi numerici (grazie a .map(number))
        var itemGenresIds = itemGenres.split(" ").map(Number);

        var genreSelectedId = "";
        // trasformo il genere selezionato dall'utente da stringa a numero (codice id)
        for (var i = 0; i < wholeGenresList.genres.length; i++) {
            if (wholeGenresList.genres[i].name == genreSelected) {
                genreSelectedId = wholeGenresList.genres[i].id;
            }
        }

        // mi salvo il voto associato al singolo movie/serieTV
        var itemVote = $(this).attr("data-vote");

        // verifico il genere selezionato con i generi associati alla singola card
        // verifico il voto selezionato col voto della singola serieTV/film
        if ((!(itemGenresIds.includes(genreSelectedId)) && (genreSelected != "Tutti")) ||
            (itemVote < voteSelected && (voteSelected != "Qualsiasi"))) {
            // nascondo le card in base al genere e al voto selezionato dall'utente
            $(this).fadeOut();
        } else {
            noneDisplayed = false; // almeno una card rimane visualizzata
        }
    }); // end each

    if (noneDisplayed) { // nessuna card è rimasta visualizzata
        // scrivo un avviso nella message bar
        $('#' + whichMessageBar).removeClass("hidden").text("Non ci sono titoli che soddisfano i criteri selezionati");
    }
} // fine funzione applyGenreAndVoteFilters()

function getLanguage() {
    // DESCRIZIONE:
    // legge il valore corrente del selettore lingua
    // e ritorna la stringa da utilizzare nella chiamata API

    // recupero parametro lingua corrente
    var lang = $('#search-language select').val();
    switch (lang) {
        case "EN":
            lang = APIlangEn;
            break;
        case "FR":
            lang = APIlangFr;
            break;
        case "ES":
            lang = APIlangEs;
            break;
        default:
            lang = APIlangIt;
    }

    return lang;

} // fine funzione getLanguage()

function showQtyAndPages(results, movieOrTv) {
    // DESCRIZIONE:
    // inizializza l'elenco delle option sul selettore delle pagine
    // e visualizza il numero totale di titoli trovati

    var selectOption = ""; // codice HTML da inserire in pagina

    if (movieOrTv == APIsearchMovie) { // lavoro su i film
        container = 'movie-page select'; // contenitore dove fare l'append
        $('#movie-counter span').text(results.total_results); // setto il numero totale di titoli trovati
    } else { // lavoro su le serieTV
        container = 'series-page select'; // contenitore dove fare l'append
        $('#series-counter span').text(results.total_results); // setto il numero totale di titoli trovati
    }

    // elimino le options precedenti
    $('#' + container).empty();

    // ciclo per il numero di pagine trovate e appendo le options
    for (var i = 1; i <= results.total_pages; i++) {
        // creo il codice HTML da aggiungere in pagina
        selectOption = '<option value="' + i + '">' + i + '</option>';

        // faccio un append della singola option
        $('#' + container).append(selectOption);
    }

} // fine funzione showQtyAndPages()

function handlePageChange(movieOrTv) {
    // DESCRIZIONE:
    // gestisce la richiesta di cambio pagina a seguito di una variazione del selettore pagina

    var page = 1; // numero di pagina selezionato dall'utente
    var isPageChange = true; // indica che si tratta di una richiesta dati per cambio pagina
    var searchedString = $('#searched-string-text').text(); // recupero la stringa che è stata cercata

    // recupero il numero di pagina selezionato
    page = $('#' + movieOrTv + '-page select').val();

    if (movieOrTv == movie) {
        // chiamata AJAX per recuperare i dati ricercati tramite API -- CERCO I MOVIES
        getMainData(APIsearchMovie, searchedString, getLanguage(), page, isPageChange);
    } else {
        // chiamata AJAX per recuperare i dati ricercati tramite API -- CERCO TV SERIES
        getMainData(APIsearchTV, searchedString, getLanguage(), page, isPageChange);
    }

} // fine funzione handlePageChange()

function handleTrendingData() {
    // DESCRIZIONE:
    // esegue chiamate API per recuperare i dati dei film e delle serieTV più popolari

    // chiamata AJAX per recuperare i dati tramite API
    getMainData(APItrendingMovie, "", APIlangIt, APIpageDefault, false);
    // chiamata AJAX per recuperare i dati tramite API
    getMainData(APItrendingTV, "", APIlangIt, APIpageDefault, false);

    // visualizzo le intestazioni per le sezioni Film e Serie TV
    $('.heading-bar').removeClass('hidden');

} // fine funzione handleTrendingData()