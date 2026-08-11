// Real audio files, resolved by filename. Anything dropped into src/audio/
// overrides the synthesized version of that sound automatically — so if you
// have the genuine AIM clips from an old install, just drop them in.
//
// Recognized names (all optional except dialup.mp3, which ships):
//   dialup.mp3     the modem handshake  (shipped: CC0, see README)
//   signon.mp3     the AIM sign-on / door-open
//   signoff.mp3    the AIM sign-off / door-close
//   receive.mp3    incoming message
//   send.mp3       outgoing message
const files = import.meta.glob('./*.{mp3,ogg,oga,wav,m4a}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

export function resolveClip(name: string): string | undefined {
  return files[`./${name}`]
}
