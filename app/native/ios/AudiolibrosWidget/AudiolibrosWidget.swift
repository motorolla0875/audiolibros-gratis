// Widgets de Audiolibros Gratis para la pantalla de inicio del iPhone.
// Leen lo que la app deja en el grupo compartido (lo último que escuchaste y tus radios).
import WidgetKit
import SwiftUI

let GRUPO = "group.com.dmithbuilds.audiolibros"
let ROJO = Color(red: 235/255, green: 67/255, blue: 69/255)
let FONDO = Color(red: 14/255, green: 12/255, blue: 10/255)
let TINTA = Color(red: 244/255, green: 238/255, blue: 230/255)

struct Seguir: Codable { var titulo: String; var sub: String; var portada: String; var pct: Double; var vivo: Bool }
struct Radio: Codable { var id: String; var titulo: String; var portada: String }
struct Textos: Codable { var seguir: String; var radios: String; var vacio: String; var sinRadios: String; var vivo: String }
struct Datos: Codable { var seguir: Seguir?; var radios: [Radio]; var textos: Textos }

func leerDatos() -> Datos? {
  guard let txt = UserDefaults(suiteName: GRUPO)?.string(forKey: "datos"), let d = txt.data(using: .utf8) else { return nil }
  return try? JSONDecoder().decode(Datos.self, from: d)
}
// Baja una imagen chica (las portadas vienen de internet). Si falla, no muestra imagen.
func imagen(_ url: String) -> UIImage? {
  guard !url.isEmpty, let u = URL(string: url), let d = try? Data(contentsOf: u), let img = UIImage(data: d) else { return nil }
  let lado: CGFloat = 300
  let r = UIGraphicsImageRenderer(size: CGSize(width: lado, height: lado))
  return r.image { _ in img.draw(in: CGRect(x: 0, y: 0, width: lado, height: lado)) }
}

struct Entrada: TimelineEntry { let date: Date; let datos: Datos?; let portada: UIImage?; let logos: [String: UIImage] }

struct Proveedor: TimelineProvider {
  let conLogos: Bool
  func placeholder(in context: Context) -> Entrada { Entrada(date: Date(), datos: nil, portada: nil, logos: [:]) }
  func getSnapshot(in context: Context, completion: @escaping (Entrada) -> Void) { completion(armar()) }
  func getTimeline(in context: Context, completion: @escaping (Timeline<Entrada>) -> Void) {
    completion(Timeline(entries: [armar()], policy: .after(Date().addingTimeInterval(3 * 3600))))
  }
  func armar() -> Entrada {
    let d = leerDatos()
    var logos: [String: UIImage] = [:]
    if conLogos { for r in (d?.radios ?? []).prefix(4) { if let i = imagen(r.portada) { logos[r.id] = i } } }
    return Entrada(date: Date(), datos: d, portada: conLogos ? nil : imagen(d?.seguir?.portada ?? ""), logos: logos)
  }
}

// Fondo del widget: en iOS 17 o más nuevo hay que declararlo así.
extension View {
  @ViewBuilder func fondoWidget() -> some View {
    if #available(iOS 17.0, *) { self.containerBackground(FONDO, for: .widget) }
    else { self.padding().background(FONDO) }
  }
}

struct Tapa: View {
  let img: UIImage?; let lado: CGFloat
  var body: some View {
    Group {
      if let img = img { Image(uiImage: img).resizable().scaledToFill() }
      else { ZStack { Color(white: 0.16); Image(systemName: "headphones").font(.system(size: lado * 0.38, weight: .semibold)).foregroundColor(ROJO) } }
    }.frame(width: lado, height: lado).clipShape(RoundedRectangle(cornerRadius: lado * 0.14))
  }
}

