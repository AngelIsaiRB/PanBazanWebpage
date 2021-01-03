import gsap from 'gsap';
import { App } from './App';
import Observer, { EVENTS } from './Observer';

const app = new App(document.querySelector('#game-container'));
let timeout
window.addEventListener('resize', () => {
	app.onResize();
});

document.onmousemove = (e)=>{
	
	Observer.emit(EVENTS.MOVE_MOUSE,e.clientX, e.clientY);
	clearTimeout(timeout);
	timeout = setTimeout(function(){
	  }, 300);
  }

let phrases = ["Roscas", "Mantequilla", "¡El mejor!", "Conchas", "Cazuela", "Dulce", "Repostería", "😍🥐🍞"]
let demo = document.querySelector(".demo")
let animation = gsap.timeline({repeat:5, repeatDelay:1})

function createLayers(){
	phrases.forEach(value => {
		let layer = document.createElement("div")
		layer.innerHTML = value
		demo.appendChild(layer)
	})
}

function animateText() {
	let layers = document.querySelectorAll(".demo div")
	layers.forEach(function(element, index){
		animation.fromTo(element, {opacity:0, scale:0}, {scale:1, opacity:1, repeat:1, yoyo:true, yoyoEase:true, repeatDelay:1})
	})
	gsap.set(".demo", {visibility:"visible"}) 
}

createLayers()
animateText()
