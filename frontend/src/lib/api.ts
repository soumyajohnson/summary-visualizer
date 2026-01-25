import axios from 'axios';
import { DiagramSpec, LayoutSpec, LayoutConstraints } from 'shared';

const apiClient = axios.create({
  baseURL: 'http://localhost:8001/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Generates a diagram spec from text and then computes its layout.
 * @param text The natural language text to convert into a diagram.
 * @returns A promise that resolves to the final LayoutSpec.
 */
export async function generateAndLayoutDiagram(text: string): Promise<LayoutSpec> {
  try {
    const generateResponse = await apiClient.post('/generate', { text });
    const diagramSpec: DiagramSpec = generateResponse.data;

    // Call layout with no constraints for initial generation
    const layoutResponse = await apiClient.post('/layout', { diagram_spec: diagramSpec, constraints: null });
    const layoutSpec: LayoutSpec = layoutResponse.data;

    return layoutSpec;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.detail || 'An unknown API error occurred');
    }
    throw error;
  }
}

/**
 * Re-runs the layout engine for an existing diagram spec, respecting constraints.
 * @param diagramSpec The base structure of the diagram.
 * @param constraints The constraints to apply (e.g., locked node positions).
 * @returns A promise that resolves to the new, tidied LayoutSpec.
 */
export async function tidyLayout(diagramSpec: DiagramSpec, constraints: LayoutConstraints): Promise<LayoutSpec> {
    try {
        const layoutResponse = await apiClient.post('/layout', { diagram_spec: diagramSpec, constraints });
        return layoutResponse.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || 'An unknown API error occurred during tidy.');
        }
        throw error;
    }
}