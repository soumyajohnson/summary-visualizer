'use client';
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/solid';

// Using memo for performance, as custom nodes can re-render often
const CustomNode = memo(({ data, xPos, yPos }: NodeProps<{ label: string; locked: boolean, kind: string }>) => {
  return (
    <div className={`
        relative
        group
        p-4 border-2 rounded-lg shadow-md bg-white transform  w-48 h-48 flex items-center justify-center
        ${data.locked ? 'border-blue-600' : 'border-gray-400'}
        ${data.kind === 'decision' ? 'transform  w-48 h-48 flex items-center justify-center' : ''}
    `}>
      <Handle type="target" position={Position.Top} className="!bg-gray-500" />
      
      <div className={`${data.kind === 'decision' ? 'transform  text-center' : ''}`}>
        {data.label}
      </div>

      {data.locked ? (
        <LockClosedIcon className="absolute top-2 right-2 !w-4 !h-4 text-blue-600 z-10 pointer-events-none"
        style={{ width: 16, height: 16 }} />
      ) : (
        <LockOpenIcon className="absolute top-2 right-2 h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacityz-10 pointer-events-none"
        style={{ width: 16, height: 16 }} />
      )}
      
      <Handle type="source" position={Position.Bottom} className="!bg-gray-500" />
      {data.kind === 'decision' && <>
          <Handle type="source" position={Position.Left} className="!bg-gray-500" />
          <Handle type="source" position={Position.Right} className="!bg-gray-500" />
      </>}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
