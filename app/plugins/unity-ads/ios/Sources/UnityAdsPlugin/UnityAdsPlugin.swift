import Foundation
import UIKit
import Capacitor
import UnityAds
import AppTrackingTransparency

// Anuncios de Unity Ads.
// initialize({ gameId, testMode? }) -> pide permiso de seguimiento (ATT) y arranca el SDK.
// preload({ placementId, rewarded }) -> deja un anuncio listo
// show({ placementId, rewarded }) -> { shown, completed, rewarded }
// En TestFlight se usan siempre anuncios de prueba, para no generar clics inválidos.
@objc(UnityAdsPlugin)
public class UnityAdsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "UnityAdsPlugin"
    public let jsName = "UnityAds"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "initialize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "preload", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "show", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "entorno", returnType: CAPPluginReturnPromise)
    ]

    private var iniciado = false
    private var iniciando: [CAPPluginCall] = []
    private var cargados: [String: AnyObject] = [:]   // placementId -> UADSRewardedAd / UADSInterstitialAd
    private var mostrando: Mostrador?
    private var anuncioEnPantalla: AnyObject?          // hay que retenerlo mientras se ve, si no queda en negro

    private var esTestFlight: Bool {
        Bundle.main.appStoreReceiptURL?.lastPathComponent == "sandboxReceipt"
    }

    // Dice si la app viene de TestFlight (para mostrar opciones de prueba que en el App Store no existen).
    @objc func entorno(_ call: CAPPluginCall) {
        call.resolve(["testFlight": esTestFlight])
    }

    @objc func initialize(_ call: CAPPluginCall) {
        guard let gameId = call.getString("gameId"), !gameId.isEmpty else { call.reject("Falta gameId"); return }
        if iniciado { call.resolve(["testMode": modoPrueba(call)]); return }
        iniciando.append(call)
        if iniciando.count > 1 { return }
        let prueba = modoPrueba(call)
        pedirSeguimiento {
            let cfg = UADSInitializationConfigurationBuilder(gameId: gameId).with(testMode: prueba).build()
            UnityAds.initialize(cfg) { [weak self] error in
                DispatchQueue.main.async {
                    guard let self = self else { return }
                    let llamadas = self.iniciando; self.iniciando = []
                    if let error = error {
                        llamadas.forEach { $0.reject(error.message) }
                    } else {
                        self.iniciado = true
                        llamadas.forEach { $0.resolve(["testMode": prueba]) }
                    }
                }
            }
        }
    }

    private func modoPrueba(_ call: CAPPluginCall) -> Bool {
        return call.getBool("testMode", false) || esTestFlight
    }

    // Permiso de "seguimiento" de Apple: solo se pregunta una vez; si dice que no, los anuncios no se personalizan.
    private func pedirSeguimiento(_ listo: @escaping () -> Void) {
        DispatchQueue.main.async {
            guard ATTrackingManager.trackingAuthorizationStatus == .notDetermined else { listo(); return }
            // Apple solo muestra la pregunta con la app activa en pantalla.
            if UIApplication.shared.applicationState != .active {
                var obs: NSObjectProtocol?
                obs = NotificationCenter.default.addObserver(forName: UIApplication.didBecomeActiveNotification, object: nil, queue: .main) { _ in
                    if let o = obs { NotificationCenter.default.removeObserver(o) }
                    ATTrackingManager.requestTrackingAuthorization { _ in listo() }
                }
                return
            }
            ATTrackingManager.requestTrackingAuthorization { _ in listo() }
        }
    }

    @objc func preload(_ call: CAPPluginCall) {
        guard let id = call.getString("placementId") else { call.reject("Falta placementId"); return }
        cargar(id, premio: call.getBool("rewarded", false)) { ok, msg in
            ok ? call.resolve() : call.reject(msg ?? "No se pudo cargar")
        }
    }

    private func cargar(_ id: String, premio: Bool, listo: @escaping (Bool, String?) -> Void) {
        if cargados[id] != nil { listo(true, nil); return }
        guard iniciado else { listo(false, "Unity Ads no está iniciado"); return }
        let cfg = UADSLoadConfigurationBuilder(placementId: id).build()
        if premio {
            UADSRewardedAd.load(cfg) { [weak self] ad, error in
                DispatchQueue.main.async {
                    if let ad = ad {
                        ad.onAdExpired = { [weak self] _ in DispatchQueue.main.async { self?.cargados[id] = nil } }
                        self?.cargados[id] = ad; listo(true, nil)
                    } else { listo(false, error?.message) }
                }
            }
        } else {
            UADSInterstitialAd.load(cfg) { [weak self] ad, error in
                DispatchQueue.main.async {
                    if let ad = ad {
                        ad.onAdExpired = { [weak self] _ in DispatchQueue.main.async { self?.cargados[id] = nil } }
                        self?.cargados[id] = ad; listo(true, nil)
                    } else { listo(false, error?.message) }
                }
            }
        }
    }

    @objc func show(_ call: CAPPluginCall) {
        guard let id = call.getString("placementId") else { call.reject("Falta placementId"); return }
        let premio = call.getBool("rewarded", false)
        cargar(id, premio: premio) { [weak self] ok, _ in
            guard let self = self else { return }
            guard ok, let ad = self.cargados.removeValue(forKey: id), let vc = self.bridge?.viewController else {
                call.resolve(["shown": false, "completed": false, "rewarded": false]); return
            }
            let fin: ([String: Any]) -> Void = { [weak self] res in
                call.resolve(res)
                self?.mostrando = nil
                self?.anuncioEnPantalla = nil
                self?.cargar(id, premio: premio) { _, _ in }   // deja el siguiente listo
            }
            let cfg = UADSShowConfigurationBuilder().with(viewController: vc).build()
            self.anuncioEnPantalla = ad
            let m: Mostrador
            if let r = ad as? UADSRewardedAd {
                let mp = MostradorPremio(fin); m = mp; self.mostrando = mp; r.show(cfg, delegate: mp)
            } else if let i = ad as? UADSInterstitialAd {
                let mc = MostradorCorte(fin); m = mc; self.mostrando = mc; i.show(cfg, delegate: mc)
            } else {
                self.anuncioEnPantalla = nil
                call.resolve(["shown": false, "completed": false, "rewarded": false])
                return
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 12) { [weak vc, weak m] in
                guard let m = m, !m.empezo, !m.terminado else { return }
                if let presentado = vc?.presentedViewController { presentado.dismiss(animated: false) }
                m.terminar(false, false, false)
            }
        }
    }
}

