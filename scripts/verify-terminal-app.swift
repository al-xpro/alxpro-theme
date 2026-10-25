// Unarchives every color in a Terminal.app profile with AppKit and prints it
// as sRGB hex, one `Key #RRGGBB[AA]` per line, so `check.ts` can compare it
// with the palette. Proves Terminal.app can read the colors `build.ts` writes.
// Usage: swift scripts/verify-terminal-app.swift <profile.terminal>...
import AppKit

for path in CommandLine.arguments.dropFirst() {
  guard let profile = NSDictionary(contentsOfFile: path) as? [String: Any] else {
    print("ERROR \(path): not a plist")
    exit(1)
  }
  for (key, value) in profile.sorted(by: { $0.key < $1.key }) {
    guard let data = value as? Data else { continue }
    guard
      let color = try? NSKeyedUnarchiver.unarchivedObject(ofClass: NSColor.self, from: data),
      let srgb = color.usingColorSpace(.sRGB)
    else {
      print("ERROR \(path) \(key): not an NSColor")
      exit(1)
    }
    let byte = { (v: CGFloat) in String(format: "%02X", Int((v * 255).rounded())) }
    let alpha = srgb.alphaComponent < 1 ? byte(srgb.alphaComponent) : ""
    print("\(key) #\(byte(srgb.redComponent))\(byte(srgb.greenComponent))\(byte(srgb.blueComponent))\(alpha)")
  }
}
