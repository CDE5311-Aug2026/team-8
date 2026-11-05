// Customer side v2: the clickable prototype rebuilt from Figma "Customer Side · v2".
// It is a self-contained build in public/customer/ (its own styles), shown here in a
// full-screen frame so it can't affect the farmer side's styles. Open /customer/ directly
// to use it on its own.
export default function CustomerApp(){
 return <iframe
  src="/customer/"
  title="Farmily customer prototype"
  style={{position:'fixed',inset:0,width:'100%',height:'100%',border:0,background:'#e9e9e4'}}
  allow="autoplay"
 />;
}
