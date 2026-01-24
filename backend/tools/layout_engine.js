const ELK = require('elkjs');
const elk = new ELK();

/**
 * Heuristic to estimate node dimensions based on its text content.
 * @param {object} node - A node from the DiagramSpec.
 * @returns {{width: number, height: number}}
 */
function estimateSize(node) {
    const avgCharWidth = 8;
    const paddingX = 30;
    const paddingY = 20;
    
    const minWidth = 120;
    const minHeight = 50;
    const decisionHeight = 80; // Diamonds need more space

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

/**
 * Converts a DiagramSpec into an ELK graph structure, computes the layout,
 * and transforms it back into a LayoutSpec.
 * @param {object} diagramSpec - The input diagram specification.
 * @returns {Promise<object>} - The resulting layout specification.
 */
async function runLayout(diagramSpec) {
    const elkGraph = {
        id: 'root',
        layoutOptions: {
            'elk.algorithm': 'layered',
            'elk.direction': diagramSpec.style === 'LR' ? 'RIGHT' : 'DOWN',
            'elk.layered.spacing.nodeNodeBetweenLayers': '80', // Vertical spacing
            'elk.spacing.nodeNode': '60' // Horizontal spacing
        },
        children: diagramSpec.nodes.map(node => {
            const size = estimateSize(node);
            return {
                id: node.id,
                // Pass original data through for reconstruction
                _original: node,
                width: size.width,
                height: size.height
            };
        }),
        edges: diagramSpec.edges.map((edge, i) => ({
            id: `e${i}`,
            sources: [edge.from],
            targets: [edge.to],
            // Pass original data through
            _original: edge
        }))
    };

    const layout = await elk.layout(elkGraph);

    // Transform ELK output back to our LayoutSpec format
    const layoutSpec = {
        nodes: layout.children.map(node => ({
            ...node._original,
            x: node.x,
            y: node.y,
            width: node.width,
            height: node.height
        })),
        edges: layout.edges.map(edge => {
            // Re-find original edge data since ELK doesn't preserve it
            const { from, to, text } = edge._original;
            const points = edge.sections[0].bendPoints ? 
                [edge.sections[0].startPoint, ...edge.sections[0].bendPoints, edge.sections[0].endPoint] : 
                [edge.sections[0].startPoint, edge.sections[0].endPoint];
            
            return {
                from: from,
                to: to,
                text: text,
                points: points.map(p => [p.x, p.y])
            };
        }),
        groups: diagramSpec.groups || [],
        style: diagramSpec.style
    };

    return layoutSpec;
}

/**
 * Main function to read from stdin, process, and write to stdout.
 */
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
        const diagramSpec = JSON.parse(data);
        const layoutSpec = await runLayout(diagramSpec);
        process.stdout.write(JSON.stringify(layoutSpec, null, 2));
    } catch (error) {
        console.error(`Error: Layout engine failed. ${error.message}`);
        process.exit(1);
    }
}

main();
