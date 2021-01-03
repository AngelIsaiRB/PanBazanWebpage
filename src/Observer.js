import EventEmitter from "eventemitter3";

export const EVENTS = {
    START: 'START',
    MOVE_MOUSE:"MOVE_MOUSE"
}

const Observer = new EventEmitter();
export default Observer;
