import { DEFAULT_DELIMITER } from '#constants';

/**
 * Resolves a relative path against a base path, similar to path.resolve but without dependencies
 * @param basePath - The base path to resolve from
 * @param relativePath - The relative path to resolve
 * @returns The resolved absolute path
 *
 * @example
 * resolve('/parent/child/grandchild/grantchild', '../grandchild')
 * // returns '/parent/child/grandchild'
 *
 * resolve('/parent/child/grandchild/grantchild', '../../grandchild')
 * // returns '/parent/child/grandchild'
 */
export function resolve(basePath: string, relativePath: string): string {
  if (relativePath === DEFAULT_DELIMITER) return DEFAULT_DELIMITER;

  // Normalize paths by removing trailing slashes for processing
  const normalizedBase = basePath.replace(/\/+$/, '');
  const normalizedRelative = relativePath.replace(/\/+$/, '');

  // Split base path into segments - treat the last segment as a file
  const baseSegments = normalizedBase
    .split(DEFAULT_DELIMITER)
    .filter(segment => segment !== '');

  // Split relative path into segments
  const relativeSegments = normalizedRelative
    .split(DEFAULT_DELIMITER)
    .filter(segment => segment !== '');

  // Check if the original relative path ended with a slash (means directory, not file)
  const endsWithSlash = relativePath.endsWith(DEFAULT_DELIMITER);

  // Check if the relative path starts with './' - this means we want to join to the current directory
  const startsWithCurrentDir = relativePath.startsWith('./');

  // Start with base segments minus the last one (since it's treated as a file)
  // UNLESS the relative path starts with './' which means we want to treat base as a directory
  const resultSegments = startsWithCurrentDir
    ? [...baseSegments]
    : baseSegments.slice(0, -1);

  // Count the number of '..' segments
  let parentLevels = 0;
  const nonParentSegments = [];

  for (const segment of relativeSegments) {
    if (segment === '..') {
      parentLevels++;
    } else if (segment !== '.') {
      nonParentSegments.push(segment);
    }
  }

  // Remove parent levels from result
  for (let i = 0; i < parentLevels; i++) {
    if (resultSegments.length > 0) {
      resultSegments.pop();
    }
  }

  // Special handling for when no specific target is mentioned
  if (
    relativeSegments.length === 0 ||
    (relativeSegments.length === 1 && relativeSegments[0] === '.') ||
    normalizedRelative === '.' ||
    normalizedRelative === ''
  ) {
    // Return the original file path
    return normalizedBase;
  }

  // If we have only parent navigation (..) and no specific target
  if (nonParentSegments.length === 0 && parentLevels > 0) {
    // For cases like '..' or '../../', we need to include the directory name
    // that we're at after the parent navigation
    if (resultSegments.length >= 0) {
      // We want the directory name that we land on after going up
      // For example: from /parent/child/grandchild/grantchild with '..'
      // we go to /parent/child and we want to include 'grandchild'
      // So we need to add one level back down
      const originalBaseSegments = baseSegments.slice(0, -1);
      const targetLevel = originalBaseSegments.length - parentLevels;
      if (targetLevel >= 0 && targetLevel < originalBaseSegments.length) {
        const targetDir = originalBaseSegments[targetLevel];
        return (
          DEFAULT_DELIMITER +
          resultSegments.join(DEFAULT_DELIMITER) +
          (resultSegments.length > 0 ? DEFAULT_DELIMITER : '') +
          targetDir
        );
      }
    }
    return DEFAULT_DELIMITER + resultSegments.join(DEFAULT_DELIMITER);
  }

  // Add non-parent segments to result
  resultSegments.push(...nonParentSegments);

  // Special handling: if the final segment in relative path exists in the original base path,
  // try to find the best match by looking for that segment in the base path
  if (
    nonParentSegments.length > 0 &&
    !endsWithSlash &&
    !startsWithCurrentDir
  ) {
    const finalSegment = nonParentSegments[nonParentSegments.length - 1];
    const originalBaseSegments = baseSegments.slice(0, -1); // Directory path of the base

    // Check if the final segment exists in the base path
    const segmentIndex = originalBaseSegments.indexOf(finalSegment);
    if (segmentIndex !== -1) {
      // If found, check if this would be a better resolution
      const alternativeResult = originalBaseSegments.slice(
        0,
        segmentIndex + 1,
      );

      // Use the alternative if it makes more sense (contains the segment we're looking for)
      if (
        alternativeResult.length > resultSegments.length ||
        (alternativeResult.length === resultSegments.length &&
          alternativeResult[alternativeResult.length - 1] === finalSegment)
      ) {
        return (
          DEFAULT_DELIMITER + alternativeResult.join(DEFAULT_DELIMITER)
        );
      }
    }
  }

  // Join segments back with leading slash
  return DEFAULT_DELIMITER + resultSegments.join(DEFAULT_DELIMITER);
}
