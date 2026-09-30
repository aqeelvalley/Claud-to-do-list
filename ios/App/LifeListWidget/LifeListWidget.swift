import WidgetKit
import SwiftUI
import AppIntents

// MARK: - Palette (the island's pastels)

extension Color {
    init(hex: String) {
        var s = hex.trimmingCharacters(in: .whitespaces)
        if s.hasPrefix("#") { s.removeFirst() }
        var v: UInt64 = 0
        Scanner(string: s).scanHexInt64(&v)
        self.init(red: Double((v >> 16) & 0xFF) / 255, green: Double((v >> 8) & 0xFF) / 255, blue: Double(v & 0xFF) / 255)
    }
}

enum LL {
    static let cream = Color(hex: "#FFF6EC")
    static let peach = Color(hex: "#FBE3D2")
    static let ink = Color(hex: "#4A4068")
    static let muted = Color(hex: "#8C83A8")
    static let coral = Color(hex: "#E4826A")
    static let gold = Color(hex: "#E9B949")
    static let green = Color(hex: "#5CB88A")
    static let sea = Color(hex: "#6CB8C2")
    static let lilac = Color(hex: "#9F8FC9")
    static let track = Color(hex: "#463D63").opacity(0.12)

    static func font(_ size: CGFloat, _ weight: Font.Weight = .semibold) -> Font {
        .system(size: size, weight: weight, design: .rounded)
    }
    static func frac(_ a: Int, _ b: Int) -> Double { b > 0 ? min(1, Double(a) / Double(b)) : 0 }
    static let addTask = URL(string: "lifelist://add-task")!
    static let logFood = URL(string: "lifelist://log-food")!
    static let home = URL(string: "lifelist://home")!
}

// MARK: - Timeline

struct LLEntry: TimelineEntry {
    let date: Date
    let snap: LLShared.Snapshot?
}

struct LLProvider: TimelineProvider {
    func placeholder(in context: Context) -> LLEntry {
        LLEntry(date: Date(), snap: LLShared.sample)
    }

    func getSnapshot(in context: Context, completion: @escaping (LLEntry) -> Void) {
        let s = LLShared.load()
        completion(LLEntry(date: Date(), snap: s ?? (context.isPreview ? LLShared.sample : nil)))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<LLEntry>) -> Void) {
        let entry = LLEntry(date: Date(), snap: LLShared.load())
        // come back after midnight (or within the hour) so "today" never goes stale
        let midnight = Calendar.current.startOfDay(for: Date().addingTimeInterval(86_400)).addingTimeInterval(60)
        let next = min(midnight, Date().addingTimeInterval(3_600))
        completion(Timeline(entries: [entry], policy: .after(next)))
    }
}

// MARK: - Actions you can take right on the widget (iOS 17+)

struct CompleteTodoIntent: AppIntent {
    static var title: LocalizedStringResource = "Tick off a to-do"
    static var isDiscoverable: Bool = false

    @Parameter(title: "To-do")
    var todoId: String

    init() {}
    init(todoId: String) { self.todoId = todoId }

    func perform() async throws -> some IntentResult {
        LLShared.pushAction(["type": "done", "id": todoId])
        if var s = LLShared.load(), let i = s.todos.firstIndex(where: { $0.id == todoId }), !s.todos[i].done {
            s.todos[i].done = true
            if s.todos[i].quest { s.questsDone = min(s.questsTotal, s.questsDone + 1) }
            LLShared.save(s)
        }
        return .result()
    }
}

struct LogKcalIntent: AppIntent {
    static var title: LocalizedStringResource = "Log calories"
    static var isDiscoverable: Bool = false

    @Parameter(title: "Calories")
    var kcal: Int

    init() {}
    init(kcal: Int) { self.kcal = kcal }

    func perform() async throws -> some IntentResult {
        LLShared.pushAction(["type": "kcal", "kcal": kcal])
        if var s = LLShared.load() {
            s.kcal += kcal
            LLShared.save(s)
        }
        return .result()
    }
}

// MARK: - Building blocks

struct Ring: View {
    var value: Double
    var color: Color
    var width: CGFloat = 7

