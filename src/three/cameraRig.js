// Reusable camera rig: every scene drives the camera through the same
// polar description — angle around the look-at point, radius (distance),
// height — rather than raw x/y/z. Interpolating angle/radius/height
// independently means a scroll transition is an actual arc around the
// vehicle (the camera "physically moving through the studio"), not a
// straight-line lerp between two arbitrary points in space that could
// clip through the car or take an unmotivated path.
export function polarToCartesian(angle, radius, height, lx, lz) {
  return {
    x: lx + Math.sin(angle) * radius,
    y: height,
    z: lz + Math.cos(angle) * radius,
  }
}
