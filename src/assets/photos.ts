// Resolves real photos dropped into src/assets/ by filename. Uses Vite's glob
// so the build succeeds whether or not the files are present yet: if a file is
// missing, resolvePhoto returns undefined and the PhotoReveal shows its gentle
// placeholder instead. Drop guitar.jpg / wedding.jpg in here and they appear.
const files = import.meta.glob('./*.{jpg,jpeg,png,JPG,JPEG,PNG,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

export function resolvePhoto(name?: string): string | undefined {
  if (!name) return undefined
  return files[`./${name}`]
}
