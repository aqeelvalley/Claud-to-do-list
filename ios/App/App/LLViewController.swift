import UIKit
import Capacitor

/// The app's web view. Registers LifeList's own native plugins:
/// Apple Health (read-only) and the home-screen widgets bridge.
class LLViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(LLHealthPlugin())
        bridge?.registerPluginInstance(LLWidgetPlugin())
    }
}
