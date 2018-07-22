
// Glob returns the names of all files matching pattern
export function glob(pattern :string) : string[]

// Match reports whether name matches the shell file name pattern
export function match(pattern :string, name :string) :boolean

// PatternError is the only error thrown by match and glob for
// malformed patterns.
export class PatternError extends Error {}
