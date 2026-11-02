import {Check} from 'lucide-react';
import {optionalStepStatus} from '../shared/onboarding';
import type {FarmerProfile} from '../shared/branding';

export default function OnboardingProgress({step,profile}:{step:number;profile:FarmerProfile}){
 const steps=['Basics','Your story','Photos'];
 return <section className="profile-stepper" aria-label="Farm profile setup">
  <div className="row"><strong>Set up your farm</strong><span>Step {step+1} of 3 · {steps[step]}</span></div>
  <div className="profile-stepper-track" role="progressbar" aria-label="Farm profile setup" aria-valuemin={0} aria-valuemax={3} aria-valuenow={step+1} aria-valuetext={`Step ${step+1} of 3: ${steps[step]}`}><span style={{width:`${(step+1)/3*100}%`}}/></div>
  <ol>{steps.map((label,index)=><li key={label} aria-current={index===step?'step':undefined}>
   {index<step&&optionalStepStatus(profile,index)==='Complete'&&<Check size={14} aria-hidden="true"/>}
   <span>{label}{index<step?` · ${optionalStepStatus(profile,index)}`:''}</span>
  </li>)}</ol>
 </section>;
}
