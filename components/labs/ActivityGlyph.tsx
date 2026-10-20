import { Moon, Sunrise, BookOpen, PencilLine, School, Footprints, Dumbbell, Apple, Utensils, Coffee, Zap, Library, Smartphone, Gamepad2, MessagesSquare, BriefcaseBusiness, Music2, CloudMoon, Headphones, Car, Guitar, Siren, type LucideIcon } from "lucide-react";
const ICONS: Record<string, LucideIcon> = {sleep:Moon,breakfast:Sunrise,homework:BookOpen,test:PencilLine,class:School,sports:Footprints,gym:Dumbbell,walk:Footprints,lunch:Apple,dinner:Utensils,coffee:Coffee,energy:Zap,study:Library,phone:Smartphone,gaming:Gamepad2,friends:MessagesSquare,work:BriefcaseBusiness,music:Music2,nap:CloudMoon,longnap:CloudMoon,winddown:Moon,talk:MessagesSquare,traffic:Car,earbuds:Headphones,concert:Guitar,siren:Siren};
export default function ActivityGlyph({kind, compact=false}:{kind:string;compact?:boolean}) {
  const Icon=ICONS[kind] ?? BookOpen;
  const tone=["sleep","nap","longnap","winddown"].includes(kind)?"night":["coffee","energy","lunch","dinner","breakfast"].includes(kind)?"fuel":["sports","gym","walk"].includes(kind)?"move":"mind";
  return <span className={`activity-glyph tone-${tone} ${compact?"is-compact":""}`} aria-hidden="true"><Icon strokeWidth={1.5}/></span>;
}
