const sizes:Record<string,number>={'lucide-leaf':22,'lucide-leaf1':20,'lucide-pkg':24,'lucide-plus':20,'lucide-chevron-down':12,'lucide-icon':16,'lucide-icon1':16,'lucide-sparkles':16,'lucide-sparkles1':10,'lucide-sparkles2':18,'lucide-map-pin':14,'lucide-users':14,'lucide-arrow-right':16,'lucide-arrow-right1':16,'lucide-list-checks':10,'lucide-palette':16,'lucide-house':21,'lucide-package':21,'lucide-shopping-bag':21,'lucide-user-round':21,star:10,star1:11,star2:11,dot:6,dot1:6,dot2:6,ellipse:7,ellipse1:7,ellipse2:7};
export const dashboardAsset=(name:string)=>`${import.meta.env.BASE_URL}images/dashboard/${name}`;
export default function DashboardIcon({name,size}:{name:string;size?:number}){
 const native=sizes[name]||22;const display=size||native;
 return <span className="dashboard-icon" style={{width:display,height:display}} aria-hidden="true"><img alt="" src={dashboardAsset(`${name}.svg`)} width={native} height={native} style={display!==native?{transform:`scale(${display/native})`,transformOrigin:'top left'}:undefined}/></span>;
}
