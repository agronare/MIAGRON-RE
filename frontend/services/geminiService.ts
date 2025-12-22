
import { GoogleGenAI, Type } from "@google/genai";
import { KPI } from '../types';

// Helper to try backend first, then fallback to local SDK
const tryBackend = async <T>(path: string, body: any): Promise<{ ok: boolean; data?: T; error?: string }> => {
  try {
    const res = await fetch(`/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {})
    });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { ok: true, data } as any;
  } catch {
    return { ok: false };
  }
};

// Helper function to safely get the AI client
// This prevents the app from crashing on load if the API key is missing
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateBusinessInsights = async (kpiData: KPI[]): Promise<string> => {
  const ai = getAiClient();
  
  if (!ai) {
    return "⚠️ Sistema de IA no disponible. Verifique que la variable API_KEY esté configurada en el entorno.";
  }

  try {
    const dataSummary = kpiData.map(k => `${k.title}: ${k.value} (${k.change ? `+${k.change}%` : 'No change'})`).join('\n');

    const prompt = `
      Actúa como un analista de negocios senior para Agronare.
      Analiza los siguientes KPIs actuales:
      ${dataSummary}

      Proporciona un insight estratégico de 2 o 3 oraciones en español. 
      Enfócate en detectar oportunidades o riesgos basados en los datos. Sé profesional y directo.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No se pudieron generar insights.";
  } catch (error) {
    console.error("Error fetching Gemini insights:", error);
    return "El servicio de IA no está disponible momentáneamente.";
  }
};

export const generateRouteItinerary = async (vehicle: string, startPoint: string, stops: string[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Configura tu API Key para generar rutas inteligentes.";

  const prompt = `
    Actúa como un coordinador de logística experto.
    Crea un itinerario de ruta optimizado en español para entrega de agroinsumos.

    Vehículo: ${vehicle}
    Punto de Partida: ${startPoint}
    Paradas a visitar: ${stops.join(', ')}

    Devuelve un resumen estructurado en texto con:
    1. Orden recomendado de paradas para eficiencia.
    2. Distancia estimada entre puntos (simulada pero realista).
    3. Tiempo total estimado.
    4. Un consejo de eficiencia para el conductor.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Error generando ruta.";
  } catch (error) {
    return "Error conectando con IA.";
  }
};

// Advanced route optimization with AI considering multiple factors
export interface RouteStop {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  type: 'Entrega' | 'Recolección' | 'Asesoría Técnica' | 'Visita Comercial';
  priority?: 'Alta' | 'Media' | 'Baja';
  timeWindow?: { start: string; end: string };
  estimatedDuration?: number; // minutes
}

export interface OptimizedRoute {
  optimizedStops: RouteStop[];
  totalDistance: number; // km
  estimatedTime: number; // minutes
  fuelEstimate: number; // liters
  costEstimate: number; // pesos
  suggestions: string[];
  reasoning: string;
}

export const optimizeRouteWithAI = async (
  stops: RouteStop[],
  vehicleInfo: { capacity: string; fuelEfficiency?: number },
  constraints?: { maxTime?: number; prioritizeUrgent?: boolean }
): Promise<OptimizedRoute | null> => {
  // Try backend first
  const viaApi = await tryBackend<OptimizedRoute>('/optimize-route', { stops, vehicleInfo, constraints });
  if (viaApi.ok && viaApi.data) return viaApi.data;

  const ai = getAiClient();
  if (!ai) return null;

  const stopsData = stops.map((stop, idx) => ({
    index: idx,
    name: stop.name,
    type: stop.type,
    priority: stop.priority || 'Media',
    coordinates: stop.coordinates,
    timeWindow: stop.timeWindow,
    duration: stop.estimatedDuration || 30
  }));

  const prompt = `
    Actúa como un experto en optimización de rutas logísticas con algoritmos avanzados (TSP, Vehicle Routing Problem).

    Analiza las siguientes paradas y optimiza la ruta considerando:
    - Distancias geográficas (coordenadas)
    - Prioridades de entrega
    - Ventanas de tiempo
    - Tipo de operación
    - Eficiencia de combustible

    Datos de paradas:
    ${JSON.stringify(stopsData, null, 2)}

    Vehículo: ${vehicleInfo.capacity}, Eficiencia: ${vehicleInfo.fuelEfficiency || 10} km/l
    ${constraints?.maxTime ? `Tiempo máximo: ${constraints.maxTime} minutos` : ''}
    ${constraints?.prioritizeUrgent ? 'Priorizar urgentes' : ''}

    Devuelve el resultado optimizado con:
    1. Orden recomendado de paradas (lista de índices)
    2. Distancia total estimada en km
    3. Tiempo total en minutos
    4. Consumo de combustible estimado en litros
    5. Costo estimado (combustible a $24/l + $200 operación)
    6. 3 sugerencias de eficiencia
    7. Breve razonamiento de la optimización
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimizedOrder: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
              description: 'Índices de las paradas en el orden optimizado'
            },
            totalDistance: {
              type: Type.NUMBER,
              description: 'Distancia total en kilómetros'
            },
            estimatedTime: {
              type: Type.NUMBER,
              description: 'Tiempo total estimado en minutos'
            },
            fuelEstimate: {
              type: Type.NUMBER,
              description: 'Consumo de combustible en litros'
            },
            costEstimate: {
              type: Type.NUMBER,
              description: 'Costo total estimado en pesos'
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Lista de sugerencias de eficiencia'
            },
            reasoning: {
              type: Type.STRING,
              description: 'Explicación breve de la estrategia de optimización'
            }
          }
        }
      }
    });

    const jsonStr = response.text || "{}";
    const result = JSON.parse(jsonStr);

    // Reorder stops based on AI optimization
    const optimizedStops = result.optimizedOrder.map((idx: number) => stops[idx]);

    return {
      optimizedStops,
      totalDistance: result.totalDistance,
      estimatedTime: result.estimatedTime,
      fuelEstimate: result.fuelEstimate,
      costEstimate: result.costEstimate,
      suggestions: result.suggestions,
      reasoning: result.reasoning
    };
  } catch (error) {
    console.error("Error optimizing route with AI:", error);
    return null;
  }
};

