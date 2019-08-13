//name spacing for the app
const tournament = {};

//an array that contains all cats returned from the api call
tournament.cats = [];
tournament.catImages = [];
const startButton = document.querySelector('.startButton');
const catRing = document.querySelector('.catRing');
tournament.quarterFinalists = [];
tournament.semiFinalists = [];
tournament.finalists = [];

//call cats from the cat API
tournament.catApiUrlToAllBreeds = 'https://api.thecatapi.com/v1/breeds';

tournament.APIHeaders = new Headers ({
    'x-api-key': 'c717fd08-fa53-43c6-b81d-d04bbf27cb86',
    'method': 'GET'
})

// Call images of each cat
//creating instance of a class
//this is like a mold and you're creating instances from the mold
//this changes the way code works
tournament.catAPIImagesURL = new URL('https://api.thecatapi.com/v1/images/search');


tournament.callAllCats = async () => {
    try {
        const response = await fetch(tournament.catApiUrlToAllBreeds, {
                headers : tournament.APIHeaders
            });
        const result = await response.json();
        tournament.cats.push(...result);
    } catch (err) {
        console.log(err.message);
    }
}

tournament.getImages = async (sixteenCats) => {
   const catIds = sixteenCats.map(cat => cat.id);

   for (let i = 0; i < sixteenCats.length; i ++) {
       const params = {
           breed_id: catIds[i],
           size: "thumb"
       };
       tournament.catAPIImagesURL.search = new URLSearchParams(params);

        try {
            const imageRequest = await fetch(tournament.catAPIImagesURL, {
                headers: tournament.APIHeaders
            });
            const imageRes = await imageRequest.json();
            tournament.catImages.push(imageRes[0].url);
        }
        catch(err) {
            console.log(err.message)
        }
    }
}

// fetch(tournament.catApiUrlToAllBreeds, {
//     headers : tournament.APIHeaders
// }).then(function(response) {
//     return response.json();
// }).then(data => {
//     tournament.cats.push(...data);
//     tournament.catIds = tournament.cats.map(cat=>cat.id);
// }).catch(error => console.log(error));

// tournament.callOneCat = fetch(tournament.catAPIImagesURL, {
//     headers: tournament.APIHeaders
// }).then(function (response) {
//     return response.json();
// }).then(data => console.log(data))
//     .catch(error => console.log(error));


//shuffle the cats
tournament.shuffle = data => {
    for (let i = 0; i < data.length; i++) {
        // Generate a random number
        const randomIndex = Math.floor(Math.random() * (data.length - 1));
        //destructuring: Swapping two items' orders
        [data[i], data[randomIndex]] = [data[randomIndex], data[i]];
    }
    return data;
};

//get 16 cats
tournament.getSixteenCats = (cats) => {
    tournament.shuffle(cats);
    const catsForTournament = cats.slice(0, 16);
    return catsForTournament;
}

// loop over to put data into HTML elements
tournament.loadDataToHTMLElements = (catData) => {
    const catsInHTML = catData.map((cat, i) => {
        return `<div class="cat">
            <img src=${tournament.catImages[i]} alt=${cat.name}/>
            <div className="catContent">
                <p class="catName" id=${cat.id}>${cat.name}</p>
                <p class="origin">origin: ${cat.origin}</p>
                <p class="energyLevel">energy: ${cat.energy_level}/5</p>
                <p class="sheddingLevel">shedding: ${cat.shedding_level}/5</p>
            </div>
            </div>`
    })

    return catsInHTML
}

//make pairs from cat data
tournament.makePairs = (catData) => {
    const pairedCats = [];
    for (let i = 0; i < catData.length; i += 2) {
        const j = i + 1;
        const pair = [catData[i], catData[j]]
        pairedCats.push(pair)
    }
    return pairedCats;
}

// push cat data to the dom 
// return array of the current html elements
tournament.generateGame = (pairedCats, i) => {
    //update the DOM
    //select the elements updated
    const twoCats = document.querySelectorAll('.cat');
    //make an array of the selected elements
    const twoCatsArray = Array.from(twoCats);
    //attach event listeners
    // store the selected item into a variable
    twoCatsArray.map(cat => {
        cat.addEventListener('click',function() {
            const catDiv = document.createElement("div");
            catDiv.className = "cat"
            catDiv.appendChild(this);
            tournament.updateCats(pairedCats, i + 1)
            switch (pairedCats.length){
                case 8:
                    tournament.quarterFinalists.push(catDiv.innerHTML);
                    break;
                case 4:
                    tournament.semiFinalists.push(catDiv.innerHTML);
                    break;
                case 2:
                    tournament.finalists.push(catDiv.innerHTML);
                    break;
                case 1: 
                    catRing.innerHTML = '<div class="winner">The winner is...</div>'
                    setTimeout(() => {
                        tournament.endGame(catDiv)
                    }, 1000)
                    break;
                default:
                    return
            }
        })
     })

}

tournament.endGame = (catDiv) => {
    catRing.innerHTML = catDiv.innerHTML
    const button = document.createElement("button");
    button.innerHTML = 'replay';
    button.className = 'replayButton'
    catRing.appendChild(button);
    button.addEventListener('click', () => {
        location.reload();
    })
}
tournament.updateCats = (pairedCats, i) => {
    const nextRoundButton = '<button class="nextRoundButton">Go to Next Round</button>'
        catRing.innerHTML = pairedCats[i];
        tournament.generateGame(pairedCats, i);
        
        if (i === pairedCats.length) {
            catRing.innerHTML = nextRoundButton;
            const nextRoundButtonInDom = document.querySelector('.nextRoundButton');
            nextRoundButtonInDom.addEventListener('click', () => {
                switch (pairedCats.length) {
                    case 8:
                        tournament.updateRound(tournament.quarterFinalists);
                        break;
                    case 4: 
                        tournament.updateRound(tournament.semiFinalists);
                        break;
                    case 2: 
                        tournament.updateRound(tournament.finalists);
                        break;
                    default:
                        return
                }
            })
        }
}


// function that calls other functions to start the game
tournament.startGame = async (catData) => {
    const sixteenCats = tournament.getSixteenCats(catData);
    catRing.innerHTML = '<div class="loading">LOADING...</div>'
    await tournament.getImages(sixteenCats);
    const catsInHTML = tournament.loadDataToHTMLElements(sixteenCats);
    const pairedCats = tournament.makePairs(catsInHTML);
    tournament.updateCats(pairedCats, 0);
}

tournament.updateRound = (cats) => {
    const playingCats = tournament.makePairs(cats);
    tournament.updateCats(playingCats, 0);
}

// document ready
document.addEventListener("DOMContentLoaded", function () {
    tournament.callAllCats();
    startButton.addEventListener('click', () => {
        tournament.startGame(tournament.cats);
        startButton.setAttribute("disabled", "");
        startButton.className = "disabled";
    });
})

