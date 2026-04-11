export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
  headerTop: number;
  headerSide: number;
}

export const getSafeAreaInsets = (
  width: number,
  height: number,
): SafeAreaInsets => {
  const isPortrait = height >= width;

  if (isPortrait) {
    return {
      top: Math.max(168, Math.round(height * 0.088)),
      right: Math.max(58, Math.round(width * 0.054)),
      bottom: Math.max(196, Math.round(height * 0.102)),
      left: Math.max(58, Math.round(width * 0.054)),
      headerTop: Math.max(84, Math.round(height * 0.044)),
      headerSide: Math.max(44, Math.round(width * 0.041)),
    };
  }

  return {
    top: Math.max(88, Math.round(height * 0.082)),
    right: Math.max(96, Math.round(width * 0.05)),
    bottom: Math.max(108, Math.round(height * 0.1)),
    left: Math.max(96, Math.round(width * 0.05)),
    headerTop: Math.max(42, Math.round(height * 0.04)),
    headerSide: Math.max(52, Math.round(width * 0.027)),
  };
};
