import Foundation
import Capacitor
import WidgetKit

/// Bridge between the web app and the home-screen widgets.
@objc(LLWidgetPlugin)
public class LLWidgetPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "LLWidgetPlugin"
    public let jsName = "LLWidget"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "update", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "takeActions", returnType: CAPPluginReturnPromise)
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

    /// Taps made on the widgets since the app last looked (ticked to-dos, logged calories).
    @objc func takeActions(_ call: CAPPluginCall) {
        call.resolve(["actions": LLShared.takeActions()])
    }
}
