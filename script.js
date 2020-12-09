let map;

// Create the script tag, set the appropriate attributes
var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBHdJBiGd6Gs9U09P_Jg3QgSCtH6TjJcBQ&callback=initMap&libraries=places';
script.defer = true;

// Attach your callback function to the `window` object
window.initMap = function() {
    const melbourne = {lat:37.8136,lng:144.9631}
    map = new google.maps.Map(document.getElementById("map"),{
        zoom:4,
        center:melbourne,
    });

    mapLoad(1);
};

function mapLoad(i){
    //Get the HTML input element for the autocomplete searchbox
    var input = document.getElementById(`input${i}`);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    //Bounding search results to Melbourne
    var defaultBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(-38.486810,144.341379),
        new google.maps.LatLng(-37.444033,145.627271)
    );

    var options = {
        bounds : defaultBounds
    };

    //Create the autocomplete object
    var autocomplete = new google.maps.places.Autocomplete(input, options);
}

// Append the 'script' element to 'head'
document.head.appendChild(script);

function newAddressField(i){
    var oldbtn = document.getElementById(`btn${i}`);
    oldbtn.remove();
    i++;
    var div = document.createElement('div');
    div.setAttribute('id',`option${i}`);
    var input = document.createElement('input');
    input.setAttribute('class', 'controls');
    input.setAttribute('id',`input${i}`);
    input.setAttribute('type','text');
    input.setAttribute('placeholder','Start typing here');
    var btn = document.createElement('button');
    btn.setAttribute('id',`btn${i}`);
    btn.setAttribute('class','btn');
    btn.setAttribute('onclick',`newAddressField(${i})`);
    btn.innerHTML = '+';
    div.appendChild(input);
    div.appendChild(btn);
    var adress = document.getElementById('adresses');
    adress.appendChild(div);
    mapLoad(i);
}

//save adressed in array upon submission
function saveToArray(){
    var adr = document.querySelectorAll('.controls');
    var adresses = [];
    adr.forEach(a => adresses.push(a.value));
    distanceArray(adresses);
}

//Store distance in array
async function distanceArray(adresses){
    var distArray = [];
    for(var i = 0; i < adresses.length; i++){
        var arr = [];
        for(var j = 0; j < adresses.length; j++){
            if(i == j)
            arr[j] = 0;
            else if (i > j)
            arr[j] = distArray[j][i];
            else{
                var dir = await direction(adresses[i],adresses[j]);
                console.log(dir);
                var dist = dir.distance.text.split(' ');
                arr[j] = parseFloat(dist[0]);
            }
        }
        distArray.push(arr)
    }
    console.log(adresses);
    console.log(distArray);
    var sequence = sortAdresses(distArray);
    var seqAdresses = [];
    sequence.forEach(a => {
        seqAdresses.push(adresses[a]);
    });
    console.log(seqAdresses);
    var urlAdress = [];
    seqAdresses.forEach(add => {
        urlAdress.push(urlEscaped(add));
    })
    console.log(urlAdress);
    setGoogleMaps(urlAdress);
}

//calculate distance
const direction = (a,b) => {
    return new Promise((resolve,reject) => {
        let directionsService = new google.maps.DirectionsService();
        var directionsRenderer = new google.maps.DirectionsRenderer();
        const route = {
            origin: a,
            destination: b,
            travelMode: 'DRIVING'
        };
        directionsService.route(route,
            function(response, status) { // anonymous function to capture directions
            if (status !== 'OK')
                reject('Directions request failed due to ' + status);
            else
                resolve(response.routes[0].legs[0]); // Get data about the mapped route
        });
    });
};

//reduce to find shortest path
function sortAdresses(distArray){
    var sequence = [0];
    for(var i = 0; i < distArray.length - 1; i++){
        var dummy = distArray[sequence[i]].slice();
        var b = sequence.slice();
        b.sort(function(a,b) {return b-a});
        b.forEach(a => {
            dummy.splice(a,1);
        })
        dummy.sort(function(a,b) {return a-b});
        sequence.push(distArray[sequence[i]].indexOf(dummy[0]));
    }
    return sequence;
}

function urlEscaped(address){
    var x = address.replace(",","%2C");
    var y = x.split(' ').join('+');
    console.log(y);
    return y;
}

function setGoogleMaps(adress){
    var mapsUrl = 'https://www.google.com/maps/dir/?api=1&origin=' + adress[0] + '&destination=' + adress[adress.length -1] + '&travelmode=driving&waypoints=';
    for(var i = 1; i < adress.length - 1; i++){
        mapsUrl += adress[i];
        mapsUrl += '%7C';
    }
    window.location = mapsUrl;
}