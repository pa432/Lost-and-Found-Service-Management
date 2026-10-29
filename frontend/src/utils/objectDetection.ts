import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

let model: cocoSsd.ObjectDetection | null = null;

export async function loadModel() {
  if (!model) {
    await tf.ready();
    model = await cocoSsd.load({ base: "lite_mobilenet_v2" }); // lightweight for fast loading
  }
  return model;
}

export async function detectObjects(imageFile: File): Promise<string[]> {
  const detector = await loadModel();
  const img = new Image();
  img.src = URL.createObjectURL(imageFile);
  await img.decode(); // wait for image to load

  const predictions = await detector.detect(img);
  URL.revokeObjectURL(img.src);

  // Return unique class names, sorted by confidence
  return [...new Set(predictions.map(p => p.class))];
}