    var body: some View {
        ZStack {
            Circle().stroke(LL.track, lineWidth: width)
            Circle()
                .trim(from: 0, to: max(0.001, min(1, value)))
                .stroke(color, style: StrokeStyle(lineWidth: width, lineCap: .round))
                .rotationEffect(.degrees(-90))
        }
    }
}

struct Bar: View {
    var value: Double
    var color: Color
    var height: CGFloat = 6

    var body: some View {
        GeometryReader { g in
            ZStack(alignment: .leading) {
                Capsule().fill(LL.track)
                Capsule().fill(color).frame(width: max(height, g.size.width * min(1, max(0, value))))
            }
        }
        .frame(height: height)
    }
}

struct PillLabel: View {
    var icon: String
    var text: String
    var color: Color

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon).font(.system(size: 11, weight: .bold))
            Text(text).font(LL.font(12, .bold)).lineLimit(1).minimumScaleFactor(0.8)
        }
        .foregroundStyle(.white)
        .padding(.horizontal, 8)
        .padding(.vertical, 7)
        .frame(maxWidth: .infinity)
        .background(color, in: Capsule())
    }
}

struct AddTodoPill: View {
    var body: some View { Link(destination: LL.addTask) { PillLabel(icon: "plus", text: "To-do", color: LL.coral) } }
}

struct KcalPill: View {
    var kcal: Int
    var body: some View {
        Button(intent: LogKcalIntent(kcal: kcal)) { PillLabel(icon: "fork.knife", text: "+\(kcal)", color: LL.gold) }
            .buttonStyle(.plain)
    }
}

struct Header: View {
    var s: LLShared.Snapshot

    var body: some View {
        HStack(spacing: 6) {
            Text("\(s.level)")
                .font(LL.font(11, .heavy))
                .foregroundStyle(.white)
                .frame(width: 20, height: 20)
                .background(LL.green, in: Circle())
            Text(s.island).font(LL.font(14, .bold)).foregroundStyle(LL.ink).lineLimit(1)
            Spacer(minLength: 4)
            HStack(spacing: 2) {
                Image(systemName: "flame.fill").font(.system(size: 11, weight: .bold))
                Text("\(s.streak)").font(LL.font(12, .bold))
            }
            .foregroundStyle(s.activeToday ? LL.coral : LL.muted)
        }
    }
}

struct TodoRow: View {
    var t: LLShared.Todo

    var body: some View {
        HStack(spacing: 8) {
            Button(intent: CompleteTodoIntent(todoId: t.id)) {
                ZStack {
                    Circle().strokeBorder(Color(hex: t.color), lineWidth: 2)
                    if t.done {
                        Circle().fill(Color(hex: t.color))
                        Image(systemName: "checkmark").font(.system(size: 9, weight: .heavy)).foregroundStyle(.white)
                    }
                }
                .frame(width: 20, height: 20)
            }
            .buttonStyle(.plain)
            .disabled(t.done)
            VStack(alignment: .leading, spacing: 0) {
                Text(t.title)
                    .font(LL.font(13, .semibold))
                    .foregroundStyle(t.done ? LL.muted : LL.ink)
                    .strikethrough(t.done, color: LL.muted)
                    .lineLimit(1)
                Text(t.due.isEmpty ? t.place : t.place + " · " + t.due)
                    .font(LL.font(10, .medium))
                    .foregroundStyle(LL.muted)
                    .lineLimit(1)
            }
            Spacer(minLength: 0)
        }
    }
}

struct Stat: View {
    var label: String
    var value: String
    var frac: Double
    var color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            HStack {
                Text(label).font(LL.font(10, .bold)).foregroundStyle(LL.muted).textCase(.uppercase)
                Spacer(minLength: 2)
                Text(value).font(LL.font(11, .bold)).foregroundStyle(LL.ink).lineLimit(1).minimumScaleFactor(0.7)
            }
            Bar(value: frac, color: color)
        }
    }
}

struct SetupView: View {
    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: "sun.horizon.fill").font(.system(size: 22)).foregroundStyle(LL.coral)
            Text("Open LifeList").font(LL.font(14, .bold)).foregroundStyle(LL.ink)
            Text("to sync your island").font(LL.font(11, .medium)).foregroundStyle(LL.muted)
        }
        .widgetURL(LL.home)
    }
}

