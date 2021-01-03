import { App } from './App';
import Observer, { EVENTS } from './Observer';

const app = new App(document.querySelector('#game-container'));
let timeout
window.addEventListener('resize', () => {
	app.onResize();
});

document.onmousemove = (e)=>{
	console.log(e.clientX, e.clientY)
	Observer.emit(EVENTS.MOVE_MOUSE,e.clientX, e.clientY);
	clearTimeout(timeout);
	timeout = setTimeout(function(){
	  }, 300);


  }
