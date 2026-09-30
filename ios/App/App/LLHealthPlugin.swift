import Foundation
import Capacitor
import HealthKit

/// Apple Health, read-only. LifeList reads steps, active energy, workouts and cycle
/// (menstrual flow) to fill in the Health Centre. It never asks to write, and never writes,
/// anything to Apple Health: every authorization request passes an empty share set.
@objc(LLHealthPlugin)
public class LLHealthPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "LLHealthPlugin"
    public let jsName = "LLHealth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "readDaily", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "readWorkouts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "readCycle", returnType: CAPPluginReturnPromise)
    ]

    private let store = HKHealthStore()

    private var readTypes: Set<HKObjectType> {
        var types: Set<HKObjectType> = [HKObjectType.workoutType()]
        if let t = HKObjectType.quantityType(forIdentifier: .stepCount) { types.insert(t) }
        if let t = HKObjectType.quantityType(forIdentifier: .activeEnergyBurned) { types.insert(t) }
        if let t = HKObjectType.categoryType(forIdentifier: .menstrualFlow) { types.insert(t) }
        return types
    }

    private static let dayFormat: DateFormatter = {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = TimeZone.current
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()

    private static func dayKey(_ d: Date) -> String { dayFormat.string(from: d) }

    private func startDay(_ days: Int) -> Date {
        let cal = Calendar.current
        let back = cal.date(byAdding: .day, value: -(days - 1), to: Date()) ?? Date()
        return cal.startOfDay(for: back)
    }

    private func days(_ call: CAPPluginCall, _ def: Int, _ maxDays: Int) -> Int {
        max(1, min(call.getInt("days") ?? def, maxDays))
    }

    @objc func isAvailable(_ call: CAPPluginCall) {
        call.resolve(["available": HKHealthStore.isHealthDataAvailable()])
    }

    @objc func requestAuthorization(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.resolve(["granted": false])
            return
        }
        // toShare is empty on purpose: read access only, nothing is ever written back.
        store.requestAuthorization(toShare: Set<HKSampleType>(), read: readTypes) { ok, error in
            if let error = error {
                call.reject(error.localizedDescription)
                return
            }
            call.resolve(["granted": ok])
        }
    }

    /// Daily totals of steps and active energy (kcal) for the last `days` days, keyed yyyy-MM-dd.
    @objc func readDaily(_ call: CAPPluginCall) {
        let n = days(call, 7, 120)
        let start = startDay(n)
        let end = Date()
        let group = DispatchGroup()
        let lock = NSLock()
        var steps: [String: Double] = [:]
        var kcal: [String: Double] = [:]

        func sum(_ id: HKQuantityTypeIdentifier, _ unit: HKUnit, _ put: @escaping (String, Double) -> Void) {
            guard let type = HKQuantityType.quantityType(forIdentifier: id) else { return }
            let query = HKStatisticsCollectionQuery(
                quantityType: type,
                quantitySamplePredicate: HKQuery.predicateForSamples(withStart: start, end: end, options: []),
                options: .cumulativeSum,
                anchorDate: start,
                intervalComponents: DateComponents(day: 1))
            group.enter()
            query.initialResultsHandler = { _, results, _ in
                results?.enumerateStatistics(from: start, to: end) { stat, _ in
                    if let v = stat.sumQuantity()?.doubleValue(for: unit) {
                        lock.lock()
                        put(LLHealthPlugin.dayKey(stat.startDate), v.rounded())
                        lock.unlock()
                    }
                }
                group.leave()
            }
            store.execute(query)
        }

        sum(.stepCount, HKUnit.count()) { k, v in steps[k] = v }
        sum(.activeEnergyBurned, HKUnit.kilocalorie()) { k, v in kcal[k] = v }
        group.notify(queue: .main) {
            call.resolve(["steps": steps, "activeKcal": kcal])
        }
    }

    /// Workouts in the last `days` days: start/end (ms), minutes, kcal and a simple kind.
    @objc func readWorkouts(_ call: CAPPluginCall) {
        let n = days(call, 14, 120)
        let predicate = HKQuery.predicateForSamples(withStart: startDay(n), end: Date(), options: [])
        let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)
        let query = HKSampleQuery(sampleType: HKObjectType.workoutType(), predicate: predicate, limit: 200, sortDescriptors: [sort]) { _, samples, error in
            if let error = error {
                call.reject(error.localizedDescription)
                return
            }
            let list: [[String: Any]] = (samples as? [HKWorkout] ?? []).map { w in
                var kcal = 0.0
                if #available(iOS 16.0, *), let t = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned) {
                    kcal = w.statistics(for: t)?.sumQuantity()?.doubleValue(for: .kilocalorie()) ?? 0
                } else {
                    kcal = w.totalEnergyBurned?.doubleValue(for: .kilocalorie()) ?? 0
                }
                return [
                    "id": w.uuid.uuidString,
                    "day": LLHealthPlugin.dayKey(w.startDate),
                    "start": w.startDate.timeIntervalSince1970 * 1000,
                    "end": w.endDate.timeIntervalSince1970 * 1000,
                    "minutes": (w.duration / 60).rounded(),
                    "kcal": kcal.rounded(),
                    "kind": LLHealthPlugin.kindName(w.workoutActivityType)
                ]
            }
            call.resolve(["workouts": list])
        }
        store.execute(query)
    }

    /// Menstrual flow entries in the last `days` days (days with "none" are left out).
    @objc func readCycle(_ call: CAPPluginCall) {
        guard let type = HKObjectType.categoryType(forIdentifier: .menstrualFlow) else {
            call.resolve(["flow": []])
            return
        }
        let n = days(call, 180, 400)
        let predicate = HKQuery.predicateForSamples(withStart: startDay(n), end: Date(), options: [])
        let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)
        let query = HKSampleQuery(sampleType: type, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: [sort]) { _, samples, error in
            if let error = error {
                call.reject(error.localizedDescription)
                return
            }
            var out: [[String: Any]] = []
            for s in samples as? [HKCategorySample] ?? [] {
                let level: String
                switch s.value {
                case HKCategoryValueMenstrualFlow.light.rawValue: level = "light"
                case HKCategoryValueMenstrualFlow.medium.rawValue: level = "medium"
                case HKCategoryValueMenstrualFlow.heavy.rawValue: level = "heavy"
                case HKCategoryValueMenstrualFlow.none.rawValue: continue
                default: level = "unspecified"
                }
                out.append(["day": LLHealthPlugin.dayKey(s.startDate), "flow": level])
            }
            call.resolve(["flow": out])
        }
        store.execute(query)
    }

    private static func kindName(_ t: HKWorkoutActivityType) -> String {
        switch t {
        case .walking: return "walk"
        case .running: return "run"
        case .cycling: return "cycle"
        case .swimming: return "swim"
        case .yoga: return "yoga"
        case .traditionalStrengthTraining, .functionalStrengthTraining: return "strength"
        case .highIntensityIntervalTraining: return "hiit"
        case .hiking: return "hike"
        case .dance: return "dance"
        case .soccer, .basketball, .tennis, .cricket, .rugby: return "sport"
        default: return "workout"
        }
    }
}