extension View {
    func llBackground() -> some View {
        containerBackground(for: .widget) {
            LinearGradient(colors: [LL.cream, LL.peach], startPoint: .top, endPoint: .bottom)
        }
    }
}

func openTodos(_ s: LLShared.Snapshot, _ n: Int) -> [LLShared.Todo] {
    // unfinished first, then what you've ticked today
    Array((s.todos.filter { !$0.done } + s.todos.filter { $0.done }).prefix(n))
}

// MARK: - 1. Quick log: add a to-do or log calories in one tap, plus what's important today

struct QuickLogView: View {
    @Environment(\.widgetFamily) var family
    var entry: LLEntry

    var body: some View {
        Group {
            if let s = entry.snap {
                if family == .systemSmall { small(s) } else { medium(s) }
            } else {
                SetupView()
            }
        }
        .llBackground()
    }

    func kcalBlock(_ s: LLShared.Snapshot) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text("Eaten today").font(LL.font(10, .bold)).foregroundStyle(LL.muted).textCase(.uppercase)
            HStack(alignment: .firstTextBaseline, spacing: 2) {
                Text("\(s.kcal)").font(LL.font(22, .heavy)).foregroundStyle(LL.ink).contentTransition(.numericText())
                Text("/ \(s.kcalTarget) kcal").font(LL.font(10, .semibold)).foregroundStyle(LL.muted)
            }
            Bar(value: LL.frac(s.kcal, s.kcalTarget), color: s.kcal > s.kcalTarget ? LL.coral : LL.gold)
        }
    }

    func small(_ s: LLShared.Snapshot) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            kcalBlock(s)
            if !s.next.isEmpty {
                Text(s.next).font(LL.font(10, .semibold)).foregroundStyle(LL.coral).lineLimit(2)
            }
            Spacer(minLength: 0)
            HStack(spacing: 6) {
                AddTodoPill()
                KcalPill(kcal: 250)
            }
        }
    }

    func medium(_ s: LLShared.Snapshot) -> some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 8) {
                kcalBlock(s)
                Spacer(minLength: 0)
                HStack(spacing: 4) {
                    Image(systemName: s.next.isEmpty ? "checkmark.seal.fill" : "exclamationmark.circle.fill")
                        .font(.system(size: 11, weight: .bold))
                    Text(s.next.isEmpty ? "\(s.questsDone)/\(s.questsTotal) quests done" : s.next)
                        .font(LL.font(11, .semibold)).lineLimit(2)
                }
                .foregroundStyle(s.next.isEmpty ? LL.green : LL.coral)
            }
            VStack(spacing: 6) {
                HStack(spacing: 6) {
                    AddTodoPill()
                    Link(destination: LL.logFood) { PillLabel(icon: "square.and.pencil", text: "Food", color: LL.lilac) }
                }
                HStack(spacing: 6) {
                    KcalPill(kcal: 100)
                    KcalPill(kcal: 250)
                }
                KcalPill(kcal: 500)
            }
            .frame(maxWidth: 150)
        }
    }
}

// MARK: - 2. Progress: quests, calories, steps, level and streak (also on the lock screen)

struct ProgressWidgetView: View {
    @Environment(\.widgetFamily) var family
    var entry: LLEntry

    var body: some View {
        Group {
            if let s = entry.snap {
                switch family {
                case .accessoryCircular: circular(s)
                case .accessoryRectangular: rectangular(s)
                case .systemSmall: small(s)
                default: medium(s)
                }
            } else if family == .accessoryCircular || family == .accessoryRectangular {
                Image(systemName: "sun.horizon.fill")
            } else {
                SetupView()
            }
        }
        .widgetURL(LL.home)
        .llBackground()
    }

    func circular(_ s: LLShared.Snapshot) -> some View {
        Gauge(value: LL.frac(s.questsDone, s.questsTotal)) {
            Image(systemName: "checkmark")
        } currentValueLabel: {
            Text("\(s.questsDone)/\(s.questsTotal)").font(LL.font(12, .bold))
        }
        .gaugeStyle(.accessoryCircularCapacity)
    }