struct VistaSeguir: View {
  @Environment(\.widgetFamily) var tam
  let e: Entrada
  var body: some View {
    let s = e.datos?.seguir, tx = e.datos?.textos
    Group {
      if let s = s {
        if tam == .systemSmall {
          VStack(alignment: .leading, spacing: 6) {
            HStack { Tapa(img: e.portada, lado: 58); Spacer(); Image(systemName: "play.circle.fill").font(.system(size: 30)).foregroundColor(ROJO) }
            Spacer(minLength: 0)
            Text(s.titulo).font(.system(size: 14, weight: .bold)).foregroundColor(TINTA).lineLimit(2)
            barra(s)
          }
        } else {
          HStack(spacing: 12) {
            Tapa(img: e.portada, lado: 100)
            VStack(alignment: .leading, spacing: 5) {
              Text((tx?.seguir ?? "").uppercased()).font(.system(size: 10, weight: .heavy)).foregroundColor(ROJO)
              Text(s.titulo).font(.system(size: 16, weight: .bold)).foregroundColor(TINTA).lineLimit(2)
              Text(s.sub).font(.system(size: 12)).foregroundColor(TINTA.opacity(0.65)).lineLimit(1)
              Spacer(minLength: 0)
              HStack { barra(s); Image(systemName: "play.circle.fill").font(.system(size: 28)).foregroundColor(ROJO) }
            }
          }
        }
      } else {
        VStack(spacing: 8) {
          Image(systemName: "headphones").font(.system(size: 30, weight: .semibold)).foregroundColor(ROJO)
          Text(tx?.vacio ?? "Audiolibros").font(.system(size: 13, weight: .semibold)).foregroundColor(TINTA).multilineTextAlignment(.center)
        }.frame(maxWidth: .infinity, maxHeight: .infinity)
      }
    }
    .widgetURL(URL(string: "audiolibros://seguir"))
    .fondoWidget()
  }
  @ViewBuilder func barra(_ s: Seguir) -> some View {
    if s.vivo {
      Text(e.datos?.textos.vivo ?? "LIVE").font(.system(size: 9, weight: .heavy)).foregroundColor(.white).padding(.horizontal, 6).padding(.vertical, 2).background(ROJO).cornerRadius(4)
    } else {
      GeometryReader { g in ZStack(alignment: .leading) {
        Capsule().fill(TINTA.opacity(0.18))
        Capsule().fill(ROJO).frame(width: max(4, g.size.width * CGFloat(s.pct)))
      } }.frame(height: 4)
    }
  }
}

struct VistaRadios: View {
  let e: Entrada
  var body: some View {
    let rs = e.datos?.radios ?? [], tx = e.datos?.textos
    VStack(alignment: .leading, spacing: 8) {
      HStack(spacing: 6) {
        Image(systemName: "dot.radiowaves.left.and.right").foregroundColor(ROJO)
        Text(tx?.radios ?? "").font(.system(size: 13, weight: .bold)).foregroundColor(TINTA)
      }
      if rs.isEmpty {
        Spacer(); Text(tx?.sinRadios ?? "").font(.system(size: 13)).foregroundColor(TINTA.opacity(0.7)); Spacer()
      } else {
        HStack(spacing: 10) {
          ForEach(rs.prefix(4), id: \.id) { r in
            Link(destination: URL(string: "audiolibros://radio/" + (r.id.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? r.id))!) {
              VStack(spacing: 4) {
                ZStack { TINTA; if let i = e.logos[r.id] { Image(uiImage: i).resizable().scaledToFit().padding(8) } else { Image(systemName: "radio").foregroundColor(ROJO) } }
                  .frame(width: 58, height: 58).clipShape(RoundedRectangle(cornerRadius: 12))
                Text(r.titulo).font(.system(size: 10, weight: .semibold)).foregroundColor(TINTA).lineLimit(1).frame(width: 62)
              }
            }
          }
          Spacer(minLength: 0)
        }
      }
    }
    .fondoWidget()
  }
}

struct WidgetSeguir: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "seguir", provider: Proveedor(conLogos: false)) { VistaSeguir(e: $0) }
      .configurationDisplayName("Seguí escuchando")
      .description("Retomá lo último que escuchaste con un toque.")
      .supportedFamilies([.systemSmall, .systemMedium])
  }
}
struct WidgetRadios: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "radios", provider: Proveedor(conLogos: true)) { VistaRadios(e: $0) }
      .configurationDisplayName("Tus radios")
      .description("Tus radios favoritas, en vivo con un toque.")
      .supportedFamilies([.systemMedium])
  }
}

@main
struct AudiolibrosWidgets: WidgetBundle {
  var body: some Widget { WidgetSeguir(); WidgetRadios() }
}
