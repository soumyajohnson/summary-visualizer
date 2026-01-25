const ELK = require('elkjs');
const elk = new ELK();

function estimateSize(node) {
    const avgCharWidth = 8;
    const paddingX = 30;
    const paddingY = 20;
    
    const minWidth = 120;
    const minHeight = 50;
    const decisionHeight = 80;

    const text = node.text || '';
    const lines = text.split('\n');
    const longestLine = lines.reduce((a, b) => a.length > b.length ? a : b, '');

    let width = Math.max(minWidth, longestLine.length * avgCharWidth + paddingX);
    let height = Math.max(minHeight, lines.length * 20 + paddingY);

    if (node.kind === 'decision') {
        width = Math.max(width, 140);
        height = Math.max(height, decisionHeight);
    }
    
    return { width, height };
}

async function runLayout(diagramSpec, constraints) {
    const lockedNodes = constraints?.lockedNodes || {};

    const elkGraph = {
        id: 'root',
        layoutOptions: {
            'elk.algorithm': 'layered',
            'elk.direction': diagramSpec.style === 'LR' ? 'RIGHT' : 'DOWN',
            'elk.layered.spacing.nodeNodeBetweenLayers': '80',
            'elk.spacing.nodeNode': '60'
        },
        children: diagramSpec.nodes.map(node => {
            const size = estimateSize(node);
            const nodeData = {
                id: node.id,
                _original: node,
                width: size.width,
                height: size.height
            };
            // Best-effort hint for locked nodes. ELK's layered algorithm
            // may still adjust positions to resolve conflicts.
            if (lockedNodes[node.id]) {
                nodeData.x = lockedNodes[node.id].x;
                nodeData.y = lockedNodes[node.id].y;
            }
            return nodeData;
        }),
        edges: diagramSpec.edges.map((edge, i) => ({
            id: `e${i}`,
            sources: [edge.from],
            targets: [edge.to],
            _original: edge
        }))
    };

    const layout = await elk.layout(elkGraph);

    // After layout, we MUST override the positions for locked nodes
    // to ensure they are exactly where the user placed them.
    layout.children.forEach(node => {
        if (lockedNodes[node.id]) {
            node.x = lockedNodes[node.id].x;
            node.y = lockedNodes[node.id].y;
        }
    });

    const layoutSpec = {
        nodes: layout.children.map(node => ({
            ...node._original,
            x: node.x,
            y: node.y,
            width: node.width,
            height: node.height,
            // Carry over the locked status
            locked: !!lockedNodes[node.id] 
        })),
        edges: layout.edges.map(edge => {
            const { from, to, text } = edge._original;
            const points = edge.sections[0].bendPoints ? 
                [edge.sections[0].startPoint, ...edge.sections[0].bendPoints, edge.sections[0].endPoint] : 
                [edge.sections[0].startPoint, edge.sections[0].endPoint];
            
            return {
                from,
                to,
                text,
                points: points.map(p => [p.x, p.y])
            };
        }),
        groups: diagramSpec.groups || [],
        style: diagramSpec.style
    };

    return layoutSpec;
}

async function main() {
    let data = '';
    process.stdin.setEncoding('utf8');
    
    for await (const chunk of process.stdin) {
        data += chunk;
    }

    if (!data) {
        console.error("Error: No data received from stdin.");
        process.exit(1);
    }

    try {
        const { diagram_spec, constraints } = JSON.parse(data);
        const layoutSpec = await runLayout(diagram_spec, constraints);
        process.stdout.write(JSON.stringify(layoutSpec, null, 2));
    } catch (error) {
        console.error(`Error: Layout engine failed. ${error.message}`);
        process.exit(1);
    }
}

main();