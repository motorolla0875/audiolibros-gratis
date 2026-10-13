import Foundation
import UIKit
import CarPlay
import AVFoundation
import MediaPlayer
import Capacitor

// ============================================================================
// CarPlay de Audiolibros.
//
// La app normal reproduce dentro de la página web. En el auto eso no alcanza:
// Apple pide que CarPlay funcione con el iPhone bloqueado y la app cerrada, y en
// ese caso la página no existe. Por eso CarPlay tiene su propio reproductor
// nativo (ReproductorAuto). La página le pasa la lista de cosas para mostrar
// (seguir escuchando, radios, podcasts) con `actualizar`, y CarPlay la guarda
// para tenerla aunque la app arranque directo desde el auto.
//
// Mientras suena el reproductor del auto, la página se pausa (evento
// "pausarWeb"); cuando la página vuelve a sonar, llama a `detener`.
// El avance escuchado en el auto se guarda y la página lo recupera con `progresos`.
// ============================================================================

// (El puente va primero: Capacitor toma el primer @objc(...) del archivo como nombre del plugin.)
// ---------- Puente con la página ----------

@objc(CarPlayPlugin)
public class CarPlayPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CarPlayPlugin"
    public let jsName = "CarPlay"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "actualizar", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "detener", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "progresos", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "estado", returnType: CAPPluginReturnPromise)
    ]

    override public func load() {
        NotificationCenter.default.addObserver(forName: AVISO_EMPEZO, object: nil, queue: .main) { [weak self] _ in
            self?.notifyListeners("pausarWeb", data: [:])
        }
    }

    // datos: texto JSON con { api, seguir, radios, radiosTop, podcasts, textos }
    @objc func actualizar(_ call: CAPPluginCall) {
        guard let datos = call.getString("datos"), let d = datos.data(using: .utf8), (try? JSONDecoder().decode(DatosAuto.self, from: d)) != nil else {
            call.reject("Datos inválidos"); return
        }
        if UserDefaults.standard.string(forKey: CLAVE_DATOS) != datos { UserDefaults.standard.set(datos, forKey: CLAVE_DATOS) }
        call.resolve()
    }

    // La página va a sonar: se apaga el reproductor del auto
    @objc func detener(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if ReproductorAuto.shared.activo { ReproductorAuto.shared.detener() }
            call.resolve()
        }
    }

    // Avance escuchado en el auto, para pasarlo a la página (y se borra)
    @objc func progresos(_ call: CAPPluginCall) {
        let todo = UserDefaults.standard.dictionary(forKey: CLAVE_PROGRESOS) ?? [:]
        UserDefaults.standard.removeObject(forKey: CLAVE_PROGRESOS)
        var lista: [[String: Any]] = []
        for (url, v) in todo { if var d = v as? [String: Any] { d["url"] = url; lista.append(d) } }
        call.resolve(["lista": lista])
    }

    @objc func estado(_ call: CAPPluginCall) {
        DispatchQueue.main.async { call.resolve(["sonando": ReproductorAuto.shared.activo]) }
    }
}

private let CLAVE_DATOS = "carplay.datos"
private let CLAVE_PROGRESOS = "carplay.progresos"
private let AVISO_EMPEZO = Notification.Name("audiolibros.carplay.empezo")

// ---------- Datos que manda la página ----------

struct PistaAuto: Codable {
    let titulo: String
    let url: String
}

struct ItemAuto: Codable {
    let titulo: String
    let autor: String?
    let portada: String?
    let tipo: String          // "libro", "podcast", "radio"
    let vivo: Bool?
    let pistas: [PistaAuto]
    let indice: Int
    let desde: Double?
    let pct: Double?
}

struct PodcastAuto: Codable {
    let id: String
    let titulo: String
    let portada: String?
}

struct DatosAuto: Codable {
    let api: String
    let seguir: [ItemAuto]
    let radios: [ItemAuto]
    let radiosTop: [ItemAuto]?
    let podcasts: [PodcastAuto]
    let textos: [String: String]?
}

func leerDatosAuto() -> DatosAuto? {
    guard let s = UserDefaults.standard.string(forKey: CLAVE_DATOS), let d = s.data(using: .utf8) else { return nil }
    return try? JSONDecoder().decode(DatosAuto.self, from: d)
}

// ---------- Imágenes (portadas) con caché chica ----------

