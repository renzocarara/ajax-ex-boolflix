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
// var APImovie = '/movie/movie_id'; // endpoint per richiedere dati di uno specifico film
// var APItv = '/tv_id'; // endpoint per richiedere dati di una specifica serie TV
var APIcreditsMovie = '/movie/id/credits'; // endpoint per richiedere il Cast di un film, la stringa 'id' deve essere sostituita con l'id del film
var APIcreditsTV = '/tv/id/credits'; // endpoint per richiedere Cast di una serieTV , la stringa 'id' deve essere sostituita con l'id della serieTV
var APIgenresMovie = '/genre/movie/list'; // endpoint per recuperare lista generi per i film
var APIgenresTV = '/genre/tv/list'; // endpoint per recuperare lista generi per le serie TV

var APIkey = '541a69e2ef5cfc0e4d5d4e563ef1de78'; // la mia chiave per le API TDMB
var APIlang = 'it-IT'; // parametro lingua, quando costruisco la richiesta all'API

var imgUrlFixed = 'https://image.tmdb.org/t/p/'; // indirizzo base per le immagini
var imgUrlSize = 'w342/'; // dimensione dell'immagine
var imgNotAvailable = "images/no_poster.png"; // immagine di default

var notAvailable = "non disponibile"; // stringa da visualizzare quando non ci sono dati
var maxCastLength = 5; // numero max di componeneti del cast da visualizzare in pagina
var movie = "movie";
var tv = "tv";

// elenco lingue per cui è disponibile una bandierina da visualizare
var availableFlags = ['bg', 'zh', 'cs', 'de', 'dk', 'en', 'es', 'et', 'fi', 'fr', 'gr', 'hr', 'hu', 'in', 'is',
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

getGenres(APIgenresMovie); // valorizza l'oggetto che contiene la lista dei generi per i film: 'movieGenresList'
getGenres(APIgenresTV); // valorizza l'oggetto che contiene la lista dei generi per le serieTV: 'tvGenresList'

$(document).ready(function() {

    //intercetto click su bottone per la ricerca
    $('#search-button').click(function() {
        var searchInput = $('#search-input').val(); // recupero la stringa da ricercare
        if (searchInput) { // verifico se la stringa non è nulla

            handleSearchInput(searchInput); // chiamo una funzione passandogli la stringa da ricercare
        }
    }); // fine evento click su bottone send

    // intercetto pressione ENTER, anzichè click sul bottone, per iniziare ricerca
    $('#search-input').keypress(function(event) {
        if (event.which == 13) { // è stato premuto tasto ENTER (codice 13)
            var searchInput = $('#search-input').val(); // recupero la stringa da ricercare
            handleSearchInput(searchInput); // chiamo una funzione passandogli la stringa da ricercare
        }
    }); // fine evento keypress tasto ENTER

    // intercetto e gestisco evento mouseenter su una card
    $('#movies-container, #series-container').on("mouseenter", ".card", function() {
        // nascondo l'immagine poster, rendendo così visibile il testo sottostante
        $(this).find('.card-poster').addClass('hidden');
    }); // fine evento mouseenter

    // intercetto e gestisco evento mouseleave su una card
    $('#movies-container, #series-container').on("mouseleave", ".card", function() {
        // faccio riapparire l'immagine poster che mi va a coprire il testo
        $(this).find('.card-poster').removeClass('hidden');
    }); // fine evento mouseleave

    // intercetto evento cambiamento sul selettore genere per i film
    $('#movie-card-genre select').change(function() {
        // verifico genere selezionato e visualizzo le card associate a quel genere
        handleCardGenre(movie);
    }); // fine evento change

    // intercetto evento cambiamento sul selettore genere per le serieTV
    $('#series-card-genre select').change(function() {
        // verifico genere selezionato e visualizzo le card associate a quel genere
        handleCardGenre(tv);
    }); // fine evento change

}); // fine document ready

// ---------------------------- FUNCTIONs --------------------------------------
function handleSearchInput(searchString) {
    // DESCRIZIONE:
    // verifica se c'è una stringa da ricercare e nel caso chiama una funzione
    // per effettuare una chiamata AJAX (una per i FILM e una per le SERIE TV)
    // dopodichè resetta il campo di ricerca e svuota il contenitore delle cards
    // visualizza le intestazioni delle sezioni FILM e SERIE TV

    // verifico che la stringa non sia nulla, se la stringa è nulla non faccio niente
    if (searchString) {
        // chiamata AJAX per recuperare i dati ricercati tramite API -- CERCO I MOVIES
        getMainData(APIsearchMovie, searchString);
        // chiamata AJAX per recuperare i dati ricercati tramite API -- CERCO TV SERIES
        getMainData(APIsearchTV, searchString);
        //resetto il campo di input inserendo una stringa vuota
        $('#search-input').val("");
        // elimino tutte le cards sulla pagina HTML
        $('.cards-container').empty();
        // visualizzo le intestazioni per le sezioni Film e Serie TV
        $('.section-header').addClass('visible');
        // inizializzo i selettori genere al valore "Tutti"
        $('#movie-card-genre select, #series-card-genre select').val("Tutti");
    }
} // fine funzione handleSearchInput()


function getMainData(endpoint, query) {
    // DESCRIZIONE:
    // chiamata AJAX usando i parametri in ingresso alla funzione
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
            handleMainData(response, endpoint);
        },
        error: function() {
            alert("ERRORE! C'è stato un problema nell'accesso ai dati");
        }
    }); // fine chiamata AJAX
} // fine funzione getMainData()


