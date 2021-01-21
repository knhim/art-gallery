//global variables
const imageDiv = document.querySelector('.image-container');
const imageElement = document.querySelector('.image');
const divLeftColumn = document.querySelector('.left-column');
const nextImageButton = document.querySelector('.next-image');
const previousImageButton = document.querySelector('.previous-image');

//global variables for Info side column
const divInfoColumn = document.querySelector('.info-column');
const artTitleElement = document.querySelector('.art-title');
const classificationElement = document.querySelector('.classification');
const dateElement = document.querySelector('.date');
const workTypesElement = document.querySelector('.work-types');
const creationPlaceElement = document.querySelector('.creation-place');
const mediumElement = document.querySelector('.medium');
const dimensionsElement = document.querySelector('.dimensions');
const mapId = document.getElementById('map');

let imageNumber = 0;
let descriptionNumber = 0;



//global variables for google api

let geocoder = null;
let newLocation = creationPlaceElement;
let service = null;
let map = null;

//array to store images
const artCollection = [];
const fullObjectArray = [];

//array to store each type of descriptions
const titleDescriptions = [];
const classificationDescriptions = [];
const dateDescriptions = [];
const workTypesDescriptions = [];
const creationPlaceDescriptions = [];
const mediumDescriptions = [];
const dimensionsDescriptions = [];


// ajax call to grab art from harvard art museums
$.ajax({
  url: "https://api.harvardartmuseums.org/object/",
  method: "GET",
  data: {
    apikey: "d29e23e0-b43f-11ea-8f0d-21177cb1a6f5",
    hasimage: 1,
    size: "25",
    copyright: "null",
    classification: "any",
    century: "any",
    medium: "any",
    sort: "random",
    place: "any",
  },
  success: data => {
    addDescription(data);
    addImage(data);
    getFullObject(data);
  },
  error: error => {
    console.log(error);
  }
})

//ajax function to get specific object id, and then the creation place
function getFullObject(data) {
  for (let i = 0; i < data['records']['length']; i++) {
    let objectId = data['records'][i]['objectid'];
    $.ajax({
      url: "https://api.harvardartmuseums.org/object/" + objectId,
      method: "GET",
      data: {
        apikey: "d29e23e0-b43f-11ea-8f0d-21177cb1a6f5",
      },
      success: data2 => {
        fullObjectArray.push(data2);
        if (data['records']['length'] - 1 === i) { //start this once all the objects have been pushed to fullObjectArray
          for (let j = 0; j < data['records']['length']; j++) {
            let getCreation = null;
            if (!fullObjectArray[j]) {
              getCreation = '';
            } else {
              getCreation = fullObjectArray[j]['places'][0]['displayname'];
            }
            creationPlaceDescriptions.push(getCreation);
            creationPlaceElement.textContent = 'Creation Place: ' + creationPlaceDescriptions[descriptionNumber];
            divInfoColumn.append(creationPlaceElement);
          }
          convertToAddress(creationPlaceDescriptions[0])
        }
      },
      error: error2 => {
        console.log(error2);
      }
    })
  }
}

//load art images
function addImage(data) {
  for (let i = 0; i < data['records']['length']; i++) {
    if (data['records'][i]['images'].length === 0) {
      imagePath = 'image-not-found.png'
      artCollection.push(imagePath);
    } else {
      let imagePath = data['records'][i]['images'][0]['baseimageurl']
      artCollection.push(imagePath);
    }
  }
  imageElement.src = artCollection[imageNumber]  // to set initial first image
}