    func rectangular(_ s: LLShared.Snapshot) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(spacing: 4) {
                Image(systemName: "flame.fill")
                Text("\(s.streak) day streak · Lv \(s.level)").font(LL.font(12, .bold))
            }
            Text("\(s.questsDone)/\(s.questsTotal) quests · \(s.steps.formatted()) steps").font(LL.font(11, .medium))
            Gauge(value: LL.frac(s.questsDone, s.questsTotal)) { EmptyView() }
                .gaugeStyle(.accessoryLinearCapacity)
        }
    }

    func small(_ s: LLShared.Snapshot) -> some View {
        VStack(spacing: 6) {
            ZStack {
                Ring(value: LL.frac(s.questsDone, s.questsTotal), color: LL.green, width: 9)
                VStack(spacing: 0) {
                    Text("\(s.questsDone)/\(s.questsTotal)").font(LL.font(20, .heavy)).foregroundStyle(LL.ink)
                    Text("quests").font(LL.font(10, .semibold)).foregroundStyle(LL.muted)
                }
            }
            .frame(width: 92, height: 92)
            HStack(spacing: 8) {
                Label("\(s.streak)", systemImage: "flame.fill").foregroundStyle(s.activeToday ? LL.coral : LL.muted)
                Label("Lv \(s.level)", systemImage: "star.fill").foregroundStyle(LL.gold)
            }
            .font(LL.font(11, .bold))
            .labelStyle(TightLabel())
        }
    }

    func ringStat(_ v: Double, _ c: Color, _ top: String, _ bottom: String) -> some View {
        VStack(spacing: 4) {
            ZStack {
                Ring(value: v, color: c, width: 7)
                Text(top).font(LL.font(12, .heavy)).foregroundStyle(LL.ink).minimumScaleFactor(0.6).lineLimit(1).padding(6)
            }
            .frame(width: 62, height: 62)
            Text(bottom).font(LL.font(10, .bold)).foregroundStyle(LL.muted).textCase(.uppercase)
        }
    }

    func medium(_ s: LLShared.Snapshot) -> some View {
        VStack(spacing: 10) {
            Header(s: s)
            HStack(spacing: 0) {
                ringStat(LL.frac(s.questsDone, s.questsTotal), LL.green, "\(s.questsDone)/\(s.questsTotal)", "Quests")
                Spacer(minLength: 0)
                ringStat(LL.frac(s.kcal, s.kcalTarget), s.kcal > s.kcalTarget ? LL.coral : LL.gold, "\(s.kcal)", "kcal")
                Spacer(minLength: 0)
                ringStat(LL.frac(s.steps, s.stepTarget), LL.sea, s.steps >= 1000 ? String(format: "%.1fk", Double(s.steps) / 1000) : "\(s.steps)", "Steps")
            }
            HStack(spacing: 6) {
                Text("Lv \(s.level)").font(LL.font(10, .bold)).foregroundStyle(LL.muted)
                Bar(value: s.xpPct, color: LL.lilac, height: 5)
                Text("Lv \(s.level + 1)").font(LL.font(10, .bold)).foregroundStyle(LL.muted)
            }
        }
    }
}

struct TightLabel: LabelStyle {
    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: 2) { configuration.icon; configuration.title }
    }
}

// MARK: - 3. To-dos: today's list, tick them off right there

struct TodosView: View {
    @Environment(\.widgetFamily) var family
    var entry: LLEntry

    var body: some View {
        Group {
            if let s = entry.snap {
                VStack(alignment: .leading, spacing: family == .systemLarge ? 9 : 6) {
                    HStack {
                        Text("Today").font(LL.font(15, .heavy)).foregroundStyle(LL.ink)
                        Text("\(s.questsDone)/\(s.questsTotal)").font(LL.font(12, .bold)).foregroundStyle(LL.muted)
                        Spacer()
                        Link(destination: LL.addTask) {
                            Image(systemName: "plus")
                                .font(.system(size: 12, weight: .heavy))
                                .foregroundStyle(.white)
                                .frame(width: 24, height: 24)
                                .background(LL.coral, in: Circle())
                        }
                    }
                    let list = openTodos(s, family == .systemLarge ? 8 : 3)
                    if list.isEmpty {
                        Spacer(minLength: 0)
                        Text("All clear. Tap + to add something.").font(LL.font(12, .medium)).foregroundStyle(LL.muted)
                        Spacer(minLength: 0)
                    } else {
                        ForEach(list) { TodoRow(t: $0) }
                        Spacer(minLength: 0)
                    }
                }
            } else {
                SetupView()
            }
        }
        .llBackground()
    }
}