function handleMainData(data, endpoint) {
    // DESCRIZIONE:
    // esegue un ciclo 'for' su tutti i film o serie TV precedentemente trovate
    // per ognuno chiama una funzione per recuperare i dati del cast
    // se non ci sono film o serie Tv da scorrere scrive un messaggio in pagina

    if (data.total_results > 0) { // ci sono dei risultati da elaborare

        var mainInfo = data.results; // estraggo la parte di risultati che mi interessa

        // visualizzo campo select per selezione tramite genere
        if (endpoint == APIsearchMovie) {
            $('#movie-card-genre').removeClass('hidden');
        } else {
            $('#series-card-genre').removeClass('hidden');
        }

        // ciclo su tutto l'array composto dai dati base precedentemente recuperati
        // ovvero i film o serie TV trovati
        for (var i = 0; i < mainInfo.length; i++) {
            // per ogni film/serieTV chiamo una funzione per recuperare i dati del cast
            getCast(mainInfo[i]);
        }

    } else {

        if (endpoint == APIsearchMovie) { // non è stato trovato nessun Film
            $('#movie-card-genre').addClass('hidden'); // nascondo selettore generi
            $('#movies-container').append("Non sono stati trovati Film");

        } else { // non è stata trovata nessuna Serie TV
            $('#series-card-genre').addClass('hidden'); // nascondo selettore generi
            $('#series-container').append("Non sono state trovate Serie TV");
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
            'language': APIlang
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
        error: function() {

            alert("ERRORE! C'è stato un problema nel recupero dati Generi");
            // inizializzo la lista dei generi con un oggetto vuoto
            if (movieOrTv == APIgenresMovie) {
                movieGenresList = emptyGenresList;
            } else {
                tvGenresList = emptyGenresList;
            }
        }
    }); // fine chiamata AJAX

} // fine funzione getGenres()

function getCast(OneItemInfo) {
    // DESCRIZIONE:
    // effettua chiamata AJAX per recuperare i dati relativi al cast
    // in ogni caso (successo/errore) chiama una funzione che crea la card con tutte le info

    var creditsPath = ""; // path parziale per la chiamata API
    var currentId = OneItemInfo.id; // id del film o serie TV corrente
    var emptyCastInfo = { // inizializzo a vuoto la proprietà cast
        'cast': ""
    };

    // costruisco il path per la chiamata API a seconda che sia Movie o TV Series
    if (OneItemInfo.hasOwnProperty('title')) {
        creditsPath = APIcreditsMovie.replace("id", currentId); // ramo MOVIES
    } else {
        creditsPath = APIcreditsTV.replace("id", currentId); // ramo TV SERIES
    }

    // chiamata ajax per recuperare il cast
    $.ajax({
        url: APIurl + creditsPath,
        data: {
            'api_key': APIkey,
            'language': APIlang
        },
        method: 'get',
        success: function(castInfo) {
            createCard(castInfo, OneItemInfo);
        },
        error: function() {
            // chiamo comunque la funzione per creare la card, anche se non ho recuperato il cast
            createCard(emptyCastInfo, OneItemInfo);
            alert("ERRORE! C'è stato un problema nel recupero dati Cast");

        }
    }); // fine chiamata AJAX

} // fine funzione getCast()

function createCard(castData, OneItemData) {
    // DESCRIZIONE:
    // questa funzione ha tutti i dati necessari per preparare l'oggetto su cui lavora HANDLEBARS
    // incluso le info sul cast che riceve in ingresso come parametro
    // chiama diverse altre funzioni che preparano i singoli valori delle proprietà dell'oggetto

    var title; // titolo del film o della serie TV
    var original_title; // titolo originale del film o della serie TV
    var ItemType; // tipologia, distingue se FILM o SERIE TV

    // distinguo a seconda se è un film o una serie TV
    // solo i film hanno la proprietà 'title', le serie TV hanno invece la proprietà 'name'
    if (OneItemData.hasOwnProperty('title')) {
        // ramo MOVIES
        title = OneItemData.title;
        original_title = OneItemData.original_title;
        ItemType = "Film";

    } else {
        // ramo TV SERIES
        title = OneItemData.name;
        original_title = OneItemData.original_name;
        ItemType = "Serie TV";
    }

    // ------------------------- HANDLEBARS ------------------------------------
    // creo un oggetto per HANDLEBARS con i dati da inserire in pagina
    var context = {
        'id': OneItemData.id,
        'title': title,
        'original-title': original_title,
        'type': ItemType,
        'genres': createGenres(OneItemData),
        'flag-image': createFlag(OneItemData.original_language),
        'stars': createStars(OneItemData.vote_average),
        'cast': createCast(castData),
        'overview': createOverview(OneItemData.overview),
        'img-link': createPosterLink(OneItemData.poster_path),
        'genre-ids': OneItemData.genre_ids.join(" ")
    };
    // recupero il codice html dal template HANDLEBARS
    var cardTemplate = $('#card-template').html();
    // compilo il template HANDLEBARS, lui mi restituisce un funzione
    var cardFunction = Handlebars.compile(cardTemplate);
    // chiamo la funzione generata da HANDLEBARS per popolare il template
    var card = cardFunction(context);
    // ------------------------- HANDLEBARS ------------------------------------

    // aggiungo nella mia pagina le cards, ovvero il codice HTML generato da HANDLEBARS
    if (ItemType == "Film") {
        // aggiungo la card nella sezione Film
        $('#movies-container').append(card);
    } else {
        // aggiungo la card nella sezione Serie TV
        $('#series-container').append(card);
    }
} // fine funzione createCard()

