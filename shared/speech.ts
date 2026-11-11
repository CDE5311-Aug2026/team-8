// Stopping speech recognition can throw on iPhone Safari (for example after it has already
// ended), which left the recording sheet stuck open. Screens hide the sheet first, then end
// the recognition through this so an error never blocks closing.
export function endSpeech(recognition:{stop:()=>void;abort:()=>void}|null|undefined,how:'stop'|'abort'='abort'){
 if(!recognition)return;
 try{recognition[how]();}catch{/* already ended */}
}
