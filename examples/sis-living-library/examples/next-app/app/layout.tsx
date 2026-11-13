import type {ReactNode} from 'react';
import './globals.css';
export const metadata={title:'Your AI product / Starlight launch example',description:'An independent Next.js consumer of the Living Design package.'};
export default function Layout({children}:{children:ReactNode}){return <html lang="en" data-theme="daylight"><body>{children}</body></html>}