function createGenres(OneItemData) {
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
    if (OneItemData.hasOwnProperty('title')) {
        genresList = movieGenresList; // lavoro sulla lista dei film
    } else {
        genresList = tvGenresList; // lavoro sulla lista delle serieTV
    }

    var genresArray = []; // array con tutti i generi associati a un singolo film/serieTV
    var genresString = ""; // stringa con tutti i generi associati a un singolo film/serieTV
    var itemId = OneItemData.id; // id del film/serie corrente

    // scorro tutti i generi (formato numerico) associati al film/serieTV corrente
    for (var j = 0; j < OneItemData.genre_ids.length; j++) {

        // scorro tutta la lista globale dei generi ricevuta dall'API
        for (var k = 0; k < genresList.genres.length; k++) {

            // cerco il genere del film/serie all'interno della lista
            if (genresList.genres[k].id == OneItemData.genre_ids[j]) {

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
        textToBeDisplayed = notAvailable; // non c'è una Overview
    } else {
        textToBeDisplayed = text;
    }
    return textToBeDisplayed;
}

function addGenreOptions(movieOrTv) {
    // DESCRIZIONE:
    // inizializza l'elenco delle option sulla select dei generi

    var selectOption = ""; // codice HTML da inserire in pagina

    if (movieOrTv == APIgenresMovie) { // aggiungo le option nella select per i film

        // ricavo l'elenco dei generi dalla variabile globale movieGenresList
        for (var i = 0; i < movieGenresList.genres.length; i++) {
            // creo il codice HTML da aggiungere in pagina
            selectOption = '<option value="' + movieGenresList.genres[i].name + '">' + movieGenresList.genres[i].name + '</option>';

            // faccio un append della singola option
            $('#movie-card-genre select').append(selectOption);
        }

    } else { // aggiungo le option nella select  per le serieTV

        // ricavo l'elenco dei generi dalla variabile globale movieGenresList
        for (var j = 0; j < tvGenresList.genres.length; j++) {
            // creo il codice HTML da aggiungere in pagina
            selectOption = '<option value="' + tvGenresList.genres[j].name + '">' + tvGenresList.genres[j].name + '</option>';

            // faccio un append della singola option
            $('#series-card-genre select').append(selectOption);
        }
    }
} // fine funzione addGenreOptions()

function handleCardGenre(movieOrTv) {
    // DESCRIZIONE:
    // usa l'attributo data-genre associato ad ogni card per verificre se la card ha
    // il genere che vuol vedere l'utente e nel caso la rende visibile
    // un film/serieTV può avere più generi associati, ad ogni genere corrisponde un id numerico

    var wholeGenresList; // lista completa dei generi per i filmm/serieTV
    var whichGenreSelect; // mi indica il selettore di genere, se film o serieTV
    var whichContainer; // mi indica quale contenitore aggiorno, film o serieTV

    if (movieOrTv == movie) {
        // elaboro i generi per i film
        wholeGenresList = movieGenresList;
        whichGenreSelect = 'movie-card-genre';
        whichContainer = 'movies-container';
    } else {
        // elaboro i generi per le serieTV
        wholeGenresList = tvGenresList;
        whichGenreSelect = 'series-card-genre';
        whichContainer = 'series-container';
    }

    // mi salvo il genere selezionato dall'utente
    var genreSelected = $('#' + whichGenreSelect + ' select').val();
    // parto sempre da una situazione in cui tutte le card non sono visibili
    $('#' + whichContainer + ' .card').fadeOut();

    // scorro tutte le card con un ciclo 'each' e verifico se ha il genere selezionato
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

        // verifico il genere selezionato con i generi associati alla singola card
        if (itemGenresIds.includes(genreSelectedId) ||
            (genreSelected == "Tutti")) {
            // rendo visibili le card che hanno il genere selezionato dall'utente
            $(this).fadeIn();
        }
    }); // end each
} // fine funzione handleCardGenre()