'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

class Workout 
{
  date = new Date();
  id = String(Date.now()).slice(-10);
  
  constructor(coords, distance, duration) 
  {
    this.coords = coords; // latitude, longitude
    this.distance = distance; // km
    this.duration = duration; // min
  }
}

class Running extends Workout 
{

  type = "running";

  constructor(coords, distance, duration, cadence) 
  {
    super(coords, distance, duration);
    this.cadence = cadence; 
    this.calcPace();  
  }

  calcPace () 
  {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout 
{
  type = "cycling";

  constructor(coords, distance, duration, elevationGain) 
  {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed () 
  {
    this.speed = this.distance / this.duration;
  }
}

////////////////////////////////////////////////////
//            APLICATION ARCHITETURE             //
//////////////////////////////////////////////////

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App 
{
  #map;
  #mapEvent;
  #workouts = [];
  constructor() 
  {
    
    this._getPosition();
    form.addEventListener("submit", this._newWorkout.bind(this));
    inputType.addEventListener("change", this._toggleElevationField);
  }

  _getPosition() 
  {
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function() {
        alert("Could not get your position!")
      });
    };
  }

  _loadMap(position) 
  {
    const {latitude} = position.coords;
    const {longitude} = position.coords;

    const coords = [latitude, longitude]

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapE) 
  {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();  
  }

  _toggleElevationField() 
  {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(event)
  {
    const validInputs = function(...inputs)
    {
      return inputs.every((element) => 
      {
        return Number.isFinite(element);
      }); 
    }

    const allPositive = function(...inputs) 
    {
      return inputs.every((element) => 
      {
        return element > 0; 
      })
    }

    event.preventDefault();
    
    // Get data form form
    const type = inputType.value; 
    const distance = Number(inputDistance.value);
    const duration = Number(inputDuration.value);
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // If workout running, create running object 
    if (type === "running") 
    {
      const cadence = Number(inputCadence.value);

      // Check if data is valid

      console.log(validInputs(distance, duration, cadence), allPositive(distance, duration, cadence));

      if (
        !validInputs(distance, duration, cadence) || 
        !allPositive(distance, duration, cadence)
        )
      {
        return alert("Inputs have to be positive numbers")
      }

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout cycling, create cycling object 
    if (type === "cycling") 
    {
      const elevation = Number(inputElevation.value);

      // Check if data is valid
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
      {
        return alert("Inputs have to be positive numbers");
      }
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new object to workout array
    this.#workouts.push(workout);

    // Render workout on map as marker
    this.renderWorkoutMarker(workout);

    // Render workout on list

    // Hide form and clear input fields
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = "";
  }

  renderWorkoutMarker(workout) 
  {
    L.marker(workout.coords)
    .addTo(this.#map)
    .bindPopup(
      L.popup(
      {
        maxWidth: 250,
        minWidth: 100, 
        autoClose: false,
        closeOnClick: false,
        className: `${workout.type}-popup`,
      })
    )
    .setPopupContent("workout")
    .openPopup();
  }
}

const app = new App();











