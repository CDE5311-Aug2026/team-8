export function drawerDragIntent(x:number,y:number):'down'|'ignore'|'pending'{if(Math.max(Math.abs(x),Math.abs(y))<8)return 'pending';return y>0&&y>Math.abs(x)*1.2?'down':'ignore';}
export function dismissDrawerDrag(distance:number,elapsed:number,height:number){return distance>=Math.min(140,Math.max(72,height*.24))||distance>=36&&distance/Math.max(elapsed,1)>.65;}