final class Portadas {
    static let shared = Portadas()
    private let cache = NSCache<NSString, UIImage>()
    func traer(_ url: String?, listo: @escaping (UIImage?) -> Void) {
        guard let url = url, !url.isEmpty, let u = URL(string: url) else { listo(nil); return }
        if let img = cache.object(forKey: url as NSString) { listo(img); return }
        URLSession.shared.dataTask(with: u) { [weak self] data, _, _ in
            var img: UIImage? = nil
            if let data = data, let i = UIImage(data: data) {
                img = i
                self?.cache.setObject(i, forKey: url as NSString)
            }
            DispatchQueue.main.async { listo(img) }
        }.resume()
    }
}

// ---------- Reproductor nativo del auto ----------

final class ReproductorAuto: NSObject {
    static let shared = ReproductorAuto()

    private(set) var item: ItemAuto?
    private(set) var indice = 0
    private var player: AVPlayer?
    private var observadorTiempo: Any?
    private var finObs: NSObjectProtocol?
    private var comandos: [(MPRemoteCommand, Any)] = []
    private var portada: UIImage?
    var activo: Bool { player != nil }

    func reproducir(_ it: ItemAuto, indice i: Int, desde: Double?) {
        guard i >= 0, i < it.pistas.count, let u = URL(string: it.pistas[i].url) else { return }
        detener()
        item = it; indice = i
        let s = AVAudioSession.sharedInstance()
        try? s.setCategory(.playback, mode: it.tipo == "radio" ? .default : .spokenAudio)
        try? s.setActive(true)

        let p = AVPlayer(url: u)
        p.automaticallyWaitsToMinimizeStalling = true
        player = p
        let inicio = desde ?? progresoGuardado(it.pistas[i].url)
        if let t = inicio, t > 3, it.vivo != true {
            p.seek(to: CMTime(seconds: t - 3, preferredTimescale: 600))
        }
        p.play()

        observadorTiempo = p.addPeriodicTimeObserver(forInterval: CMTime(seconds: 5, preferredTimescale: 1), queue: .main) { [weak self] _ in
            self?.guardarProgreso(); self?.pintarInfo()
        }
        finObs = NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime, object: p.currentItem, queue: .main) { [weak self] _ in
            self?.alTerminar()
        }
        armarComandos()
        portada = nil
        pintarInfo()
        Portadas.shared.traer(it.portada) { [weak self] img in self?.portada = img; self?.pintarInfo() }
        NotificationCenter.default.post(name: AVISO_EMPEZO, object: nil)
    }

    func alternar() {
        guard let p = player else { return }
        if p.rate == 0 { p.play() } else { p.pause(); guardarProgreso() }
        pintarInfo()
    }

    func saltar(_ seg: Double) {
        guard let p = player, item?.vivo != true else { return }
        let t = max(0, p.currentTime().seconds + seg)
        p.seek(to: CMTime(seconds: t, preferredTimescale: 600)) { [weak self] _ in self?.pintarInfo() }
    }

    func pista(_ d: Int) {
        guard let it = item else { return }
        let n = indice + d
        if n >= 0, n < it.pistas.count { reproducir(it, indice: n, desde: 0) }
    }

    func detener() {
        guardarProgreso()
        if let o = observadorTiempo, let p = player { p.removeTimeObserver(o) }
        observadorTiempo = nil
        if let f = finObs { NotificationCenter.default.removeObserver(f) }
        finObs = nil
        player?.pause(); player = nil
        comandos.forEach { $0.0.removeTarget($0.1) }
        comandos = []
        if item != nil { MPNowPlayingInfoCenter.default().nowPlayingInfo = nil }
        item = nil
    }

    private func alTerminar() {
        guardarProgreso(final: true)
        if let it = item, it.tipo == "libro", indice + 1 < it.pistas.count { reproducir(it, indice: indice + 1, desde: 0) }
        else { pintarInfo() }
    }

    // Avance escuchado en el auto (la página lo recupera al abrirse)
    private func guardarProgreso(final: Bool = false) {
        guard let p = player, let it = item, it.vivo != true, indice < it.pistas.count else { return }
        let dur = p.currentItem?.duration.seconds ?? 0
        guard dur.isFinite, dur > 0 else { return }
        let t = final ? dur : p.currentTime().seconds
        var todo = UserDefaults.standard.dictionary(forKey: CLAVE_PROGRESOS) ?? [:]
        todo[it.pistas[indice].url] = ["t": t, "dur": dur, "ts": Date().timeIntervalSince1970 * 1000]
        UserDefaults.standard.set(todo, forKey: CLAVE_PROGRESOS)
    }

    private func progresoGuardado(_ url: String) -> Double? {
        let todo = UserDefaults.standard.dictionary(forKey: CLAVE_PROGRESOS) ?? [:]
        guard let d = todo[url] as? [String: Any], let t = d["t"] as? Double, let dur = d["dur"] as? Double, dur > 0, t / dur < 0.97 else { return nil }
        return t
    }

    private func pintarInfo() {
        guard let it = item, let p = player else { return }
        var info: [String: Any] = [
            MPMediaItemPropertyTitle: indice < it.pistas.count ? it.pistas[indice].titulo : it.titulo,
            MPMediaItemPropertyArtist: it.tipo == "podcast" || it.tipo == "libro" ? it.titulo : (it.autor ?? ""),
            MPNowPlayingInfoPropertyPlaybackRate: p.rate,
            MPNowPlayingInfoPropertyIsLiveStream: it.vivo == true
        ]
        let dur = p.currentItem?.duration.seconds ?? 0
        if it.vivo != true, dur.isFinite, dur > 0 {
            info[MPMediaItemPropertyPlaybackDuration] = dur
            info[MPNowPlayingInfoPropertyElapsedPlaybackTime] = p.currentTime().seconds
        }
        if let img = portada {
            info[MPMediaItemPropertyArtwork] = MPMediaItemArtwork(boundsSize: img.size) { _ in img }
        }
        MPNowPlayingInfoCenter.default().nowPlayingInfo = info
    }

    private func armarComandos() {
        let c = MPRemoteCommandCenter.shared()
        func agregar(_ cmd: MPRemoteCommand, _ fn: @escaping () -> Void) {
            cmd.isEnabled = true
            let token = cmd.addTarget { _ in fn(); return .success }
            comandos.append((cmd, token))
        }
        agregar(c.playCommand) { [weak self] in if self?.player?.rate == 0 { self?.alternar() } }
        agregar(c.pauseCommand) { [weak self] in if (self?.player?.rate ?? 0) > 0 { self?.alternar() } }
        agregar(c.togglePlayPauseCommand) { [weak self] in self?.alternar() }
        if item?.vivo != true {
            c.skipForwardCommand.preferredIntervals = [30]
            c.skipBackwardCommand.preferredIntervals = [15]
            agregar(c.skipForwardCommand) { [weak self] in self?.saltar(30) }
            agregar(c.skipBackwardCommand) { [weak self] in self?.saltar(-15) }
        }
        if item?.tipo == "libro" {
            agregar(c.nextTrackCommand) { [weak self] in self?.pista(1) }
            agregar(c.previousTrackCommand) { [weak self] in self?.pista(-1) }
        }
    }
}

