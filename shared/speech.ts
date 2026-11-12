// Stopping speech recognition can throw on iPhone Safari (for example after it has already
// ended), which left the recording sheet stuck open. Screens hide the sheet first, then end
// the recognition through this so an error never blocks closing.
export function endSpeech(recognition:{stop:()=>void;abort:()=>void}|null|undefined,how:'stop'|'abort'='abort'){
 if(!recognition)return;
 try{recognition[how]();}catch{/* already ended */}
}

// Keep recognition failures in the recording sheet so users can retry or keep their words.
export function speechErrorMessage(error:string){
 switch(error){
  case 'no-speech': return 'No speech was heard. Tap Record again and try speaking closer to your microphone.';
  case 'not-allowed': case 'service-not-allowed': return 'Microphone or speech access was not allowed. Check your browser permissions, then try again.';
  case 'audio-capture': return 'Your microphone is unavailable. Check that it is connected and not in use, then try again.';
  case 'network': return 'Speech recognition could not connect. Check your connection and try again.';
  case 'unsupported': return 'Voice input is unavailable in this browser. Close this drawer to type instead.';
  default: return 'Recording stopped. You can try again or use any words already captured.';
 }
}
