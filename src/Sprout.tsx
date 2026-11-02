import {sproutAssets} from './sproutAssets';
export default function Sprout({size='small'}:{size?:'tiny'|'small'|'heading'}){return <img className="sprout-icon" alt="" src={sproutAssets[size==='tiny'?'1309:3082_imgSprout':size==='heading'?'1116:1345_imgSprout':'1309:3082_imgSizeSLookCenter']}/>;}
