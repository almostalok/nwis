/**
 * Vector mathematical operations and deterministic semantic embedding generator for local/offline execution.
 */
export class VectorUtils {
  /**
   * Calculates cosine similarity between two numeric vectors.
   * Returns a value between -1.0 and 1.0 (typically 0.0 to 1.0 for positive embeddings).
   */
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) {
      return 0;
    }
    const len = Math.min(vecA.length, vecB.length);
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < len; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Generates a deterministic high-dimensional feature vector for text.
   * Preserves semantic relatedness for drilling terms (e.g. "stuck pipe", "torque spike", "mud loss").
   */
  static generateLocalEmbedding(text: string, dim = 64): number[] {
    const vector = new Array(dim).fill(0);
    if (!text || text.trim().length === 0) return vector;

    const normalized = text.toLowerCase();

    // Domain ontology semantic anchor points
    const semanticKeywords: Record<string, number[]> = {
      stuck: [0, 1, 2],
      pipe: [1, 2, 3],
      string: [1, 3],
      torque: [4, 5],
      spike: [4, 6],
      drag: [5, 7],
      loss: [8, 9, 10],
      circulation: [9, 10, 11],
      mud: [10, 12],
      kick: [13, 14],
      pressure: [14, 15],
      influx: [13, 15],
      formation: [16, 17],
      gamma: [17, 18],
      barail: [18, 19],
      tipam: [19, 20],
      girujan: [20, 21],
      depth: [22, 23],
      rop: [24, 25],
      wob: [25, 26],
      rpm: [26, 27],
      casing: [28, 29],
      cement: [29, 30],
      failure: [31, 32],
      npt: [33, 34],
    };

    // 1. Inject domain cluster activations
    for (const [kw, slots] of Object.entries(semanticKeywords)) {
      if (normalized.includes(kw)) {
        for (const slot of slots) {
          if (slot < dim) {
            vector[slot] += 2.0;
          }
        }
      }
    }

    // 2. Hash n-grams across dimensions for generalized semantic text retrieval
    const words = normalized.split(/\W+/).filter(Boolean);
    for (let w = 0; w < words.length; w++) {
      const word = words[w];
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = (hash << 5) - hash + word.charCodeAt(i);
        hash |= 0;
      }
      const idx = Math.abs(hash) % dim;
      vector[idx] += 1.0 / (1 + Math.log(w + 1));
    }

    // 3. Normalize vector to unit length
    let norm = 0;
    for (let i = 0; i < dim; i++) {
      norm += vector[i] * vector[i];
    }
    const mag = Math.sqrt(norm);
    if (mag > 0) {
      for (let i = 0; i < dim; i++) {
        vector[i] /= mag;
      }
    }

    return vector;
  }
}
