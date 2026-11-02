import {sproutAssets} from './sproutAssets';
import {publishAssets} from './publishAssets';
export default function Sprout({size='small'}:{size?:'tiny'|'small'|'heading'|'celebration'}){return <img className="sprout-icon" alt="" src={size==='celebration'?publishAssets['1143:2690_imgSprout']:sproutAssets[size==='tiny'?'1309:3082_imgSprout':size==='heading'?'1116:1345_imgSprout':'1309:3082_imgSizeSLookCenter']}/>;}
