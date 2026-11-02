import {useEffect,useRef,useState} from 'react';
import './customer.css';
import EndOfDemoScreen from './EndOfDemoScreen';
import HomeScreen from './HomeScreen';
import InterestsScreen from './InterestsScreen';
import ProductScreen from './ProductScreen';
import CartScreen from './CartScreen';
import SignUpScreen from './SignUpScreen';
import type {Back,Go,PendingAction,RequestAction,Screen} from './navigation';

type Entry={screen:Screen;productId?:string};

const noticeMs=2000;

export default function CustomerApp(){
 const [history,setHistory]=useState<Entry[]>([{screen:'interests'}]);
 const [signedUp,setSignedUp]=useState(false);
 const [pending,setPending]=useState<PendingAction|null>(null);
 const [notice,setNotice]=useState<string|null>(null);
 const noticeTimer=useRef<number|undefined>(undefined);
 const current=history[history.length-1];
 useEffect(()=>()=>window.clearTimeout(noticeTimer.current),[]);
 const toTop=()=>window.scrollTo({top:0,behavior:'instant'});
 const go:Go=(screen,productId)=>{setHistory(h=>screen==='home'?[{screen:'home'}]:[...h,{screen,productId}]);toTop();};
 const back:Back=()=>{setHistory(h=>h.length>1?h.slice(0,-1):h);toTop();};
 const showAdded=()=>{window.clearTimeout(noticeTimer.current);setNotice('Added to cart');noticeTimer.current=window.setTimeout(()=>setNotice(null),noticeMs);};
 const perform=(action:PendingAction)=>{if(action.type==='add')showAdded();else go('endOfDemo');};
 const requestAction:RequestAction=(type,productId)=>{
  const action={type,productId};
  if(signedUp){perform(action);return;}
  setPending(action);
  go('signup',productId);
 };
 const finishSignUp=()=>{
  setSignedUp(true);
  const action=pending;
  setPending(null);
  back();
  if(action)perform(action);
 };
 const cancelSignUp=()=>{setPending(null);back();};
 return <div className="customer-app">
  {current.screen==='interests'&&<InterestsScreen go={go}/>}
  {current.screen==='home'&&<HomeScreen go={go}/>}
  {current.screen==='endOfDemo'&&<EndOfDemoScreen go={go}/>}
  {current.screen==='product'&&current.productId&&<ProductScreen key={current.productId} productId={current.productId} go={go} back={back} requestAction={requestAction} notice={notice}/>}
  {current.screen==='cart'&&<CartScreen go={go}/>}
  {current.screen==='signup'&&<SignUpScreen back={cancelSignUp} onSignUp={finishSignUp}/>}
 </div>;
}