export const generateFinancialAnalysis = async (dataSummary: string): Promise<string> => {
  // Try backend first
  const viaApi = await tryBackend<{ text: string }>('/finance', { dataSummary });
  if (viaApi.ok && viaApi.data) return viaApi.data.text || "";

  const ai = getAiClient();
  if (!ai) return "Análisis IA no disponible (falta API Key).";

  const prompt = `
    Actúa como el CFO (Chief Financial Officer) de Agronare.
    Analiza el siguiente resumen de datos de un reporte:
    ${dataSummary}

    Proporciona un "Resumen Ejecutivo" profesional en español de 1 párrafo (aprox 60-80 palabras).
    Resalta tendencias clave, riesgos potenciales o logros destacados que se deduzcan de los datos. 
    Sé analítico y formal.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Error generando análisis.";
  } catch (error) {
    console.error(error);
    return "Error conectando con el servicio de IA.";
  }
};

export const chatWithGemini = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
  // Try backend first
  const viaApi = await tryBackend<{ text: string }>('/chat', { history, message });
  if (viaApi.ok && viaApi.data) return viaApi.data.text || "";

  const ai = getAiClient();
  if (!ai) return "Lo siento, no puedo responder porque falta la configuración de la API Key en el sistema.";

    try {
        // Map role 'model' to 'model' for history, ensuring correct format
        const formattedHistory = history.map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: h.parts
        }));

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: formattedHistory
        });

        const result = await chat.sendMessage({ message });
        return result.text || "No entendí eso.";
    } catch (e) {
        console.error(e);
        return "Lo siento, tengo problemas de conexión con el servicio de IA.";
    }
}

export const generateSurveyQuestions = async (topic: string): Promise<string[]> => {
  // Try backend first
  const viaApi = await tryBackend<{ questions: string[] }>('/survey', { topic });
  if (viaApi.ok && viaApi.data) return viaApi.data.questions || [];

  const ai = getAiClient();
  if (!ai) return ["Error: API Key no configurada en el sistema."];

    const prompt = `
        Actúa como un experto en Recursos Humanos y Psicología Organizacional (NOM-035 México).
        Genera 5 preguntas clave para una encuesta interna dirigida a empleados.
        
        El tema de la encuesta es: "${topic}".
        
        Las preguntas deben ser:
        1. Claras y profesionales.
        2. Enfocadas en obtener datos accionables.
        3. En formato de pregunta cerrada (Sí/No o Escala Likert).
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                    },
                },
            },
        });
        
        const jsonStr = response.text || "[]";
        
        try {
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error("Error parsing JSON from AI", e);
            return ["Error al interpretar respuesta de IA."];
        }
    } catch (error) {
        console.error(error);
        return ["Error al generar preguntas. Intenta de nuevo."];
    }
};

export const generateBotConfigFromPrompt = async (prompt: string): Promise<any> => {
  // Try backend first
  const viaApi = await tryBackend<any>('/bot-config', { prompt });
  if (viaApi.ok && viaApi.data) return viaApi.data;

  const ai = getAiClient();
  if (!ai) {
    throw new Error("API Key no configurada.");
  }

    const fullPrompt = `
      Actúa como un especialista en RPA (Robotic Process Automation). Analiza la siguiente descripción de una tarea y extráela en un formato JSON estructurado.
      La descripción es: "${prompt}"

      Debes identificar un nombre corto y descriptivo, una descripción más detallada, el tipo de disparador (schedule, email, webhook, manual), el valor del disparador (p. ej. "Cada día a las 8 AM", "Al recibir correo con asunto 'Factura'", "N/A"), y una lista de acciones simples.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: {
                            type: Type.STRING,
                            description: 'Un nombre corto y descriptivo para el bot.'
                        },
                        description: {
                            type: Type.STRING,
                            description: 'Una descripción detallada de lo que hace el bot.'
                        },
                        type: {
                            type: Type.STRING,
                            description: 'El tipo de disparador. Opciones: Scheduled, Webhook, Manual, Email.'
                        },
                        schedule: {
                            type: Type.STRING,
                            description: 'El valor del disparador. Por ejemplo, "Diario 08:00 AM", "Cada 15 min", "Tiempo Real" o "N/A" si es manual.'
                        },
                        actions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                            },
                            description: 'Una lista de pasos o acciones que el bot debe ejecutar.'
                        }
                    }
                },
            },
        });
        
        const jsonStr = response.text?.trim() || "{}";
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Error generating bot config from prompt:", error);
        throw new Error("Failed to generate bot configuration.");
    }
};
