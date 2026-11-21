import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const record=value=>value!==null&&typeof value==='object'&&!Array.isArray(value)&&Object.getPrototypeOf(value)===Object.prototype;
function keys(value,allowed,required=allowed){
  if(!record(value)||Object.keys(value).some(k=>!allowed.includes(k))||required.some(k=>!Object.hasOwn(value,k)))throw Error('Unexpected or missing contract keys');
}
const propTypes=new Set(['enum','string','boolean','number','number | null','ReactNode','TabItem[]','CommandItem[]','readonly ModelOption[]','readonly Row[]','readonly DataColumn<Row>[]','readonly PortfolioAsset[]','readonly string[]','(pressed: boolean) => void','(value: string) => void','(open: boolean) => void','(decision: ApprovalDecision) => void','(row: Row, index: number) => Key','() => void']);
export function validateContract(contract) {
  keys(contract,['schema','version','package','authority','compatibility','verification','tokenExport','components']);
  if(contract.schema!=='starlight.component_registry.v1'||contract.version!=='0.2.0')throw Error('Unsupported component registry version');
  keys(contract.package,['name','artifact','license','published','peers']);
  if(contract.package.name!=='@starlight/living-design'||contract.package.artifact!=='starlight-living-design-0.2.0.tgz')throw Error('Unexpected owned package or artifact');
  if(contract.package.license!=='UNLICENSED'||contract.package.published!==false)throw Error('Candidate source rights changed');
  keys(contract.package.peers,['react','react-dom']);
  if(Object.values(contract.package.peers).some(v=>v!=='^19.0.0'))throw Error('Unexpected peer compatibility');
  keys(contract.authority,['discovery','filesystem','payment','deployment','execution']);
  if(contract.authority.discovery!=='read-only'||['filesystem','payment','deployment','execution'].some(k=>contract.authority[k]!==false))throw Error('Discovery cannot grant authority');
  keys(contract.compatibility,['react','next','typescript','figma','framer','webflow']);
  if(Object.values(contract.compatibility).some(v=>typeof v!=='string'||!v.trim()))throw Error('Invalid compatibility text');
  keys(contract.verification,['typecheckCommand','renderCommand','status']);
  if(contract.verification.typecheckCommand!=='npm test'||contract.verification.renderCommand!=='npm run test:products'||typeof contract.verification.status!=='string')throw Error('Unexpected verification metadata');
  keys(contract.tokenExport,['path','format','authority']);
  if(contract.tokenExport.path!=='tokens.json'||contract.tokenExport.format!=='DTCG typed JSON'||typeof contract.tokenExport.authority!=='string')throw Error('Unexpected token export');
  if(!Array.isArray(contract.components)||contract.components.length!==19)throw Error('Expected 19 components');
  const names=new Set();
  for(const c of contract.components){
    keys(c,['id','export','source','props','nativeAttributes','constraints','example','install']);
    if(typeof c.id!=='string'||!/^[A-Z][A-Za-z]+$/.test(c.id)||names.has(c.id)||c.export!==c.id)throw Error('Invalid or duplicate export');
    names.add(c.id);
    if(!['src/components.tsx','src/product-components.tsx'].includes(c.source))throw Error('Unapproved source path');
    if(!record(c.props)||!Object.keys(c.props).length||typeof c.nativeAttributes!=='boolean'||!Array.isArray(c.constraints)||!c.constraints.length||c.constraints.some(v=>typeof v!=='string'||!v.trim())||typeof c.example!=='string'||!c.example.trim())throw Error('Missing component contract');
    keys(c.install,['package','styles']);
    if(c.install.package!=='@starlight/living-design'||c.install.styles!=='@starlight/living-design/styles.css')throw Error('Unexpected installation target');
    for(const [name,p] of Object.entries(c.props)){
      if(!/^[A-Za-z][A-Za-z0-9]*$/.test(name)||['constructor','prototype'].includes(name))throw Error('Invalid prop name');
      keys(p,['type','values','default','required'],['type']);
      if(!propTypes.has(p.type)||Object.hasOwn(p,'required')&&typeof p.required!=='boolean')throw Error('Invalid prop type');
      if(p.type==='enum'){
        if(!Array.isArray(p.values)||!p.values.length||p.values.some(v=>typeof v!=='string'||!v.length)||new Set(p.values).size!==p.values.length||Object.hasOwn(p,'default')&&!p.values.includes(p.default))throw Error('Invalid enum values or default');
      }else{
        if(Object.hasOwn(p,'values'))throw Error('Values are only valid for enums');
        if(Object.hasOwn(p,'default')){
          const valid=p.type==='boolean'?typeof p.default==='boolean':p.type==='string'?typeof p.default==='string':p.type==='number'||p.type==='number | null'?typeof p.default==='number'&&Number.isFinite(p.default)||p.type==='number | null'&&p.default===null:false;
          if(!valid)throw Error('Default does not match prop type');
        }
      }
    }
  }
  return contract;
}
export async function buildContract(root){
  const contract=validateContract(JSON.parse(await readFile(path.join(root,'contracts/components.json'),'utf8')));
  const paths=[...new Set(contract.components.map(c=>c.source)),'src/components.css','src/product-components.css','src/tokens.css','tokens/tokens.json'];
  const sourceFiles=await Promise.all(paths.sort().map(async file=>{const bytes=await readFile(path.join(root,file));return{path:file,bytes:bytes.length,sha256:sha256(bytes)}}));
  for(const c of contract.components){const source=await readFile(path.join(root,c.source),'utf8');if(!new RegExp(`export (?:function|const) ${c.export}\\b`).test(source))throw Error(`Missing source export: ${c.export}`);}
  return {...contract,sourceFiles};
}
