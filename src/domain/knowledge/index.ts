import { captureTechniques } from "./capture";
import { compositionTechniques } from "./composition";
import { environmentTechniques } from "./environments";
import { lightingTechniques } from "./lighting";
import { opticsTechniques } from "./optics";

export { captureTechniques, compositionTechniques, environmentTechniques, lightingTechniques, opticsTechniques };
export { visualGoals } from "./visual-goals";

export const productionTechniques = [
  ...lightingTechniques,
  ...opticsTechniques,
  ...environmentTechniques,
  ...compositionTechniques,
  ...captureTechniques,
];