// ---------- Pantallas del auto ----------

@objc(AudiolibrosCarPlay)
public class AudiolibrosCarPlay: UIResponder, CPTemplateApplicationSceneDelegate {
    private var ic: CPInterfaceController?

    public func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene, didConnect interfaceController: CPInterfaceController) {
        ic = interfaceController
        interfaceController.setRootTemplate(armarPestanas(), animated: false, completion: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(refrescar), name: UserDefaults.didChangeNotification, object: nil)
    }

    public func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene, didDisconnectInterfaceController interfaceController: CPInterfaceController) {
        NotificationCenter.default.removeObserver(self, name: UserDefaults.didChangeNotification, object: nil)
        ic = nil
    }

    private var ultimoDatos: String?
    @objc private func refrescar() {
        let s = UserDefaults.standard.string(forKey: CLAVE_DATOS)
        guard s != ultimoDatos else { return }
        DispatchQueue.main.async { [weak self] in
            guard let self = self, let ic = self.ic, ic.templates.count <= 1 else { return }
            ic.setRootTemplate(self.armarPestanas(), animated: false, completion: nil)
        }
    }

    private func texto(_ d: DatosAuto?, _ k: String, _ def: String) -> String { d?.textos?[k] ?? def }

    private func armarPestanas() -> CPTabBarTemplate {
        let d = leerDatosAuto()
        ultimoDatos = UserDefaults.standard.string(forKey: CLAVE_DATOS)

        let seguir = lista(texto(d, "seguir", "Seguir escuchando"), d?.seguir ?? [], vacio: texto(d, "vacioSeguir", "Elegí algo en el teléfono para empezar"))
        seguir.tabImage = UIImage(systemName: "play.circle")

        var radios = d?.radios ?? []
        var tituloRadios = texto(d, "radios", "Tus radios")
        if radios.isEmpty, let top = d?.radiosTop, !top.isEmpty { radios = top; tituloRadios = texto(d, "radiosTop", "Radios") }
        let r = lista(tituloRadios, radios, vacio: texto(d, "vacioRadios", "Guardá radios con la ★ en el teléfono"))
        r.tabImage = UIImage(systemName: "dot.radiowaves.left.and.right")

        let pods = listaPodcasts(d)
        pods.tabImage = UIImage(systemName: "mic")

        return CPTabBarTemplate(templates: [seguir, r, pods])
    }

    private func lista(_ titulo: String, _ items: [ItemAuto], vacio: String) -> CPListTemplate {
        let max = CPListTemplate.maximumItemCount
        let filas: [CPListItem] = items.prefix(max).map { it in
            let sub = it.vivo == true ? (it.autor ?? "") : (it.indice < it.pistas.count ? it.pistas[it.indice].titulo : (it.autor ?? ""))
            let fila = CPListItem(text: it.titulo, detailText: sub, image: nil)
            if let pct = it.pct, pct > 0 { fila.playbackProgress = CGFloat(min(1, pct)) }
            Portadas.shared.traer(it.portada) { img in fila.setImage(img) }
            fila.handler = { [weak self] _, listo in
                ReproductorAuto.shared.reproducir(it, indice: it.indice, desde: it.desde)
                self?.mostrarReproduciendo()
                listo()
            }
            return fila
        }
        let t = CPListTemplate(title: titulo, sections: [CPListSection(items: filas)])
        t.tabTitle = titulo
        t.emptyViewTitleVariants = [vacio]
        return t
    }

    private func listaPodcasts(_ d: DatosAuto?) -> CPListTemplate {
        let titulo = texto(d, "podcasts", "Podcasts")
        let max = CPListTemplate.maximumItemCount
        let filas: [CPListItem] = (d?.podcasts ?? []).prefix(max).map { pod in
            let fila = CPListItem(text: pod.titulo, detailText: nil, image: nil, accessoryImage: nil, accessoryType: .disclosureIndicator)
            Portadas.shared.traer(pod.portada) { img in fila.setImage(img) }
            fila.handler = { [weak self] _, listo in
                self?.abrirPodcast(pod, api: d?.api ?? "", listo: listo)
            }
            return fila
        }
        let t = CPListTemplate(title: titulo, sections: [CPListSection(items: filas)])
        t.tabTitle = titulo
        t.emptyViewTitleVariants = [texto(d, "vacioPodcasts", "Seguí podcasts en el teléfono")]
        return t
    }

    // Trae los episodios del podcast desde nuestro servidor
    private func abrirPodcast(_ pod: PodcastAuto, api: String, listo: @escaping () -> Void) {
        guard let u = URL(string: api + "/api/podcast/" + (pod.id.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? pod.id)) else { listo(); return }
        URLSession.shared.dataTask(with: u) { [weak self] data, _, _ in
            var eps: [[String: Any]] = []
            if let data = data, let j = try? JSONSerialization.jsonObject(with: data) as? [String: Any], let e = j["episodios"] as? [[String: Any]] { eps = e.filter { $0["url"] is String } }
            DispatchQueue.main.async {
                guard let self = self, let ic = self.ic else { listo(); return }
                // Las direcciones que empiezan con "/" son de nuestro servidor
                func completa(_ u: String?) -> String? { guard let u = u else { return nil }; return u.hasPrefix("/") ? api + u : u }
                let pistas: [PistaAuto] = eps.compactMap { e in
                    guard let url = completa(e["url"] as? String) else { return nil }
                    return PistaAuto(titulo: (e["titulo"] as? String) ?? "", url: url)
                }
                let max = CPListTemplate.maximumItemCount
                let filas: [CPListItem] = pistas.prefix(max).enumerated().map { (i, p) in
                    let fila = CPListItem(text: p.titulo, detailText: pod.titulo, image: nil)
                    let portadaEp = completa(eps[i]["portada"] as? String) ?? pod.portada
                    Portadas.shared.traer(portadaEp ?? pod.portada) { img in fila.setImage(img) }
                    fila.handler = { [weak self] _, fin in
                        let it = ItemAuto(titulo: pod.titulo, autor: nil, portada: portadaEp ?? pod.portada, tipo: "podcast", vivo: false, pistas: [p], indice: 0, desde: nil, pct: nil)
                        ReproductorAuto.shared.reproducir(it, indice: 0, desde: nil)
                        self?.mostrarReproduciendo()
                        fin()
                    }
                    return fila
                }
                let t = CPListTemplate(title: pod.titulo, sections: [CPListSection(items: filas)])
                t.emptyViewTitleVariants = ["Sin episodios"]
                ic.pushTemplate(t, animated: true, completion: nil)
                listo()
            }
        }.resume()
    }

    private func mostrarReproduciendo() {
        guard let ic = ic else { return }
        if ic.topTemplate === CPNowPlayingTemplate.shared { return }
        ic.pushTemplate(CPNowPlayingTemplate.shared, animated: true, completion: nil)
    }
}
