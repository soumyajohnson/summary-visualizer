import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
    LockClosedIcon, 
    PlayCircleIcon, 
    StopCircleIcon,
    DocumentTextIcon, 
    QuestionMarkCircleIcon, 
    CircleStackIcon, 
    ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';

const getNodeConfig = (kind: string) => {
    switch (kind) {
        case 'start':
            return {
                bg: 'bg-[#B8E6C1]',
                border: 'border-[#6BAF7A]',
                text: 'text-[#2D5A3A]',
                Icon: PlayCircleIcon,
            };
        case 'end':
            return {
                bg: 'bg-[#D4D0DC]',
                border: 'border-[#9B96AC]',
                text: 'text-[#4A465A]',
                Icon: StopCircleIcon,
            };
        case 'process':
            return {
                bg: 'bg-[#F5D0DA]',
                border: 'border-[#C48898]',
                text: 'text-[#5C3040]',
                Icon: DocumentTextIcon,
            };
        case 'decision':
            return {
                bg: 'bg-[#E0D0F0]',
                border: 'border-[#9878C0]',
                text: 'text-[#4A3060]',
                Icon: QuestionMarkCircleIcon,
            };
        case 'data':
            return {
                bg: 'bg-[#D0E0F5]',
                border: 'border-[#88A8C4]',
                text: 'text-[#30405C]',
                Icon: CircleStackIcon,
            };
        case 'note':
            return {
                bg: 'bg-[#F5F0D0]',
                border: 'border-[#C4B888]',
                text: 'text-[#5C5030]',
                Icon: ChatBubbleLeftRightIcon,
            };
        default:
            return {
                bg: 'bg-[#F5D0DA]',
                border: 'border-[#C48898]',
                text: 'text-[#5C3040]',
                Icon: DocumentTextIcon,
            };
    }
};

const CustomNode = memo(({ data }: NodeProps<{ label: string; locked: boolean; kind: string }>) => {
    const { bg, border, text, Icon } = getNodeConfig(data.kind);
    
    return (
        <div className={`
            relative group w-full h-full p-4 rounded-[24px] shadow-soft
            border-2 flex items-center justify-center space-x-2
            transition-all duration-200 hover:scale-[1.02]
            font-caveat text-lg
            ${bg} ${border} ${text}
            ${data.locked ? 'ring-4 ring-[#C8A2C8] ring-offset-2' : ''}
        `}>
            <Handle type="target" position={Position.Top} className="opacity-0" />
            <Handle type="source" position={Position.Bottom} className="opacity-0" />
            <Handle type="source" position={Position.Left} className="opacity-0" />
            <Handle type="source" position={Position.Right} className="opacity-0" />

            <div className="shrink-0">
                <Icon className={`w-6 h-6 ${text}`} strokeWidth={2} />
            </div>
            
            <div className="leading-tight">
                {data.label}
            </div>

            {data.locked && (
                <div className="absolute top-2 right-2 bg-white/50 backdrop-blur-sm rounded-full p-1">
                    <LockClosedIcon className="w-3 h-3 text-[#7C5C8A]" />
                </div>
            )}
        </div>
    );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;