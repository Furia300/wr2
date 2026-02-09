export const periodicNoiseGLSL = /* glsl */ `
  float periodicNoise(vec3 p, float time) {
    float noise = 0.0;
    noise += sin(p.x * 2.0 + time) * cos(p.z * 1.5 + time);
    noise += sin(p.x * 3.2 + time * 2.0) * cos(p.z * 2.1 + time) * 0.6;
    noise += sin(p.x * 1.7 + time) * cos(p.z * 2.8 + time * 3.0) * 0.4;
    noise += sin(p.x * p.z * 0.5 + time * 2.0) * 0.3;
    float waveY = sin(p.x * 1.2 + time * 1.5) * cos(p.z * 1.2 + time * 0.8) * 0.5;
    float waveX = sin((p.x + p.z) * 0.8 + time) * 0.4;
    float waveZ = cos(p.x * 0.6 - time * 1.2) * sin(p.z * 0.6 + time) * 0.4;
    noise += waveY + waveX + waveZ;
    return noise * 0.35;
  }
`;
