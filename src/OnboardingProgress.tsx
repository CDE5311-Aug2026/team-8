import {Check} from 'lucide-react';

export default function OnboardingProgress({step,includeAccount=true}:{step:number;includeAccount?:boolean}){
 const steps=includeAccount?['Basics','Your story','Photos','Account']:['Basics','Your story','Photos'];
 return <section className="profile-stepper" aria-label="Setup progress">
  <div className="row"><strong>{includeAccount?'Create your account':'Set up your farm'}</strong><span>Step {step+1} of {steps.length}</span></div>
  <div className="profile-stepper-track" role="progressbar" aria-label={includeAccount?'Account setup':'Farm setup'} aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={step+1} aria-valuetext={`Step ${step+1} of ${steps.length}: ${steps[step]}${step>0?' (optional)':''}`}><span style={{width:`${(step+1)/steps.length*100}%`}}/></div>
  <ol>{steps.map((label,index)=><li key={label} className={index<=step?'reached':''} aria-current={index===step?'step':undefined}><span>{index<step?<Check size={12}/>:index+1}</span><small>{label}</small>{index>0&&<small className="step-optional">Optional</small>}</li>)}</ol>
 </section>;
}