// MARK: - 4. Island: a bit of everything

struct IslandView: View {
    @Environment(\.widgetFamily) var family
    var entry: LLEntry

    var body: some View {
        Group {
            if let s = entry.snap {
                if family == .systemLarge { large(s) } else { medium(s) }
            } else {
                SetupView()
            }
        }
        .llBackground()
    }

    func stats(_ s: LLShared.Snapshot) -> some View {
        VStack(spacing: 7) {
            Stat(label: "Quests", value: "\(s.questsDone)/\(s.questsTotal)", frac: LL.frac(s.questsDone, s.questsTotal), color: LL.green)
            Stat(label: "Food", value: "\(s.kcal) kcal", frac: LL.frac(s.kcal, s.kcalTarget), color: s.kcal > s.kcalTarget ? LL.coral : LL.gold)
            Stat(label: "Steps", value: s.steps.formatted(), frac: LL.frac(s.steps, s.stepTarget), color: LL.sea)
        }
    }

    func medium(_ s: LLShared.Snapshot) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Header(s: s)
            HStack(alignment: .top, spacing: 12) {
                stats(s).frame(maxWidth: .infinity)
                VStack(alignment: .leading, spacing: 6) {
                    ForEach(openTodos(s, 2)) { TodoRow(t: $0) }
                    Spacer(minLength: 0)
                    HStack(spacing: 6) {
                        AddTodoPill()
                        KcalPill(kcal: 250)
                    }
                }
                .frame(maxWidth: .infinity)
            }
        }
    }

    func large(_ s: LLShared.Snapshot) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Header(s: s)
            HStack(spacing: 6) {
                Text("Lv \(s.level)").font(LL.font(10, .bold)).foregroundStyle(LL.muted)
                Bar(value: s.xpPct, color: LL.lilac, height: 5)
            }
            stats(s)
            if !s.next.isEmpty {
                HStack(spacing: 4) {
                    Image(systemName: "exclamationmark.circle.fill").font(.system(size: 11, weight: .bold))
                    Text(s.next).font(LL.font(12, .semibold)).lineLimit(1)
                }
                .foregroundStyle(LL.coral)
            }
            Divider().overlay(LL.track)
            ForEach(openTodos(s, 4)) { TodoRow(t: $0) }
            Spacer(minLength: 0)
            HStack(spacing: 6) {
                AddTodoPill()
                Link(destination: LL.logFood) { PillLabel(icon: "square.and.pencil", text: "Food", color: LL.lilac) }
                KcalPill(kcal: 250)
            }
        }
    }
}

// MARK: - The widgets

struct QuickLogWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "LLQuickLog", provider: LLProvider()) { QuickLogView(entry: $0) }
            .configurationDisplayName("Quick log")
            .description("Add a to-do or log calories in one tap, and see what's due.")
            .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct ProgressWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "LLProgress", provider: LLProvider()) { ProgressWidgetView(entry: $0) }
            .configurationDisplayName("Progress")
            .description("Quests, calories, steps, your level and streak.")
            .supportedFamilies([.systemSmall, .systemMedium, .accessoryCircular, .accessoryRectangular])
    }
}

struct TodosWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "LLTodos", provider: LLProvider()) { TodosView(entry: $0) }
            .configurationDisplayName("To-dos")
            .description("Today's to-dos. Tick them off without opening the app.")
            .supportedFamilies([.systemMedium, .systemLarge])
    }
}

struct IslandWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "LLIsland", provider: LLProvider()) { IslandView(entry: $0) }
            .configurationDisplayName("Island")
            .description("A bit of everything: progress, to-dos and quick logging.")
            .supportedFamilies([.systemMedium, .systemLarge])
    }
}

@main
struct LifeListWidgets: WidgetBundle {
    var body: some Widget {
        QuickLogWidget()
        ProgressWidget()
        TodosWidget()
        IslandWidget()
    }
}
