import Foundation
import Capacitor
import WidgetKit
import UIKit

/// Bridge between the web app and the home-screen widgets.
@objc(LLWidgetPlugin)
public class LLWidgetPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "LLWidgetPlugin"
    public let jsName = "LLWidget"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "update", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "takeActions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise)
    ]

    /// Store today's snapshot (JSON) for the widgets and ask iOS to redraw them.
    @objc func update(_ call: CAPPluginCall) {
        guard let json = call.getString("data") else {
            call.reject("missing data")
            return
        }
        LLShared.saveRaw(json)
        WidgetCenter.shared.reloadAllTimelines()
        call.resolve()
    }

    /// Diagnostics for Settings: are the widgets inside this install, and can they share data with the app?
    @objc func status(_ call: CAPPluginCall) {
        var plugins: [String] = []
        if let url = Bundle.main.builtInPlugInsURL,
           let items = try? FileManager.default.contentsOfDirectory(atPath: url.path) {
            plugins = items
        }
        var widgetInfo: [String: Any] = [:]
        if let url = Bundle.main.builtInPlugInsURL?.appendingPathComponent("LifeListWidgetExtension.appex"),
           let b = Bundle(url: url) {
            widgetInfo["bundleId"] = b.bundleIdentifier ?? ""
            widgetInfo["minOS"] = b.object(forInfoDictionaryKey: "MinimumOSVersion") as? String ?? ""
            widgetInfo["hasExecutable"] = b.executableURL.map { FileManager.default.fileExists(atPath: $0.path) } ?? false
        }
        let group = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: LLShared.group) != nil
        WidgetCenter.shared.getCurrentConfigurations { result in
            var placed = -1
            var err = ""
            switch result {
            case .success(let list): placed = list.count
            case .failure(let e): err = e.localizedDescription
            }
            call.resolve([
                "appBundleId": Bundle.main.bundleIdentifier ?? "",
                "iosVersion": UIDevice.current.systemVersion,
                "plugins": plugins,
                "widget": widgetInfo,
                "appGroup": group,
                "snapshotSaved": LLShared.defaults?.string(forKey: LLShared.snapKey) != nil,
                "placedWidgets": placed,
                "error": err
            ])
        }
    }

    /// Taps made on the widgets since the app last looked (ticked to-dos, logged calories).
    @objc func takeActions(_ call: CAPPluginCall) {
        call.resolve(["actions": LLShared.takeActions()])
    }
}
