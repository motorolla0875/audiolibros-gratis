// Copia la web (../public) a www/ para meterla dentro de la app.
// Los libros, podcasts y la carpeta contenido se piden al servidor (audiolibros.dmith.app).
const fs = require("fs"), path = require("path");
const ORIGEN = path.join(__dirname, "..", "..", "public"), DESTINO = path.join(__dirname, "..", "www");
fs.rmSync(DESTINO, { recursive: true, force: true });
fs.mkdirSync(DESTINO, { recursive: true });
for (const f of fs.readdirSync(ORIGEN)) {
  if (f === "contenido") continue;
  fs.cpSync(path.join(ORIGEN, f), path.join(DESTINO, f), { recursive: true });
}
console.log("www/ listo:", fs.readdirSync(DESTINO).join(", "));