//add art descriptions
function addDescription(data) {
  for (let i = 0; i < data['records']['length']; i++) {
    const getTitle = data['records'][i]['title']
    const getClassification = data['records'][i]['classification'];
    const getDate = data['records'][i]['dated'];
    const getWorkTypes = data['records'][i]['worktypes'][0]['worktype'];
    const getMedium = data['records'][i]['medium'];
    const getDimensions = data['records'][i]['dimensions'];

    titleDescriptions.push(getTitle);
    classificationDescriptions.push(getClassification);
    dateDescriptions.push(getDate);
    workTypesDescriptions.push(getWorkTypes);
    mediumDescriptions.push(getMedium);
    dimensionsDescriptions.push(getDimensions);
  }
  // append first descriptions at index 0
  artTitleElement.textContent = 'Title: ' + titleDescriptions[descriptionNumber];
  classificationElement.textContent = 'Classification: ' + classificationDescriptions[descriptionNumber];
  dateElement.textContent = 'Dated: ' + dateDescriptions[descriptionNumber];
  workTypesElement.textContent = 'Work Types: ' + workTypesDescriptions[descriptionNumber];
  mediumElement.textContent = 'Medium: ' + mediumDescriptions[descriptionNumber];
  dimensionsElement.textContent = 'Dimensions: ' + dimensionsDescriptions[descriptionNumber]

  divInfoColumn.append(artTitleElement, classificationElement, dateElement, workTypesElement, mediumElement, dimensionsElement);
}

//function nextImage will move to next image
function nextImage() {
  imageNumber++;
  if (imageNumber === artCollection.length) {
    imageNumber = 0;
  }
  imageElement.src = artCollection[imageNumber];
  updateDescriptions();
}

//function previous Image will go back one image
function previousImage() {
  imageNumber--;
  if (imageNumber < 0 ) {
    imageNumber = 24;
  };
  imageElement.src = artCollection[imageNumber];
  updateDescriptions();
}

//function updateDescriptions - will change the descriptions when user cycles through the images
function updateDescriptions() {
  descriptionNumber = imageNumber;
  artTitleElement.textContent = 'Title: ' + titleDescriptions[descriptionNumber];
  classificationElement.textContent = 'Classification: ' + classificationDescriptions[descriptionNumber];
  dateElement.textContent = 'Date: ' + dateDescriptions[descriptionNumber];
  workTypesElement.textContent = 'Work Types: ' + workTypesDescriptions[descriptionNumber];
  creationPlaceElement.textContent = 'Creation Place: ' + creationPlaceDescriptions[descriptionNumber];
  mediumElement.textContent = 'Medium: ' + mediumDescriptions[descriptionNumber];
  dimensionsElement.textContent = 'Dimensions: ' + dimensionsDescriptions[descriptionNumber]
  divInfoColumn.append(artTitleElement, classificationElement, dateElement, workTypesElement, mediumElement, dimensionsElement, creationPlaceElement);
}


nextImageButton.addEventListener('click', nextImage);
nextImageButton.addEventListener('click', dimScreen);
previousImageButton.addEventListener('click', previousImage);
previousImageButton.addEventListener('click', dimScreen);

function dimScreen() {
  document.querySelector('.loader').style.display = 'block';
  document.querySelector('.dimmer').style.display = 'block';
  setTimeout(undimScreen, 1000);
}

function undimScreen() {
  document.querySelector('.loader').style.display = "none";
  document.querySelector('.dimmer').style.display = 'none';
}



// Google Maps API Start


// created a function named initMap() to create a new map
function initMap() {
  geocoder = new google.maps.Geocoder();
  let latlng = { lat: 100, lng: 50 };
  let mapOptions =
  {
    zoom: 6,
    center: latlng
  }
  map = new google.maps.Map(mapId, mapOptions)

  // add event listeners to buttons to change location of google maps

  nextImageButton.addEventListener('click', () => convertToAddress(creationPlaceDescriptions[imageNumber]));
  previousImageButton.addEventListener('click', () => convertToAddress(creationPlaceDescriptions[imageNumber]));
}



function convertToAddress(address) {
  geocoder.geocode({'address': address}, function (results,status) {
    if (status === google.maps.GeocoderStatus.OK) {
      if (results[0]) {
        map.setCenter(results[0].geometry.location);
        let marker = new google.maps.Marker(
          {
            map: map,
            position: results[0].geometry.location
          });
      } else {
        window.alert('Error' + status);
      }
    }
  })
}

//Google Maps API End
