import Svg, { Path, Line, Polyline, Circle, Rect, G } from 'react-native-svg'

const Icon = ({ size = 22, color = '#fff', stroke = 1.5, children }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={stroke} strokeLinecap="square" strokeLinejoin="miter">
    {children}
  </Svg>
)

export const Play       = ({ size, color }) => <Icon size={size} color={color}><Path fill={color || '#fff'} stroke="none" d="M8 5v14l11-7z" /></Icon>
export const Pause      = ({ size, color }) => <Icon size={size} color={color}><Path fill={color || '#fff'} stroke="none" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></Icon>
export const SkipNext   = ({ size, color }) => <Icon size={size} color={color}><Path fill={color || '#fff'} stroke="none" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></Icon>
export const SkipPrev   = ({ size, color }) => <Icon size={size} color={color}><Path fill={color || '#fff'} stroke="none" d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></Icon>
export const Shuffle    = ({ size, color }) => <Icon size={size} color={color}><Polyline points="16 3 21 3 21 8" /><Line x1="4" y1="20" x2="21" y2="3" /><Polyline points="21 16 21 21 16 21" /><Line x1="15" y1="15" x2="21" y2="21" /><Line x1="4" y1="4" x2="9" y2="9" /></Icon>
export const Repeat     = ({ size, color }) => <Icon size={size} color={color}><Polyline points="17 1 21 5 17 9" /><Path d="M3 11V9a4 4 0 0 1 4-4h14" /><Polyline points="7 23 3 19 7 15" /><Path d="M21 13v2a4 4 0 0 1-4 4H3" /></Icon>
export const Queue      = ({ size, color }) => <Icon size={size} color={color}><Line x1="8" y1="6" x2="21" y2="6" /><Line x1="8" y1="12" x2="21" y2="12" /><Line x1="8" y1="18" x2="21" y2="18" /><Line x1="3" y1="6" x2="3.01" y2="6" /><Line x1="3" y1="12" x2="3.01" y2="12" /><Line x1="3" y1="18" x2="3.01" y2="18" /></Icon>
export const ChevronDown  = ({ size, color }) => <Icon size={size} color={color}><Polyline points="6 9 12 15 18 9" /></Icon>
export const ChevronUp    = ({ size, color }) => <Icon size={size} color={color}><Polyline points="18 15 12 9 6 15" /></Icon>
export const ChevronLeft  = ({ size, color }) => <Icon size={size} color={color}><Polyline points="15 18 9 12 15 6" /></Icon>
export const ChevronRight = ({ size, color }) => <Icon size={size} color={color}><Polyline points="9 18 15 12 9 6" /></Icon>
export const X            = ({ size, color }) => <Icon size={size} color={color}><Line x1="18" y1="6" x2="6" y2="18" /><Line x1="6" y1="6" x2="18" y2="18" /></Icon>
export const Plus         = ({ size, color }) => <Icon size={size} color={color}><Line x1="12" y1="5" x2="12" y2="19" /><Line x1="5" y1="12" x2="19" y2="12" /></Icon>
export const Music        = ({ size, color }) => <Icon size={size} color={color}><Path d="M9 18V5l12-2v13" /><Circle cx="6" cy="18" r="3" /><Circle cx="18" cy="16" r="3" /></Icon>
export const User         = ({ size, color }) => <Icon size={size} color={color}><Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><Circle cx="12" cy="7" r="4" /></Icon>
export const Search       = ({ size, color }) => <Icon size={size} color={color}><Circle cx="11" cy="11" r="8" /><Line x1="21" y1="21" x2="16.65" y2="16.65" /></Icon>
export const Home         = ({ size, color }) => <Icon size={size} color={color}><Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><Polyline points="9 22 9 12 15 12 15 22" /></Icon>
export const Library      = ({ size, color }) => <Icon size={size} color={color}><Path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></Icon>
export const Edit         = ({ size, color }) => <Icon size={size} color={color}><Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></Icon>
export const Trash        = ({ size, color }) => <Icon size={size} color={color}><Polyline points="3 6 5 6 21 6" /><Path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><Path d="M10 11v6" /><Path d="M14 11v6" /></Icon>
export const Settings     = ({ size, color }) => <Icon size={size} color={color}><Circle cx="12" cy="12" r="3" /><Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></Icon>
export const Dots         = ({ size, color }) => <Icon size={size} color={color}><Circle cx="12" cy="5" r="1" fill={color || '#fff'} stroke="none" /><Circle cx="12" cy="12" r="1" fill={color || '#fff'} stroke="none" /><Circle cx="12" cy="19" r="1" fill={color || '#fff'} stroke="none" /></Icon>
export const Timer        = ({ size, color }) => <Icon size={size} color={color}><Circle cx="12" cy="12" r="10" /><Polyline points="12 6 12 12 16 14" /></Icon>
export const AddList      = ({ size, color }) => <Icon size={size} color={color}><Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><Polyline points="14 2 14 8 20 8" /><Line x1="12" y1="18" x2="12" y2="12" /><Line x1="9" y1="15" x2="15" y2="15" /></Icon>