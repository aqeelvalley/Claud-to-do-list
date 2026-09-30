import Foundation

/// What LifeList and its home-screen widgets share, through the App Group.
/// The app writes a small snapshot of today; the widgets read it, and leave taps
/// (tick a to-do, log calories) in a queue the app picks up next time it opens.
enum LLShared {
    static let baseGroup = "group.app.lifelist.island"

    /// The App Group this install can really use. Sideloading tools (AltStore, Sideloadly) sign
    /// with their own group name (often with the team id added), so read it from the install's
    /// provisioning profile, then fall back to likely names, and only use one iOS actually grants.
    static let group: String = {
        let fm = FileManager.default
        let usable = { (g: String) in fm.containerURL(forSecurityApplicationGroupIdentifier: g) != nil }
        let listed = provisionedGroups()
        var candidates = listed.filter { $0.contains("lifelist") } + listed.filter { !$0.contains("lifelist") }
        var main = Bundle.main.bundleIdentifier ?? ""
        if Bundle.main.bundlePath.hasSuffix(".appex"), let dot = main.range(of: ".", options: .backwards) {
            main = String(main[..<dot.lowerBound])
        }
        candidates += [baseGroup, "group." + main]
        if let last = main.split(separator: ".").last, main != "app.lifelist.island" {
            let team = String(last)
            candidates += [baseGroup + "." + team, "group." + team + ".app.lifelist.island"]
        }
        return candidates.first(where: usable) ?? baseGroup
    }()

    /// App groups listed in this bundle's embedded provisioning profile.
    static func provisionedGroups() -> [String] {
        guard let url = Bundle.main.url(forResource: "embedded", withExtension: "mobileprovision"),
              let data = try? Data(contentsOf: url),
              let text = String(data: data, encoding: .isoLatin1),
              let start = text.range(of: "<?xml"),
              let end = text.range(of: "</plist>") else { return [] }
        let xml = Data(String(text[start.lowerBound..<end.upperBound]).utf8)
        guard let plist = try? PropertyListSerialization.propertyList(from: xml, options: [], format: nil) as? [String: Any],
              let ent = plist["Entitlements"] as? [String: Any] else { return [] }
        return ent["com.apple.security.application-groups"] as? [String] ?? []
    }
    static let snapKey = "ll.widget.snapshot"
    static let actKey = "ll.widget.actions"
    static var defaults: UserDefaults? { UserDefaults(suiteName: group) }

    struct Todo: Codable, Hashable, Identifiable {
        var id: String
        var title: String
        var done: Bool
        var quest: Bool
        var place: String
        var color: String
        var due: String
    }

    struct Snapshot: Codable {
        var island: String
        var level: Int
        var xpPct: Double
        var streak: Int
        var activeToday: Bool
        var questsDone: Int
        var questsTotal: Int
        var todos: [Todo]
        var kcal: Int
        var kcalTarget: Int
        var steps: Int
        var stepTarget: Int
        var next: String
        var updated: Double
    }

    static let sample = Snapshot(
        island: "Your Isle", level: 4, xpPct: 0.62, streak: 6, activeToday: true, questsDone: 2, questsTotal: 5,
        todos: [
            Todo(id: "s1", title: "Edit the vlog intro", done: false, quest: true, place: "Studio", color: "#E4826A", due: "Today"),
            Todo(id: "s2", title: "Send the quote", done: false, quest: true, place: "Office", color: "#9F8FC9", due: "Tomorrow"),
            Todo(id: "s3", title: "Water, steps and sleep", done: true, quest: true, place: "Gym", color: "#5CB88A", due: ""),
            Todo(id: "s4", title: "Plan the week", done: false, quest: false, place: "Home", color: "#E9B949", due: "Fri"),
            Todo(id: "s5", title: "Call the bank", done: false, quest: false, place: "Bank", color: "#6CB8C2", due: "")
        ],
        kcal: 1240, kcalTarget: 2000, steps: 6400, stepTarget: 10000, next: "Pay rent · due today", updated: 0)

    static func load() -> Snapshot? {
        guard let s = defaults?.string(forKey: snapKey), let d = s.data(using: .utf8) else { return nil }
        return try? JSONDecoder().decode(Snapshot.self, from: d)
    }

    static func saveRaw(_ json: String) {
        defaults?.set(json, forKey: snapKey)
    }

    static func save(_ snap: Snapshot) {
        if let d = try? JSONEncoder().encode(snap), let s = String(data: d, encoding: .utf8) { saveRaw(s) }
    }

    static func pushAction(_ action: [String: Any]) {
        var list = (defaults?.array(forKey: actKey) as? [[String: Any]]) ?? []
        var a = action
        a["at"] = Date().timeIntervalSince1970 * 1000
        list.append(a)
        defaults?.set(Array(list.suffix(50)), forKey: actKey)
    }

    static func takeActions() -> [[String: Any]] {
        let list = (defaults?.array(forKey: actKey) as? [[String: Any]]) ?? []
        defaults?.removeObject(forKey: actKey)
        return list
    }
}
