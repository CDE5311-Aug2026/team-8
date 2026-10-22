type IconProps={size?:number;className?:string};

const base=(size:number,className?:string)=>({width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.6,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,className,'aria-hidden':true});

export const LocationIcon=({size=16,className}:IconProps)=><svg {...base(size,className)}><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>;
export const SearchIcon=({size=20,className}:IconProps)=><svg {...base(size,className)}><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>;
export const ChatIcon=({size=22,className}:IconProps)=><svg {...base(size,className)}><path d="M4 5.5h16v11H10l-4.5 3.5v-3.5H4Z"/></svg>;
export const CartIcon=({size=25,className}:IconProps)=><svg {...base(size,className)}><path d="M3 4h2.5l2 11h10.5l2-8H7"/><circle cx="9" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/></svg>;
export const SparkleIcon=({size=24,className}:IconProps)=><svg {...base(size,className)}><path d="M10 4c.6 4 2 5.4 6 6-4 .6-5.4 2-6 6-.6-4-2-5.4-6-6 4-.6 5.4-2 6-6Z"/><path d="M18 14c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1 3-3Z"/></svg>;
export const SendIcon=({size=20,className}:IconProps)=><svg {...base(size,className)}><path d="M21 3 10 14"/><path d="m21 3-7 18-4-7-7-4Z"/></svg>;
export const HomeIcon=({size=24,className}:IconProps)=><svg {...base(size,className)}><path d="M4 11 12 4l8 7v9H4Z"/><path d="M10 20v-6h4v6"/></svg>;
export const HeartIcon=({size=24,className,filled=false}:IconProps&{filled?:boolean})=><svg {...base(size,className)} fill={filled?'currentColor':'none'}><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z"/></svg>;
export const BagIcon=({size=24,className}:IconProps)=><svg {...base(size,className)}><path d="M5 8h14l-1 12H6Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>;
export const UserIcon=({size=24,className}:IconProps)=><svg {...base(size,className)}><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c.8-4 3.6-5.8 7.5-5.8s6.7 1.8 7.5 5.8"/></svg>;
export const FlagIcon=({size=48,className}:IconProps)=><svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden><path d="M6 3.5h1.8v17H6z"/><path d="M8.5 4.5 19 9l-10.5 4.5z"/></svg>;
export const ArrowLeftIcon=({size=24,className}:IconProps)=><svg {...base(size,className)}><path d="M19 12H5"/><path d="m11 6-6 6 6 6"/></svg>;
export const ChevronRightIcon=({size=12,className}:IconProps)=><svg {...base(size,className)} strokeWidth={2.2}><path d="m9 5 7 7-7 7"/></svg>;
export const ShareIcon=({size=30,className}:IconProps)=><svg {...base(size,className)}><path d="M12 15V4"/><path d="m8 8 4-4 4 4"/><path d="M6 11H5v9h14v-9h-1"/></svg>;
export const MailIcon=({size=19,className}:IconProps)=><svg {...base(size,className)}><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m4 7.5 8 6 8-6"/></svg>;
export const LockIcon=({size=18,className}:IconProps)=><svg {...base(size,className)}><rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>;
export const EyeIcon=({size=16,className}:IconProps)=><svg {...base(size,className)}><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>;
export const EyeOffIcon=({size=16,className}:IconProps)=><svg {...base(size,className)}><path d="M3 3l18 18"/><path d="M10.6 6a10 10 0 0 1 1.4-.1c6.4 0 10 6.1 10 6.1a17 17 0 0 1-3.2 3.9M6.4 7.4A17 17 0 0 0 2 12s3.6 6.5 10 6.5c1.5 0 2.8-.3 4-.8"/></svg>;
export const GoogleIcon=({size=24,className}:IconProps)=><svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden><path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8Z"/><path fill="#34A853" d="M12 23c3 0 5.4-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1-3.7 1-2.8 0-5.2-1.9-6-4.5H2.4v2.800A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M6 14.100a6.600 6.600 0 0 1 0-4.200V7.100H2.400a11 11 0 0 0 0 9.800L6 14.100Z"/><path fill="#EA4335" d="M12 5.400c1.600 0 3 .6 4.200 1.600l3.100-3.100A11 11 0 0 0 2.400 7.100L6 9.900c.8-2.600 3.200-4.500 6-4.500Z"/></svg>;
export const AppleIcon=({size=24,className}:IconProps)=><svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden><path d="M16.4 12.700c0-2.400 2-3.500 2.100-3.600-1.100-1.700-2.900-1.900-3.500-1.900-1.500-.2-2.900.9-3.700.9-.8 0-1.900-.9-3.200-.8-1.600 0-3.100 1-3.900 2.400-1.700 2.900-.4 7.200 1.200 9.600.8 1.200 1.800 2.500 3 2.400 1.200 0 1.700-.8 3.100-.8 1.500 0 1.900.8 3.200.8 1.300 0 2.100-1.200 2.900-2.300.9-1.300 1.300-2.600 1.300-2.700 0 0-2.500-1-2.500-4.100ZM14 5.600c.7-.8 1.100-1.900 1-3-1 0-2.100.7-2.800 1.500-.6.700-1.100 1.800-1 2.900 1.100.1 2.100-.6 2.800-1.400Z"/></svg>;
export const CheckIcon=({size=16,className}:IconProps)=><svg {...base(size,className)} strokeWidth={2.4}><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>;
export const MinusIcon=({size=16,className}:IconProps)=><svg {...base(size,className)} strokeWidth={2}><path d="M5 12h14"/></svg>;
export const PlusIcon=({size=16,className}:IconProps)=><svg {...base(size,className)} strokeWidth={2}><path d="M12 5v14M5 12h14"/></svg>;
