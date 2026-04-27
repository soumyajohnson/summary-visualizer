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

// This helper function ensures Tailwind's JIT compiler sees the full class names.
const getNodeConfig = (kind: string) => {
    switch (kind) {
        case 'start':
            return {
                gradient: 'bg-gradient-to-br from-[#bff9b9] to-[#20e809]',
                Icon: PlayCircleIcon,
            };
        case 'end':
            return {
                gradient: 'bg-gradient-to-br from-gray-400 to-slate-500',
                Icon: StopCircleIcon,
            };
        case 'process':
            return {
                gradient: 'bg-gradient-to-br from-[##FF4D8D] to-[#FF2D75]',
                Icon: DocumentTextIcon,
            };
        case 'decision':
            return {
                gradient: 'bg-gradient-to-br from-[#7C5CFF] to-[#5B3FFF]',
                Icon: QuestionMarkCircleIcon,
            };
        case 'data':
            return {
                gradient: 'bg-gradient-to-br from-sky-400 to-cyan-500',
                Icon: CircleStackIcon,
            };
        case 'note':
            return {
                gradient: 'bg-gradient-to-br from-fuchsia-400 to-pink-500',
                Icon: ChatBubbleLeftRightIcon,
            };
        default:
            return {
                gradient: 'bg-gradient-to-br from-indigo-400 to-blue-500',
                Icon: DocumentTextIcon,
            };
    }
};

const CustomNode = memo(({ data }: NodeProps<{ label: string; locked: boolean; kind: string }>) => {
    const { gradient, Icon } = getNodeConfig(data.kind);
    
    return (
        <div className={`
            relative group w-full h-full p-4 rounded-[28px] shadow-soft
            border border-white/20
            text-white flex items-center justify-center space-x-1
            transition-all duration-200 hover:shadow-lifted hover:scale-[1.02]
            ${gradient}
            ${data.locked ? 'ring-4 ring-offset-2 ring-sky-400' : ''}
        `}>
            <Handle type="target" position={Position.Top} className="opacity-0" />
            <Handle type="source" position={Position.Bottom} className="opacity-0" />
            <Handle type="source" position={Position.Left} className="opacity-0" />
            <Handle type="source" position={Position.Right} className="opacity-0" />

            <div className="shrink-0">
                <Icon className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            
            <div className="text-base tracking-wide">
                {data.label}
            </div>

            {data.locked && (
                <div className="absolute top-3 right-3 bg-white/30 backdrop-blur-sm rounded-full p-1">
                    <LockClosedIcon className="w-4 h-4 text-white" />
                </div>
            )}
        </div>
    );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;