// Recibe los avisos del anuncio mientras se muestra (una clase por tipo: los dos
// protocolos usan los mismos nombres de método y no pueden convivir en la misma clase).
class Mostrador: NSObject {
    private let fin: ([String: Any]) -> Void
    private(set) var terminado = false
    var empezo = false, premio = false
    init(_ fin: @escaping ([String: Any]) -> Void) { self.fin = fin }

    func terminar(_ shown: Bool, _ completed: Bool, _ rewarded: Bool) {
        DispatchQueue.main.async {
            if self.terminado { return }
            self.terminado = true
            self.fin(["shown": shown, "completed": completed, "rewarded": rewarded])
        }
    }
}

class MostradorPremio: Mostrador, UADSRewardedShowDelegate {
    func showDidStart(_ unityAd: UADSRewardedAd) { empezo = true }
    func showDidClick(_ unityAd: UADSRewardedAd) {}
    func showDidReceiveReward(_ unityAd: UADSRewardedAd) { premio = true }
    func showDidComplete(_ unityAd: UADSRewardedAd, with finishState: UADSShowFinishState) {
        let completo = finishState == .completed
        terminar(true, completo, premio || completo)
    }
    func showDidFail(_ unityAd: UADSRewardedAd, error: UnityAdsError) { terminar(empezo, false, false) }
}

class MostradorCorte: Mostrador, UADSInterstitialShowDelegate {
    func showDidStart(_ unityAd: UADSInterstitialAd) { empezo = true }
    func showDidClick(_ unityAd: UADSInterstitialAd) {}
    func showDidComplete(_ unityAd: UADSInterstitialAd, with finishState: UADSShowFinishState) { terminar(true, finishState == .completed, false) }
    func showDidFail(_ unityAd: UADSInterstitialAd, error: UnityAdsError) { terminar(empezo, false, false) }
}
