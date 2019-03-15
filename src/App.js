import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import SignIn from './components/SignIn/SignIn'
import Register from './components/Register/Register'
import './App.css';

const particlesOptions = {
  "particles": {
    "number": {
      "value": 152,
      "density": {
        "enable": true,
        "value_area": 710.2328774690454
      }
    },
    "color": {
      "value": "#ffffff"
    },
    "shape": {
      "type": "circle",
      "stroke": {
        "width": 3,
        "color": "#000000"
      },
      "polygon": {
        "nb_sides": 3
      },
      "image": {
        "src": "img/github.svg",
        "width": 100,
        "height": 100
      }
    },
    "opacity": {
      "value": 0.5,
      "random": false,
      "anim": {
        "enable": false,
        "speed": 1,
        "opacity_min": 0.1,
        "sync": false
      }
    },
    "size": {
      "value": 2,
      "random": true,
      "anim": {
        "enable": false,
        "speed": 248.4956269642116,
        "size_min": 67.40240862101165,
        "sync": false
      }
    },
    "line_linked": {
      "enable": true,
      "distance": 150,
      "color": "#ffffff",
      "opacity": 0.4,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 6,
      "direction": "top-left",
      "random": false,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": false,
        "rotateX": 600,
        "rotateY": 1200
      }
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": true,
        "mode": "bubble"
      },
      "onclick": {
        "enable": true,
        "mode": "repulse"
      },
      "resize": true
    },
    "modes": {
      "grab": {
        "distance": 109.63042366068159,
        "line_linked": {
          "opacity": 1
        }
      },
      "bubble": {
        "distance": 194.89853095232286,
        "size": 12.181158184520177,
        "duration": 0.6496617698410762,
        "opacity": 0.40603860615067255,
        "speed": 3
      },
      "repulse": {
        "distance": 200,
        "duration": 0.4
      },
      "push": {
        "particles_nb": 4
      },
      "remove": {
        "particles_nb": 2
      }
    }
  },
  "retina_detect": true
}

const initialState = {
  input: '',
  imageUrl: '',
  box : {},
  route: 'SignIn',
  isSignedIn: false,
  user: {
    id:'',
    name:'',
    email:'',
    entries:0,
    join_date: ''
  }
}

class App extends Component {
  constructor(){
    super();
    this.state = initialState
  }

  loadUser = (data) =>{
    this.setState({user:{
      id:data.id,
      name:data.name,
      email:data.email,
      entries:data.entries,
      join_date: data.join_date
    }})
  }

  calculateFaceLocation = (data) =>{
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage')
    const width = Number(image.width);
    const height = Number(image.height);
    return{
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      botRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({box: box});
  }

onInputChange = (event) =>{
  this.setState({input: event.target.value});
}

onButtonSubmit = () =>{
  this.setState({imageUrl: this.state.input});
  fetch('https://pure-harbor-23161.herokuapp.com/imageUrl',{
    method : 'post',
    headers : {'Content-Type' : 'application/json'},
    body : JSON.stringify({
      input : this.state.input
    })
  })
  .then(response => response.json())
  .then(response => {
    if(response){
      fetch('https://pure-harbor-23161.herokuapp.com/image',{
        method : 'put',
        headers : {'Content-Type' : 'application/json'},
        body : JSON.stringify({
          id : this.state.user.id
        })
      })
      .then(response => response.json())
      .then(count =>{
        this.setState(Object.assign(this.state.user,{entries : count}))
      })
      .catch(console.log)
    }
    this.displayFaceBox(this.calculateFaceLocation(response))
  })
  .catch(err => console.log(err))
}

onRouteChange = (route) => {
  if(route === 'SignOut'){
    this.setState(initialState)
  }else if(route === 'Home'){
    this.setState({isSignedIn:true})
  }
  this.setState({route: route})
}

  render() {
    return (
      <div className="App">
        <Particles className='particles' params={particlesOptions}/>
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
        {this.state.route === 'Home'
          ?
            <div>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries} />
            <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
            <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
            </div>
          : (
            this.state.route === 'SignIn'
            ?<SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            :<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          )
        }
      </div>
    );
  }
}

export default App;
