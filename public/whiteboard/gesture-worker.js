/* Camera frames stay in this dedicated worker; only landmarks leave it. */
'use strict';

let recognizer = null;
let initialization = null;
let lastTimestamp = -1;
let disposed = false;

function reportError(stage, error) {
  self.postMessage({
    type: 'error',
    stage,
    message: error instanceof Error ? error.message : String(error),
  });
}

async function initialize() {
  if (recognizer) return;
  if (initialization) return initialization;
  initialization = (async () => {
    if (typeof OffscreenCanvas !== 'function') {
      throw new Error('当前浏览器不支持后台手势识别，请使用新版 Chrome 或 Edge。');
    }
    if (!self.vision) importScripts('/whiteboard/vendor/vision_bundle.js');
    const { FilesetResolver, GestureRecognizer } = self.vision;
    const fileset = await FilesetResolver.forVisionTasks('/whiteboard/vendor/wasm');
    const candidate = await GestureRecognizer.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: '/whiteboard/vendor/gesture_recognizer.task',
        delegate: 'CPU',
      },
      canvas: new OffscreenCanvas(1, 1),
      runningMode: 'VIDEO',
      numHands: 1,
      minHandDetectionConfidence: 0.55,
      minHandPresenceConfidence: 0.55,
      minTrackingConfidence: 0.55,
      cannedGesturesClassifierOptions: { maxResults: 1 },
    });
    if (disposed) {
      candidate.close();
      return;
    }
    recognizer = candidate;
    lastTimestamp = -1;
  })();
  try {
    await initialization;
  } catch (error) {
    initialization = null;
    throw error;
  }
}

self.onmessage = async ({ data }) => {
  if (!data || typeof data !== 'object') return;
  if (data.type === 'init') {
    try {
      await initialize();
      if (!disposed) self.postMessage({ type: 'ready' });
    } catch (error) {
      reportError('init', error);
    }
    return;
  }
  if (data.type === 'dispose') {
    disposed = true;
    recognizer?.close();
    recognizer = null;
    return;
  }
  if (data.type !== 'frame') return;
  const bitmap = data.bitmap;
  try {
    if (disposed) return;
    if (!recognizer) throw new Error('手势识别尚未准备完成。');
    if (!bitmap || !bitmap.width || !bitmap.height) throw new Error('摄像头画面尚未准备完成。');
    const suppliedTimestamp = Number(data.timestamp);
    if (!Number.isFinite(suppliedTimestamp)) throw new Error('摄像头帧时间无效。');
    // MediaPipe VIDEO timestamps must strictly increase, even if a device repeats one.
    const timestamp = Math.max(suppliedTimestamp, lastTimestamp + 1);
    lastTimestamp = timestamp;
    const result = recognizer.recognizeForVideo(bitmap, timestamp);
    const category = result.gestures?.[0]?.[0];
    self.postMessage({
      type: 'result',
      timestamp: suppliedTimestamp,
      gesture: category?.categoryName || 'None',
      score: category?.score || 0,
      landmarks: (result.landmarks?.[0] || []).map(({ x, y, z }) => ({ x, y, z })),
    });
  } catch (error) {
    reportError('frame', error);
  } finally {
    // A transferred frame must not remain in memory while the next one is captured.
    bitmap?.close?.();
  }
};
