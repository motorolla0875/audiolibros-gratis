"use strict";
// Audiolibros Gratis — app.

// ================= Base =================
const NATIVO = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
const PLUG = (window.Capacitor && window.Capacitor.Plugins) || {};
const API = NATIVO ? "https://audiolibros.dmith.app" : "";
const VERSION = "1.0.0";
const abs = u => (u && u.startsWith("/")) ? API + u : u;
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ICO = {
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  pause:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
  carga:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 9 9"/></svg>',
  mas:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  ok:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="m5 12 5 5 9-10"/></svg>',
  volver:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="m15 18-6-6 6-6"/></svg>',
  playC:'<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><path d="M10 8.5v7l5.5-3.5z" fill="currentColor"/></svg>',
  bajar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/></svg>',
  bajado:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="m7.5 12.5 3 3 6-6.5" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ajustes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  auris:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 15v-3a8 8 0 0 1 16 0v3" stroke="var(--accent)" stroke-width="2.4" stroke-linecap="round"/><rect x="2.5" y="13.5" width="5" height="8" rx="2" fill="currentColor"/><rect x="16.5" y="13.5" width="5" height="8" rx="2" fill="currentColor"/></svg>',
  cast:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 16a5 5 0 0 1 5 5M2 12a9 9 0 0 1 9 9M2 8.1A13 13 0 0 1 15 21"/><path d="M2 5V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1h-4"/></svg>',
  libro:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z"/></svg>'
};

// ================= Textos en 3 idiomas =================
const TX = {
  es: {
    tabInicio:"Inicio", tabClips:"Clips", tabBuscar:"Buscar", clipPodcast:"Podcast", clipLibro:"Audiolibro", completo:"Completo", guardarClip:"Guardar", siguienteClip:"Siguiente", tocaEmpezar:"Tocá para empezar", reiniciarGustos:"Empezar de cero las recomendaciones", gustosTxt:"Clips aprende qué temas te gustan según lo que escuchás y lo que pasás. Se guarda solo en tu teléfono.", gustosOk:"Listo, Clips vuelve a empezar.", deslizaTxt:"Deslizá para arriba para el siguiente", sinClips:"No hay clips por ahora. Probá en un rato.", tabPodcasts:"Podcasts", tabBiblioteca:"Biblioteca",
    escuchar:"Escuchar", transmitir:"Transmitir a la tele", castPrimero:"Poné algo para escuchar y después tocá transmitir.", castNo:"No encontramos una tele o parlante cerca. Fijate que estén en la misma red Wi-Fi.", seguirEsc:"Seguir escuchando", miLista:"Mi lista", enMiLista:"En mi lista", masInfo:"Más información", verTodo:"Ver todo",
    pie:"Audiolibros de dominio público grabados por voluntarios de LibriVox y alojados en archive.org.<br>Podcasts del directorio público de Apple Podcasts.",
    buscar:"Buscar", buscarPh:"Títulos, autores, podcasts", porGenero:"Audiolibros por género", porTema:"Podcasts por tema",
    sinRes:"Sin resultados", sinResTxt:'No encontramos nada con "{0}". Probá con el autor o con otra palabra.',
    audiolibros:"Audiolibros", podcasts:"Podcasts", audiolibrosGratis:"Audiolibros gratis", masEscuchados:"Más escuchados",
    nadaAca:"Nada por acá todavía", otroGenero:"Probá con otro género.", cargarMas:"Cargar más",
    tusPods:"Tus podcasts", temas:"Temas", losMas:"Los más escuchados", top50:"Top 50", paisRanking:"País de los rankings",
    biblioteca:"Biblioteca", escuchando:"Escuchando", descargas:"Descargas",
    vacioEsc:"Todavía no escuchaste nada", vacioEscTxt:"Lo que empieces a escuchar aparece acá para seguir donde lo dejaste.",
    vacioLista:"Tu lista está vacía", vacioListaTxt:'Tocá "+ Mi lista" en cualquier libro para guardarlo.',
    vacioPods:"No seguís ningún podcast", vacioPodsTxt:'Tocá "Seguir" en un podcast y lo vas a tener siempre a mano.',
    vacioDesc:"No tenés descargas", vacioDescTxt:"Tocá la flecha ↓ en un capítulo o episodio para escucharlo sin internet.",
    gratis:"Gratis", capitulo:"capítulo", capitulos:"capítulos", capitulosT:"Capítulos", tresVoces:"3 voces",
    leerMas:"Leer más", leidoPor:"Leído por {0}", quedan:"quedan {0}", dominioPublico:"Dominio público",
    comprarPapel:"Comprar en papel", avisoAfiliado:"Te llevamos a una tienda. Si comprás, recibimos una pequeña comisión y a vos no te cuesta más.",
    episodios:"episodios", episodiosT:"Episodios", seguir:"Seguir", siguiendo:"Siguiendo", escuchado:"Escuchado",
    sinEpisodios:"Este podcast no tiene episodios para escuchar.", audioPodcast:"El audio se reproduce desde el servidor del podcast.",
    ahoraSeguis:"Ahora seguís {0}.", agregadoLista:"Agregado a Mi lista.", sacadoLista:"Lo sacamos de tu lista.",
    hoy:"Hoy", ayer:"Ayer", haceDias:"Hace {0} días",
    capituloDe:"Capítulo {0} de {1}", podcast:"Podcast", dormir:"Dormir", finCap:"Fin del capítulo", verFicha:"Ver ficha",
    vozNarrador:"Voz del narrador", texto:"Texto", apagarEn:"Apagar en…", desactivado:"Desactivado", min15:"15 minutos", min30:"30 minutos", min45:"45 minutos", hora1:"1 hora", alTerminar:"Al terminar el capítulo",
    buenasNoches:"Buenas noches. Seguís mañana desde acá.", noAudio:"No pudimos reproducir este audio. Probá con otro capítulo.",
    algoFallo:"Uy, algo falló", reintentar:"Reintentar", noCargo:"No pudimos cargar esto.", sinInternet:"Estás sin internet. Podés escuchar tus descargas.", verDescargas:"Ver descargas",
    descargar:"Descargar", descargarTodo:"Descargar todo", descargando:"Descargando…", descargado:"Descargado", borrarDescarga:"¿Borrar esta descarga?", borrado:"Descarga borrada.",
    descargaLista:"Listo, ya lo podés escuchar sin internet.", descargaError:"No se pudo descargar. Revisá tu conexión.", descargaWeb:"Este audio no se puede descargar desde el navegador. En la app sí.", sinEspacio:"No hay espacio suficiente en el teléfono.",
    ajustes:"Ajustes", idioma:"Idioma", idiomaTxt:"Cambia la app y también los libros y podcasts que te mostramos.",
    espacio:"Espacio usado", borrarTodas:"Borrar todas las descargas", borrarTodasQ:"¿Borrar todas las descargas?", acerca:"Acerca de",
    privacidad:"Política de privacidad", terminos:"Términos de uso", contacto:"Contacto", creditos:"Créditos", version:"Versión",
    creditosTxt:"Los audiolibros son grabaciones de dominio público de LibriVox (librivox.org), alojadas en el Internet Archive (archive.org). Los podcasts pertenecen a sus autores y se reproducen desde sus propios servidores. Narraciones propias con voz digital Kokoro.",
    cancelar:"Cancelar", borrar:"Borrar"
  },
  en: {
    tabInicio:"Home", tabClips:"Clips", tabBuscar:"Search", clipPodcast:"Podcast", clipLibro:"Audiobook", completo:"Full", guardarClip:"Save", siguienteClip:"Next", tocaEmpezar:"Tap to start", reiniciarGustos:"Reset recommendations", gustosTxt:"Clips learns which topics you like from what you listen to and skip. It's stored only on your phone.", gustosOk:"Done, Clips starts fresh.", deslizaTxt:"Swipe up for the next one", sinClips:"No clips right now. Try again soon.", tabPodcasts:"Podcasts", tabBiblioteca:"Library",
    escuchar:"Listen", transmitir:"Cast to TV", castPrimero:"Start playing something, then tap cast.", castNo:"No TV or speaker found nearby. Make sure they\'re on the same Wi-Fi.", seguirEsc:"Continue listening", miLista:"My list", enMiLista:"In my list", masInfo:"More info", verTodo:"See all",
    pie:"Public domain audiobooks recorded by LibriVox volunteers and hosted on archive.org.<br>Podcasts from the public Apple Podcasts directory.",
    buscar:"Search", buscarPh:"Titles, authors, podcasts", porGenero:"Audiobooks by genre", porTema:"Podcasts by topic",
    sinRes:"No results", sinResTxt:'We found nothing for "{0}". Try the author or another word.',
    audiolibros:"Audiobooks", podcasts:"Podcasts", audiolibrosGratis:"Free audiobooks", masEscuchados:"Most listened",
    nadaAca:"Nothing here yet", otroGenero:"Try another genre.", cargarMas:"Load more",
    tusPods:"Your podcasts", temas:"Topics", losMas:"Top podcasts", top50:"Top 50", paisRanking:"Chart country",
    biblioteca:"Library", escuchando:"Listening", descargas:"Downloads",
    vacioEsc:"You haven't listened to anything yet", vacioEscTxt:"Whatever you start shows up here so you can pick up where you left off.",
    vacioLista:"Your list is empty", vacioListaTxt:'Tap "+ My list" on any book to save it.',
    vacioPods:"You don't follow any podcasts", vacioPodsTxt:'Tap "Follow" on a podcast to keep it handy.',
    vacioDesc:"No downloads", vacioDescTxt:"Tap the ↓ arrow on a chapter or episode to listen offline.",
    gratis:"Free", capitulo:"chapter", capitulos:"chapters", capitulosT:"Chapters", tresVoces:"3 voices",
    leerMas:"Read more", leidoPor:"Read by {0}", quedan:"{0} left", dominioPublico:"Public domain",
    comprarPapel:"Buy the paperback", avisoAfiliado:"We'll take you to a store. If you buy, we get a small commission at no extra cost to you.",
    episodios:"episodes", episodiosT:"Episodes", seguir:"Follow", siguiendo:"Following", escuchado:"Played",
    sinEpisodios:"This podcast has no episodes to play.", audioPodcast:"Audio plays from the podcast's own server.",
    ahoraSeguis:"You now follow {0}.", agregadoLista:"Added to My list.", sacadoLista:"Removed from your list.",
    hoy:"Today", ayer:"Yesterday", haceDias:"{0} days ago",
    capituloDe:"Chapter {0} of {1}", podcast:"Podcast", dormir:"Sleep", finCap:"End of chapter", verFicha:"Details",
    vozNarrador:"Narrator voice", texto:"Text", apagarEn:"Stop playing in…", desactivado:"Off", min15:"15 minutes", min30:"30 minutes", min45:"45 minutes", hora1:"1 hour", alTerminar:"At the end of the chapter",
    buenasNoches:"Good night. Pick up from here tomorrow.", noAudio:"We couldn't play this audio. Try another chapter.",
    algoFallo:"Oops, something went wrong", reintentar:"Try again", noCargo:"We couldn't load this.", sinInternet:"You're offline. You can listen to your downloads.", verDescargas:"See downloads",
    descargar:"Download", descargarTodo:"Download all", descargando:"Downloading…", descargado:"Downloaded", borrarDescarga:"Delete this download?", borrado:"Download deleted.",
    descargaLista:"Done, you can listen offline now.", descargaError:"Couldn't download. Check your connection.", descargaWeb:"This audio can't be downloaded in the browser. It works in the app.", sinEspacio:"Not enough space on your phone.",
    ajustes:"Settings", idioma:"Language", idiomaTxt:"Changes the app and the books and podcasts we show you.",
    espacio:"Space used", borrarTodas:"Delete all downloads", borrarTodasQ:"Delete all downloads?", acerca:"About",
    privacidad:"Privacy policy", terminos:"Terms of use", contacto:"Contact", creditos:"Credits", version:"Version",
    creditosTxt:"Audiobooks are public domain recordings from LibriVox (librivox.org), hosted by the Internet Archive (archive.org). Podcasts belong to their creators and play from their own servers. Our own narrations use the Kokoro digital voice.",
    cancelar:"Cancel", borrar:"Delete"
  },
  pt: {
    tabInicio:"Início", tabClips:"Clips", tabBuscar:"Buscar", clipPodcast:"Podcast", clipLibro:"Audiolivro", completo:"Completo", guardarClip:"Salvar", siguienteClip:"Próximo", tocaEmpezar:"Toque para começar", reiniciarGustos:"Recomeçar as recomendações", gustosTxt:"Clips aprende quais temas você gosta pelo que ouve e pula. Fica salvo só no seu celular.", gustosOk:"Pronto, Clips recomeça.", deslizaTxt:"Deslize para cima para o próximo", sinClips:"Não há clips agora. Tente daqui a pouco.", tabPodcasts:"Podcasts", tabBiblioteca:"Biblioteca",
    escuchar:"Ouvir", transmitir:"Transmitir para a TV", castPrimero:"Coloque algo para ouvir e depois toque em transmitir.", castNo:"Não encontramos uma TV ou caixa de som por perto. Verifique se estão na mesma rede Wi-Fi.", seguirEsc:"Continuar ouvindo", miLista:"Minha lista", enMiLista:"Na minha lista", masInfo:"Mais informações", verTodo:"Ver tudo",
    pie:"Audiolivros de domínio público gravados por voluntários do LibriVox e hospedados no archive.org.<br>Podcasts do diretório público do Apple Podcasts.",
    buscar:"Buscar", buscarPh:"Títulos, autores, podcasts", porGenero:"Audiolivros por gênero", porTema:"Podcasts por tema",
    sinRes:"Nenhum resultado", sinResTxt:'Não encontramos nada para "{0}". Tente o autor ou outra palavra.',
    audiolibros:"Audiolivros", podcasts:"Podcasts", audiolibrosGratis:"Audiolivros grátis", masEscuchados:"Mais ouvidos",
    nadaAca:"Nada por aqui ainda", otroGenero:"Tente outro gênero.", cargarMas:"Carregar mais",
    tusPods:"Seus podcasts", temas:"Temas", losMas:"Os mais ouvidos", top50:"Top 50", paisRanking:"País dos rankings",
    biblioteca:"Biblioteca", escuchando:"Ouvindo", descargas:"Downloads",
    vacioEsc:"Você ainda não ouviu nada", vacioEscTxt:"O que você começar a ouvir aparece aqui para continuar de onde parou.",
    vacioLista:"Sua lista está vazia", vacioListaTxt:'Toque em "+ Minha lista" em qualquer livro para salvá-lo.',
    vacioPods:"Você não segue nenhum podcast", vacioPodsTxt:'Toque em "Seguir" em um podcast para tê-lo sempre à mão.',
    vacioDesc:"Nenhum download", vacioDescTxt:"Toque na seta ↓ de um capítulo ou episódio para ouvir sem internet.",
    gratis:"Grátis", capitulo:"capítulo", capitulos:"capítulos", capitulosT:"Capítulos", tresVoces:"3 vozes",
    leerMas:"Ler mais", leidoPor:"Lido por {0}", quedan:"faltam {0}", dominioPublico:"Domínio público",
    comprarPapel:"Comprar o livro impresso", avisoAfiliado:"Levamos você a uma loja. Se comprar, recebemos uma pequena comissão sem custo extra para você.",
    episodios:"episódios", episodiosT:"Episódios", seguir:"Seguir", siguiendo:"Seguindo", escuchado:"Ouvido",
    sinEpisodios:"Este podcast não tem episódios para ouvir.", audioPodcast:"O áudio toca a partir do servidor do podcast.",
    ahoraSeguis:"Agora você segue {0}.", agregadoLista:"Adicionado à Minha lista.", sacadoLista:"Removido da sua lista.",
    hoy:"Hoje", ayer:"Ontem", haceDias:"Há {0} dias",
    capituloDe:"Capítulo {0} de {1}", podcast:"Podcast", dormir:"Dormir", finCap:"Fim do capítulo", verFicha:"Ver ficha",
    vozNarrador:"Voz do narrador", texto:"Texto", apagarEn:"Desligar em…", desactivado:"Desativado", min15:"15 minutos", min30:"30 minutos", min45:"45 minutos", hora1:"1 hora", alTerminar:"Ao terminar o capítulo",
    buenasNoches:"Boa noite. Continue amanhã daqui.", noAudio:"Não conseguimos tocar este áudio. Tente outro capítulo.",
    algoFallo:"Ops, algo deu errado", reintentar:"Tentar de novo", noCargo:"Não conseguimos carregar isto.", sinInternet:"Você está sem internet. Pode ouvir seus downloads.", verDescargas:"Ver downloads",
    descargar:"Baixar", descargarTodo:"Baixar tudo", descargando:"Baixando…", descargado:"Baixado", borrarDescarga:"Apagar este download?", borrado:"Download apagado.",
    descargaLista:"Pronto, já dá para ouvir sem internet.", descargaError:"Não foi possível baixar. Verifique sua conexão.", descargaWeb:"Este áudio não pode ser baixado no navegador. No app, sim.", sinEspacio:"Não há espaço suficiente no celular.",
    ajustes:"Ajustes", idioma:"Idioma", idiomaTxt:"Muda o app e também os livros e podcasts que mostramos.",
    espacio:"Espaço usado", borrarTodas:"Apagar todos os downloads", borrarTodasQ:"Apagar todos os downloads?", acerca:"Sobre",
    privacidad:"Política de privacidade", terminos:"Termos de uso", contacto:"Contato", creditos:"Créditos", version:"Versão",
    creditosTxt:"Os audiolivros são gravações de domínio público do LibriVox (librivox.org), hospedadas no Internet Archive (archive.org). Os podcasts pertencem aos seus criadores e tocam a partir dos próprios servidores. Narrações próprias com a voz digital Kokoro.",
    cancelar:"Cancelar", borrar:"Apagar"
  }
};
// Textos de Premium, créditos y publicidad
Object.assign(TX.es, {
  premium:"Premium", hacetePremium:"Hacete Premium", sosPremium:"Sos Premium", graciasPremium:"¡Gracias por ser Premium!",
  planMes:"US$1,99 por mes", planAnio:"US$14,99 por año", ahorro:"Ahorrás 37%", ahoraNo:"Ahora no", restaurar:"Restaurar compras",
  benSinPubli:"Sin publicidad", benSinLimite:"Guardá sin internet todo lo que quieras", benDormir:"Temporizador para dormir sin límite", benTele:"Transmitir al Chromecast sin límite",
  muroEspacio:"Llegaste a tu espacio sin internet", muroEspacioTxt:"Podés guardar {0} minutos gratis. Mirá un video para sumar 20 minutos más por hoy, o hacete Premium y guardá sin límite.",
  muroDormir:"Se terminaron tus usos gratis de Dormir", muroDormirTxt:"Mirá un video para ganar un uso más, o hacete Premium y usalo todas las noches.",
  muroTele:"Se terminaron tus usos gratis de transmitir", muroTeleTxt:"Mirá un video para ganar un uso más, o hacete Premium y mandá a la tele siempre.",
  muroCandado:"Este capítulo está guardado con candado", muroCandadoTxt:"Sin internet podés escuchar {0} minutos de lo que guardaste. Mirá un video para destrabar 20 minutos más por hoy, o hacete Premium.",
  verVideo20:"Ver video y sumar 20 minutos", verVideo1:"Ver video y ganar 1 uso", quedanVideos:"Te quedan {0} videos hoy", sinVideosHoy:"Ya viste los 3 videos de hoy. Mañana podés ver más.",
  ganaste20:"¡Listo! Sumaste 20 minutos para hoy", ganaste1:"¡Listo! Ganaste 1 uso más", anuncioCortado:"Hay que ver el video entero para ganar el premio",
  usosQuedan:"Te quedan {0} usos gratis", espacioUsado:"Sin internet: {0} de {1} min", espacioPremium:"Sin internet: sin límite (Premium)",
  bloqueado:"Con candado: sin internet se destraba con un video o con Premium",
  anuncio:"Publicidad", anuncioPrueba:"ANUNCIO DE PRUEBA", anuncioPruebaTxt:"Acá va a ir el video de publicidad de verdad.", cerrar:"Cerrar", seCierraEn:"Se puede cerrar en {0}",
  compraPrueba:"Compra de prueba", compraPruebaTxt:"Todavía no está conectado el cobro de Apple. ¿Activar Premium de prueba?", activarPrueba:"Activar de prueba",
  quitarPremium:"Quitar Premium (prueba)", premiumQuitado:"Premium desactivado", premiumOk:"¡Ya sos Premium!", modoPrueba:"Modo prueba: los pagos y anuncios son simulados.",
  creditosDormir:"Dormir: {0} usos gratis", creditosTele:"Transmitir: {0} usos gratis", reiniciarPrueba:"Reiniciar créditos y espacio (prueba)", reiniciado:"Créditos y espacio reiniciados",
  chipTop:"Top 50", chipCats:"Categorías", chipNuevos:"Nuevos episodios", nuevosTxtSubs:"Lo último de los podcasts que seguís", nuevosTxtTop:"Lo último de los podcasts más escuchados", nuevosVacio:"No encontramos episodios nuevos por ahora.", premTit:"Escuchá sin límites", premSub:"Sin publicidad, sin internet y en la tele", premNota:"Cancelá cuando quieras."
});
Object.assign(TX.en, {
  premium:"Premium", hacetePremium:"Go Premium", sosPremium:"You're Premium", graciasPremium:"Thanks for being Premium!",
  planMes:"US$1.99 per month", planAnio:"US$14.99 per year", ahorro:"Save 37%", ahoraNo:"Not now", restaurar:"Restore purchases",
  benSinPubli:"No ads", benSinLimite:"Save as much as you want for offline", benDormir:"Unlimited sleep timer", benTele:"Unlimited Chromecast",
  muroEspacio:"You've reached your offline space", muroEspacioTxt:"You can save {0} minutes for free. Watch a video to add 20 more minutes for today, or go Premium for unlimited.",
  muroDormir:"You're out of free sleep timers", muroDormirTxt:"Watch a video to earn one more use, or go Premium and use it every night.",
  muroTele:"You're out of free casts", muroTeleTxt:"Watch a video to earn one more use, or go Premium and cast anytime.",
  muroCandado:"This chapter is locked", muroCandadoTxt:"Offline you can play {0} minutes of what you saved. Watch a video to unlock 20 more minutes for today, or go Premium.",
  verVideo20:"Watch a video for 20 more minutes", verVideo1:"Watch a video for 1 more use", quedanVideos:"{0} videos left today", sinVideosHoy:"You've watched today's 3 videos. Come back tomorrow.",
  ganaste20:"Done! You got 20 more minutes for today", ganaste1:"Done! You got 1 more use", anuncioCortado:"Watch the whole video to get the reward",
  usosQuedan:"{0} free uses left", espacioUsado:"Offline: {0} of {1} min", espacioPremium:"Offline: unlimited (Premium)",
  bloqueado:"Locked: unlock offline with a video or Premium",
  anuncio:"Ad", anuncioPrueba:"TEST AD", anuncioPruebaTxt:"The real video ad will go here.", cerrar:"Close", seCierraEn:"You can close in {0}",
  compraPrueba:"Test purchase", compraPruebaTxt:"Apple billing isn't connected yet. Turn on test Premium?", activarPrueba:"Turn on (test)",
  quitarPremium:"Remove Premium (test)", premiumQuitado:"Premium turned off", premiumOk:"You're Premium now!", modoPrueba:"Test mode: payments and ads are simulated.",
  creditosDormir:"Sleep: {0} free uses", creditosTele:"Cast: {0} free uses", reiniciarPrueba:"Reset credits and space (test)", reiniciado:"Credits and space reset",
  chipTop:"Top 50", chipCats:"Categories", chipNuevos:"New episodes", nuevosTxtSubs:"The latest from the podcasts you follow", nuevosTxtTop:"The latest from the top podcasts", nuevosVacio:"No new episodes right now.", premTit:"Listen without limits", premSub:"No ads, offline and on your TV", premNota:"Cancel anytime."
});
Object.assign(TX.pt, {
  premium:"Premium", hacetePremium:"Seja Premium", sosPremium:"Você é Premium", graciasPremium:"Obrigado por ser Premium!",
  planMes:"US$1,99 por mês", planAnio:"US$14,99 por ano", ahorro:"Economize 37%", ahoraNo:"Agora não", restaurar:"Restaurar compras",
  benSinPubli:"Sem anúncios", benSinLimite:"Salve offline o quanto quiser", benDormir:"Timer para dormir sem limite", benTele:"Chromecast sem limite",
  muroEspacio:"Você chegou ao seu espaço offline", muroEspacioTxt:"Você pode salvar {0} minutos grátis. Assista a um vídeo para somar mais 20 minutos hoje, ou seja Premium e salve sem limite.",
  muroDormir:"Acabaram seus usos grátis do timer", muroDormirTxt:"Assista a um vídeo para ganhar mais um uso, ou seja Premium e use todas as noites.",
  muroTele:"Acabaram seus usos grátis de transmitir", muroTeleTxt:"Assista a um vídeo para ganhar mais um uso, ou seja Premium e transmita sempre.",
  muroCandado:"Este capítulo está com cadeado", muroCandadoTxt:"Offline você pode ouvir {0} minutos do que salvou. Assista a um vídeo para liberar mais 20 minutos hoje, ou seja Premium.",
  verVideo20:"Ver vídeo e somar 20 minutos", verVideo1:"Ver vídeo e ganhar 1 uso", quedanVideos:"Restam {0} vídeos hoje", sinVideosHoy:"Você já viu os 3 vídeos de hoje. Amanhã tem mais.",
  ganaste20:"Pronto! Você somou 20 minutos para hoje", ganaste1:"Pronto! Você ganhou mais 1 uso", anuncioCortado:"Assista ao vídeo inteiro para ganhar o prêmio",
  usosQuedan:"Restam {0} usos grátis", espacioUsado:"Offline: {0} de {1} min", espacioPremium:"Offline: sem limite (Premium)",
  bloqueado:"Com cadeado: offline libera com um vídeo ou Premium",
  anuncio:"Anúncio", anuncioPrueba:"ANÚNCIO DE TESTE", anuncioPruebaTxt:"Aqui vai entrar o vídeo de anúncio de verdade.", cerrar:"Fechar", seCierraEn:"Pode fechar em {0}",
  compraPrueba:"Compra de teste", compraPruebaTxt:"A cobrança da Apple ainda não está conectada. Ativar Premium de teste?", activarPrueba:"Ativar teste",
  quitarPremium:"Tirar Premium (teste)", premiumQuitado:"Premium desativado", premiumOk:"Agora você é Premium!", modoPrueba:"Modo teste: pagamentos e anúncios são simulados.",
  creditosDormir:"Dormir: {0} usos grátis", creditosTele:"Transmitir: {0} usos grátis", reiniciarPrueba:"Reiniciar créditos e espaço (teste)", reiniciado:"Créditos e espaço reiniciados",
  chipTop:"Top 50", chipCats:"Categorias", chipNuevos:"Novos episódios", nuevosTxtSubs:"O mais recente dos podcasts que você segue", nuevosTxtTop:"O mais recente dos podcasts mais ouvidos", nuevosVacio:"Nenhum episódio novo por enquanto.", premTit:"Ouça sem limites", premSub:"Sem anúncios, offline e na TV", premNota:"Cancele quando quiser."
});
const IDIOMAS = [["es","Español"],["en","English"],["pt","Português"]];

// ================= Estado guardado en el teléfono =================
const CLAVE = "ag:v1";
let E = { progreso:{}, recientes:[], lista:[], subs:[], desc:{}, gustos:{}, voz:"ef_dora", vel:1, idioma:null };
try { Object.assign(E, JSON.parse(localStorage.getItem(CLAVE) || "{}")); } catch (e) {}
if (!E.idioma || !TX[E.idioma]) { const n = (navigator.language || "es").slice(0, 2).toLowerCase(); E.idioma = TX[n] ? n : "es"; }
// País del ranking de podcasts: sale de la configuración del teléfono (es-AR → Argentina).
const PAISES_IDIOMA = { es:["ar","mx","es","co","cl","pe","uy","ec","ve"], en:["us","gb","ca","au","ie","nz"], pt:["br","pt"] };
function paisInicial(lang){
  for (const l of (navigator.languages || [navigator.language || ""])) { const r = (String(l).split("-")[1] || "").toLowerCase(); if (PAISES_IDIOMA[lang].includes(r)) return r; }
  return PAISES_IDIOMA[lang][0];
}
if (!E.pais || (E.pais !== "mundo" && !PAISES_IDIOMA[E.idioma].includes(E.pais))) E.pais = paisInicial(E.idioma);
let L = E.idioma;
const t = (k, ...a) => String((TX[L] && TX[L][k]) || TX.es[k] || k).replace(/\{(\d)\}/g, (_, i) => a[i]);
let guardarT = null;
function guardar(){ clearTimeout(guardarT); guardarT = setTimeout(() => { try { localStorage.setItem(CLAVE, JSON.stringify(E)); } catch (e) {} }, 300); }
const corto = x => ({ id:x.id, tipo:x.tipo, titulo:x.titulo, autor:x.autor, portada:x.portada });
const enLista = x => E.lista.some(l => l.id === x.id && l.tipo === x.tipo);
const suscripto = id => E.subs.some(s => s.id === id);
function traducirFijos(){
  document.documentElement.lang = L;
  document.querySelectorAll("[data-t]").forEach(el => el.textContent = t(el.dataset.t));
}

async function api(ruta){
  const sep = ruta.includes("?") ? "&" : "?";
  let r;
  try { r = await fetch(API + ruta + sep + "idioma=" + L + "&pais=" + E.pais); }
  catch (e) { throw new Error(navigator.onLine === false ? t("sinInternet") : t("noCargo")); }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || t("noCargo"));
  return d;
}
let CONFIG = { afiliado:null };
api("/api/config").then(c => CONFIG = c).catch(() => {});

function fmt(s){ s = Math.max(0, Math.floor(s || 0)); const h = Math.floor(s/3600), m = Math.floor(s%3600/60), x = String(s%60).padStart(2,"0"); return h ? h + ":" + String(m).padStart(2,"0") + ":" + x : m + ":" + x; }
function largo(s){ s = Math.round(s || 0); if (!s) return ""; const h = Math.floor(s/3600), m = Math.round(s%3600/60); return h ? h + " h" + (m ? " " + m + " min" : "") : Math.max(1, m) + " min"; }
function megas(b){ return b > 1e9 ? (b / 1e9).toFixed(1) + " GB" : Math.max(0.1, b / 1e6).toFixed(b > 1e8 ? 0 : 1) + " MB"; }
function fecha(iso){ if (!iso) return ""; const d = new Date(iso), hoy = new Date(); const dias = Math.floor((hoy - d) / 864e5);
  if (dias < 1) return t("hoy"); if (dias < 2) return t("ayer"); if (dias < 7) return t("haceDias", dias);
  return d.toLocaleDateString({ es:"es-AR", en:"en-US", pt:"pt-BR" }[L], { day:"numeric", month:"short", year: d.getFullYear() === hoy.getFullYear() ? undefined : "numeric" }); }

// ================= Portadas =================
const PALETA = [["#7C2D12","#3B1206"],["#1F5130","#0C2615"],["#3B3470","#16123A"],["#8A5A1F","#3E2608"],["#1D4E89","#0A2244"],["#5B1A2B","#24060F"],["#2F5D62","#0F2A2D"],["#6B6B2A","#2B2B0C"]];
function hash(s){ let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); }
function genCover(x){ const p = PALETA[hash(x.titulo) % PALETA.length];
  return '<div class="gen" style="background:linear-gradient(160deg,' + p[0] + ',' + p[1] + ')"><div class="a">' + esc(x.autor || "") + '</div><div class="t">' + esc(x.titulo) + '</div></div>'; }
function cover(x, cls = "", tag = ""){
  const pod = x.tipo === "podcast" ? " pod" : "";
  const img = x.portada ? '<img loading="lazy" decoding="async" alt="" src="' + esc(abs(x.portada)) + '" onerror="this.outerHTML=this.dataset.gen" data-gen="' + esc(genCover(x)) + '">' : genCover(x);
  return '<div class="cv' + pod + (cls ? " " + cls : "") + '">' + img + (tag ? '<span class="tag">' + tag + '</span>' : '') + '</div>';
}
// Algunas portadas de archive.org vienen vacías (imagen genérica muy chica): las reemplazamos.
document.addEventListener("load", e => {
  const im = e.target; if (im.tagName === "IMG" && im.dataset.gen && im.naturalWidth && im.naturalWidth < 60) im.outerHTML = im.dataset.gen;
}, true);

const ruta = x => x.tipo === "podcast" ? "#/podcast/" + x.id : "#/libro/" + encodeURIComponent(x.id);
function item(x){
  const m = x.tipo === "podcast" ? (x.autor || t("podcast")) : (x.autor || "");
  return '<a class="it" href="' + ruta(x) + '" style="text-decoration:none;color:inherit">' + cover(x, "", x.propio ? "NUEVO" : "") + '<div class="n">' + esc(x.titulo) + '</div><div class="m">' + esc(m) + '</div></a>';
}
function row(x, extra = ""){
  const sub = x.tipo === "podcast" ? t("podcast") + " · " + esc(x.autor || "") : esc(x.autor || "");
  return '<a class="row" href="' + ruta(x) + '" style="color:inherit;text-decoration:none">' + cover(x) + '<div class="info"><b>' + esc(x.titulo) + '</b><small>' + sub + '</small>' + extra + '</div></a>';
}
const skFila = (n = 5) => '<div class="carr">' + Array.from({length:n}, () => '<div class="it"><div class="sk" style="aspect-ratio:1"></div><div class="sk" style="height:12px;margin-top:8px;width:80%"></div></div>').join("") + '</div>';
const skLista = (n = 6) => Array.from({length:n}, () => '<div class="row"><div class="sk" style="width:56px;height:56px"></div><div class="info"><div class="sk" style="height:13px;width:70%"></div><div class="sk" style="height:11px;width:40%;margin-top:6px"></div></div></div>').join("");
function error(msg, reintentar){
  const off = navigator.onLine === false || Object.keys(E.desc).length;
  return '<div class="vacio"><b>' + t("algoFallo") + '</b>' + esc(msg) + '<br><button class="mas" onclick="' + reintentar + '">' + t("reintentar") + '</button>' +
    (off ? '<br><a class="link" href="#/biblioteca/descargas" style="display:inline-block;margin-top:14px">' + t("verDescargas") + '</a>' : '') + '</div>';
}

// ================= Navegación =================
const V = $("vista");
let scrolls = {};
function rutaActual(){ return (location.hash || "#/").slice(1); }
function marcarTab(tb){ document.querySelectorAll("#tabs a").forEach(a => a.getAttribute("data-tab") === tb ? a.setAttribute("aria-current","page") : a.removeAttribute("aria-current")); }
let rutaPrevia = null;
async function router(){
  const r = rutaActual();
  if (r === "/reproductor") { if (P.item) abrirFull(); else location.replace("#/"); return; }
  cerrarFull(true);
  const enClips = r.split("/")[1] === "clips";
  document.body.classList.toggle("en-clips", enClips);
  if (!enClips) salirClips();
  if (rutaPrevia) scrolls[rutaPrevia] = scrollY;
  rutaPrevia = r;
  const p = r.split("/").filter(Boolean);
  const tab = { clips:"clips", explorar:"explorar", cat:"explorar", podcasts:"podcasts", podcast:"podcasts", nuevos:"podcasts", biblioteca:"biblioteca", ajustes:"biblioteca" }[p[0]] || "inicio";
  marcarTab(tab);
  try {
    if (!p.length) await vInicio();
    else if (p[0] === "clips") await vClips();
    else if (p[0] === "explorar") vExplorar(decodeURIComponent(p[1] || ""));
    else if (p[0] === "cat") await vCategoria(p[1], p[2]);
    else if (p[0] === "podcasts") await vPodcasts(p[1] === "top");
    else if (p[0] === "nuevos") await vNuevos();
    else if (p[0] === "biblioteca") vBiblioteca(p[1] || "escuchando");
    else if (p[0] === "ajustes") vAjustes();
    else if (p[0] === "libro") await vLibro(decodeURIComponent(p[1]));
    else if (p[0] === "podcast") await vPodcast(p[1]);
    else await vInicio();
  } catch (e) { V.innerHTML = barraVolver() + error(e.message, "router()"); }
  requestAnimationFrame(() => scrollTo(0, scrolls[r] || 0));
}
addEventListener("hashchange", router);
function volver(){ history.length > 1 ? history.back() : location.replace("#/"); }
function barraVolver(){ return '<div class="top-bar"><button class="volver" onclick="volver()" aria-label="Volver">' + ICO.volver + '</button></div>'; }

// ================= Inicio =================
let cacheInicio = null;
let nSlides = 0;
// Tarjeta de Premium para el carrusel (estilo collage de portadas). No se muestra a quien ya es Premium.
function slidePremium(d){
  if (esPremium()) return "";
  const vistas = new Set(), portadas = [];
  for (const f of d.filas || []) for (const x of f.items || []) {
    if (x.tipo !== "podcast" || !x.portada || vistas.has(x.portada)) continue;
    vistas.add(x.portada); portadas.push(abs(x.portada));
  }
  if (portadas.length < 6) for (const f of d.filas || []) for (const x of f.items || []) { if (portadas.length >= 6) break; if (x.portada && !vistas.has(x.portada)) { vistas.add(x.portada); portadas.push(abs(x.portada)); } }
  const col = portadas.slice(0, 6).map((u, i) => '<span class="pc pc' + i + '" style="background-image:url(\'' + esc(u) + '\')"></span>').join("");
  return '<div class="hero slide prem"><div class="pr-col">' + col + '</div><div class="cnt"><div class="kick">' + t("premium") + '</div><h1>' + t("premTit") + '</h1><p class="pr-sub">' + t("premSub") + '</p>' +
    '<div class="bts"><button class="hb w" id="h-prem">' + t("hacetePremium") + '</button></div><p class="pr-nota">' + t("planMes") + ' · ' + t("premNota") + '</p></div></div>';
}
async function vInicio(){
  if (!cacheInicio) {
    V.innerHTML = '<div class="hero"></div><div class="fila-tit"><div class="sk" style="height:16px;width:50%"></div></div>' + skFila() + '<div class="fila-tit"><div class="sk" style="height:16px;width:40%"></div></div>' + skFila();
    cacheInicio = await api("/api/inicio");
  }
  const d = cacheInicio;
  const hs = (d.destacados && d.destacados.length) ? d.destacados : (d.destacado ? [d.destacado] : []);
  const hd = '<div class="hd"><span class="logo">' + ICO.auris + '<span>' + (L === "en" ? "free <i>audiobooks</i>" : L === "pt" ? "audiolivros <i>grátis</i>" : "audiolibros <i>gratis</i>") + '</span></span><span class="hd-der"><button class="hd-btn cast-btn" data-cast hidden aria-label="' + t("transmitir") + '">' + ICO.cast + '</button><a class="hd-btn" href="#/ajustes" aria-label="' + t("ajustes") + '">' + ICO.ajustes + '</a></span></div>';
  const info = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>';
  let html = "";
  if (hs.length) {
    const slides = hs.map((h, k) => {
      const bts = '<div class="bts"><button class="hb w" data-hplay="' + k + '">' + ICO.play + t("escuchar") + '</button><button class="hb g" data-hlista="' + k + '"></button><a class="hb g" href="#/libro/' + encodeURIComponent(h.id) + '" aria-label="' + t("masInfo") + '">' + info + '</a></div>';
      const cnt = '<div class="cnt"><div class="kick">' + esc(h.etiqueta) + '</div><h1>' + esc(h.titulo) + '</h1><div class="gens">' + (h.generos || []).map(g => '<span>' + esc(g) + '</span>').join("") + '</div>' + bts + '</div>';
      if (h.imagen) return '<div class="hero slide" style="background-image:url(\'' + esc(abs(h.imagen)) + '\')">' + cnt + '</div>';
      return '<div class="hero poster slide"><div class="fondo" style="background-image:url(\'' + esc(abs(h.portada)) + '\')"></div><div class="arte" style="background-image:url(\'' + esc(abs(h.poster || h.portada)) + '\'),url(\'' + esc(abs(h.portada)) + '\')"></div>' + cnt + '</div>';
    });
    const prem = slidePremium(d);
    if (prem) slides.splice(Math.min(1, slides.length), 0, prem);
    nSlides = slides.length;
    const chips = '<div class="hchips"><a href="#/podcasts/top">' + t("chipTop") + '</a><a href="#/nuevos">' + t("chipNuevos") + '</a><a href="#/cat/libros/todos">' + t("audiolibros") + '</a><a href="#/explorar">' + t("chipCats") + '</a></div>';
    html = '<div class="hero-car">' + hd + chips + '<div class="pista" id="h-pista">' + slides.join("") + '</div>' + (slides.length > 1 ? '<div class="puntos" id="h-puntos">' + slides.map((_, k) => '<button aria-label="' + (k + 1) + '"' + (k ? '' : ' class="on"') + ' data-punto="' + k + '"></button>').join("") + '</div>' : '') + '</div>';
  } else html = '<div style="display:flex;justify-content:space-between;align-items:center">' + hd.replace('class="hd"', 'class="tit-fila" style="width:100%"') + '</div>';

  const rec = E.recientes.slice(0, 12);
  if (rec.length) {
    html += '<div class="fila-tit"><h2>' + t("seguirEsc") + '</h2><a href="#/biblioteca">' + t("verTodo") + '</a></div><div class="carr">' + rec.map((r, i) => {
      const pr = E.progreso[r.pista.url] || {}; const pct = pr.dur ? Math.min(100, pr.t / pr.dur * 100) : 0;
      return '<button class="seg-it" data-rec="' + i + '">' + cover(r.item) + '<span class="po">' + ICO.play.replace('<svg', '<svg width="18" height="18"') + '</span><div class="pi"><b>' + esc(r.item.titulo) + '</b><small>' + esc(r.pista.titulo) + '</small><div class="prog"><i style="width:' + pct + '%"></i></div></div></button>';
    }).join("") + '</div>';
  }
  for (const f of d.filas) {
    const ver = f.cat !== undefined ? '<a href="#/cat/libros/' + (f.cat || "todos") + '">' + t("verTodo") + '</a>'
      : f.id === "seleccion" ? '<a href="#/cat/libros/seleccion">' + t("verTodo") + '</a>'
      : f.genero ? '<a href="#/cat/podcasts/' + f.genero + '">' + t("verTodo") + '</a>'
      : f.id === "top-pods" ? '<a href="#/podcasts">' + t("verTodo") + '</a>' : "";
    html += '<div class="fila-tit"><h2>' + esc(f.titulo) + '</h2>' + ver + '</div><div class="carr">';
    if (f.estilo === "top10") html += f.items.map((x, i) => '<a class="top10' + (i === 9 ? " diez" : "") + '" href="' + ruta(x) + '" aria-label="' + (i + 1) + ". " + esc(x.titulo) + '"><span class="nn">' + (i + 1) + '</span>' + cover(x) + '</a>').join("");
    else html += f.items.map(item).join("");
    html += '</div>';
  }
  html += '<p class="fuente">' + t("pie") + '</p>';
  V.innerHTML = html;
  hs.forEach((h, k) => {
    const hl = V.querySelector('[data-hlista="' + k + '"]'), x = { id:h.id, tipo:"libro", titulo:h.titulo, autor:h.autor, portada:h.portada || "/contenido/quijote/portada.jpg" };
    const pintarL = () => hl.innerHTML = enLista(x) ? ICO.ok + t("enMiLista") : ICO.mas + t("miLista");
    pintarL(); hl.onclick = () => { alternarLista(x); pintarL(); };
    V.querySelector('[data-hplay="' + k + '"]').onclick = () => escucharLibro(h.id);
  });
  carrusel(nSlides);
  if ($("h-prem")) $("h-prem").onclick = () => muro("ajustes", () => { cacheInicio && vInicio(); });
  V.querySelectorAll("[data-rec]").forEach(b => b.onclick = () => continuar(E.recientes[+b.dataset.rec]));
}

// Carrusel de destacados: pasa solo cada 7 s; si la persona lo toca, espera un rato.
let carT = null;
function carrusel(n){
  clearInterval(carT);
  const pista = $("h-pista"), puntos = $("h-puntos");
  if (!pista || n < 2) return;
  let pausa = 0;
  const paso = () => { const a = pista.children[0], b = pista.children[1]; return a && b ? b.offsetLeft - a.offsetLeft : pista.clientWidth; };
  const actual = () => Math.round(pista.scrollLeft / paso());
  const ir = k => pista.scrollTo({ left:k * paso(), behavior:"smooth" });
  pista.addEventListener("scroll", () => { const k = actual(); puntos.querySelectorAll("button").forEach((b, i) => b.classList.toggle("on", i === k)); }, { passive:true });
  ["pointerdown", "touchstart", "wheel"].forEach(ev => pista.addEventListener(ev, () => { pausa = Date.now() + 12000; }, { passive:true }));
  puntos.querySelectorAll("button").forEach(b => b.onclick = () => { pausa = Date.now() + 12000; ir(+b.dataset.punto); });
  carT = setInterval(() => {
    if (!document.body.contains(pista)) return clearInterval(carT);
    if (Date.now() < pausa || document.hidden || $("full").classList.contains("on")) return;
    ir((actual() + 1) % n);
  }, 7000);
}

// ================= Clips (previas de 30 segundos para deslizar) =================
// Dos reproductores que se turnan: mientras suena uno, el otro ya va cargando el próximo clip
// (ya adelantado al segundo donde arranca), así al deslizar suena enseguida.
const RES = [new Audio(), new Audio()];
RES.forEach(a => a.preload = "auto");
let AC = RES[0];
const otro = () => RES[0] === AC ? RES[1] : RES[0];
function adelantar(a){
  const d = a.duration || 0, ini = +a.dataset.inicio || 0;
  try { a.currentTime = d && ini > d - DUR_CLIP - 2 ? Math.max(0, d - DUR_CLIP - 2) : ini; } catch (e) {}
}
function cargarEn(a, k){
  const c = CL.lista[k]; if (!c) return;
  if (a.dataset.k === String(k) && a.src) return;
  a.pause();
  a.dataset.k = k; a.dataset.inicio = c.inicio || 0;
  a.src = c.pista.url;
  a.addEventListener("loadedmetadata", () => adelantar(a), { once:true });
  a.load();
}
const CL = { lista:[], pagina:0, hayMas:true, cargando:false, actual:-1, desbloqueado:false, obs:null, finT:null };
const DUR_CLIP = 30;
async function vClips(){
  V.innerHTML = '<div class="clips-top"><b>' + t("tabClips") + '</b></div><div class="clips" id="clips"></div>' +
    (CL.desbloqueado ? '' : '<button class="empezar" id="empezar"><span><i>' + ICO.play + '</i>' + t("tocaEmpezar") + '<small style="font-weight:500;opacity:.8">' + t("deslizaTxt") + '</small></span></button>');
  const cont = $("clips");
  CL.obs && CL.obs.disconnect();
  CL.obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && e.intersectionRatio > .6) activarClip(+e.target.dataset.k); }), { root:cont, threshold:[.6] });
  if ($("empezar")) $("empezar").onclick = () => {
    CL.desbloqueado = true; $("empezar").remove();
    // El primer toque habilita el audio en el teléfono: destrabamos los dos reproductores.
    const o = otro(); if (o.src) { o.muted = true; o.play().then(() => { o.pause(); o.muted = false; adelantar(o); }).catch(() => { o.muted = false; }); }
    AC.play().catch(() => {});
    if (CL.actual >= 0) tocarClip(true);
  };
  if (CL.lista.length) { cont.innerHTML = CL.lista.map(tarjetaClip).join(""); prepararTarjetas(); CL.saltarAuto = !A.paused; requestAnimationFrame(() => { const k = Math.max(0, CL.actual); cont.scrollTop = k * cont.clientHeight; CL.actual = -1; activarClip(k); }); }
  else { cont.innerHTML = '<div class="clip-carga">' + ICO.carga.replace('<svg', '<svg width="34" height="34" style="animation:gira 1s linear infinite"') + '</div>'; await masClips(); }
}
async function masClips(){
  if (CL.cargando || !CL.hayMas) return;
  CL.cargando = true;
  try {
    const ya = CL.lista.flatMap(c => [c.clave, c.item.id]).filter(Boolean).concat(E.subs.map(s => s.id)).slice(-300);
    const gustos = Object.entries(E.gustos || {}).map(([k, v]) => k + ":" + v.toFixed(2)).join(",");
    const d = await api("/api/clips?pagina=" + CL.pagina + "&gustos=" + encodeURIComponent(gustos) + "&ya=" + encodeURIComponent(ya.join(",")));
    CL.pagina++; CL.hayMas = d.hayMas;
    const desde = CL.lista.length;
    CL.lista = CL.lista.concat(d.clips);
    const cont = $("clips"); if (!cont) return;
    const carga = cont.querySelector(".clip-carga"); if (carga) carga.remove();
    cont.insertAdjacentHTML("beforeend", d.clips.map((c, i) => tarjetaClip(c, desde + i)).join(""));
    prepararTarjetas();
    if (!CL.lista.length) cont.innerHTML = '<div class="clip-carga">' + t("sinClips") + '</div>';
    else if (desde === 0) activarClip(0);
  } catch (e) {
    const cont = $("clips"); if (cont && !CL.lista.length) cont.innerHTML = '<div class="clip-carga" style="padding:20px;text-align:center">' + esc(e.message) + '</div>';
  } finally { CL.cargando = false; }
}
function tarjetaClip(c, k){
  const pod = c.item.tipo === "podcast";
  const img = c.pista.portada || c.item.portada;
  const guardado = pod ? suscripto(c.item.id) : enLista(c.item);
  return '<div class="clip" data-k="' + k + '"><div class="fondo" style="background-image:url(\'' + esc(abs(img)) + '\')"></div>' +
    '<div class="tapa">' + cover({ ...c.item, portada:img }) + '</div><div class="pausa">' + ICO.play + '</div>' +
    '<div class="info"><small>' + (pod ? t("clipPodcast") : t("clipLibro")) + '</small><b>' + esc(c.item.titulo) + '</b><p>' + esc(c.pista.titulo) + '</p></div>' +
    '<div class="lado">' +
      '<button class="prin" data-acc="completo"><span class="c">' + ICO.play + '</span>' + t("completo") + '</button>' +
      '<button data-acc="guardar"' + (guardado ? ' class="on"' : '') + '><span class="c">' + (guardado ? ICO.ok : ICO.mas) + '</span>' + (pod ? (guardado ? t("siguiendo") : t("seguir")) : t("guardarClip")) + '</button>' +
      '<button data-acc="info"><span class="c">' + ICO.libro.replace('M4 5h6', 'M4 5h6') + '</span>' + t("verFicha") + '</button>' +
    '</div><div class="barra"><i></i></div></div>';
}
function prepararTarjetas(){
  document.querySelectorAll("#clips .clip:not([data-listo])").forEach(el => {
    el.dataset.listo = "1"; CL.obs.observe(el);
    el.onclick = e => {
      const b = e.target.closest("[data-acc]"), k = +el.dataset.k, c = CL.lista[k];
      if (!b) return tocarClip();
      e.stopPropagation();
      if (b.dataset.acc === "completo") { ajustarGusto(c.tema, 1.35); return escucharClipCompleto(c); }
      if (b.dataset.acc === "info") { ajustarGusto(c.tema, 1.15); salirClips(); location.hash = ruta(c.item); return; }
      ajustarGusto(c.tema, 1.35);
      if (c.item.tipo === "podcast") { const i = E.subs.findIndex(s => s.id === c.item.id); if (i >= 0) E.subs.splice(i, 1); else { E.subs.unshift(corto(c.item)); toast(t("ahoraSeguis", c.item.titulo)); } guardar(); }
      else alternarLista(c.item);
      const nueva = document.createElement("div"); nueva.innerHTML = tarjetaClip(c, k);
      b.outerHTML = nueva.querySelector('[data-acc="guardar"]').outerHTML;
    };
  });
}
function activarClip(k){
  if (k === CL.actual || !CL.lista[k]) return;
  // Aprende del clip que se deja: si lo pasaste enseguida, ese tema baja; si lo escuchaste entero, sube.
  const previo = CL.lista[CL.actual];
  if (previo && CL.base != null && CL.desbloqueado) {
    const oido = (AC.currentTime || 0) - CL.base;
    if (oido < 5) ajustarGusto(previo.tema, 0.85); else if (oido >= DUR_CLIP - 3) ajustarGusto(previo.tema, 1.1);
  }
  // Publicidad cada tantos clips (no para Premium).
  let corte = false;
  if (CL.desbloqueado && CL.actual >= 0 && !esPremium()) { E.clipsVistos = (E.clipsVistos || 0) + 1; guardar(); corte = E.clipsVistos % PREMIUM.cadaClips === 0; }
  CL.actual = k;
  const c = CL.lista[k];
  document.querySelectorAll("#clips .clip").forEach(el => el.classList.remove("sonando", "pausado"));
  const viejo = AC;
  if (otro().dataset.k === String(k) && otro().src) AC = otro(); // ya estaba cargado: lo usamos
  if (viejo !== AC) viejo.pause();
  AC.pause();
  CL.base = null;
  if (AC.dataset.k !== String(k) || !AC.src) cargarEn(AC, k);
  else if (AC.readyState >= 1 && Math.abs(AC.currentTime - (+AC.dataset.inicio || 0)) > 3 && AC.currentTime < (+AC.dataset.inicio || 0)) adelantar(AC);
  // El siguiente va cargando en el otro reproductor.
  cargarEn(otro(), k + 1);
  if (corte) { AC.pause(); verAnuncio("corte").then(() => { if (CL.actual === k && document.body.classList.contains("en-clips")) tocarClip(true); }); }
  else if (CL.desbloqueado && !CL.saltarAuto) tocarClip(true);
  else if (CL.saltarAuto) { const el = document.querySelector('#clips .clip[data-k="' + k + '"]'); if (el) el.classList.add("pausado"); }
  CL.saltarAuto = false;
  if (k >= CL.lista.length - 3) masClips();
}
function tocarClip(forzar){
  const el = document.querySelector('#clips .clip[data-k="' + CL.actual + '"]'); if (!el) return;
  if (!CL.desbloqueado) return;
  if (forzar || AC.paused) {
    if (!A.paused) A.pause(); // pausa el reproductor principal
    AC.play().then(() => { el.classList.add("sonando"); el.classList.remove("pausado"); }).catch(() => { el.classList.add("pausado"); });
  } else { AC.pause(); el.classList.remove("sonando"); el.classList.add("pausado"); }
}
RES.forEach(a => {
  a.ontimeupdate = () => {
    if (a !== AC) return;
    const el = document.querySelector('#clips .clip[data-k="' + CL.actual + '"]'); if (!el) return;
    if (CL.base == null) return;
    const pct = Math.max(0, Math.min(1, (a.currentTime - CL.base) / DUR_CLIP));
    el.querySelector(".barra i").style.width = pct * 100 + "%";
    if (pct >= 1 && !a.paused) siguienteClip();
  };
  a.onended = () => { if (a === AC) siguienteClip(); };
  // El conteo de 30 s arranca desde donde realmente empezó a sonar (por si el servidor no deja adelantar).
  a.onplaying = () => { if (a === AC && CL.base == null) CL.base = a.currentTime; };
  a.onseeked = () => { if (a === AC && CL.base != null && Math.abs(a.currentTime - CL.base) > 5 && a.currentTime > CL.base) CL.base = a.currentTime; };
  a.onerror = () => { if (a === AC && document.body.classList.contains("en-clips") && a.src) setTimeout(siguienteClip, 800); };
});
function siguienteClip(){
  const cont = $("clips"); if (!cont) return;
  const k = CL.actual + 1;
  if (!CL.lista[k]) { AC.pause(); return; }
  cont.scrollTo({ top:k * cont.clientHeight, behavior:"smooth" });
}
// Pesos por tema que se guardan solo en el teléfono (1 = normal; más alto = aparece más).
function ajustarGusto(tema, f){
  if (!tema) return;
  E.gustos = E.gustos || {};
  const base = E.gustos[tema] != null ? E.gustos[tema] : (tema === "libro" ? 0.35 : 1);
  E.gustos[tema] = Math.max(0.15, Math.min(5, base * f));
  guardar();
}
function salirClips(){
  RES.forEach(a => { if (!a.paused) a.pause(); });
  if (CL.obs) CL.obs.disconnect();
}
async function escucharClipCompleto(c){
  const desde = AC.currentTime || c.inicio || 0;
  salirClips();
  try {
    if (c.item.tipo === "podcast") reproducir(c.item, [c.pista], 0, false, desde);
    else { const b = await traerLibro(c.item.id); reproducir(b, b.capitulos, c.indice || 0, true, desde); }
    location.hash = "#/reproductor";
  } catch (e) { toast(e.message); }
}

// ================= Buscar / Explorar =================
let cats = null, tBusq = null;
function vExplorar(q){
  V.innerHTML = '<h1>' + t("buscar") + '</h1><label class="buscar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="q" type="search" enterkeyhint="search" autocomplete="off" placeholder="' + esc(t("buscarPh")) + '" value="' + esc(q) + '"></label><div id="res"></div>';
  const inp = $("q");
  inp.oninput = () => { clearTimeout(tBusq); tBusq = setTimeout(() => { history.replaceState(null, "", "#/explorar/" + encodeURIComponent(inp.value.trim())); rutaPrevia = rutaActual(); buscar(inp.value.trim()); }, 350); };
  inp.onkeydown = e => { if (e.key === "Enter") inp.blur(); };
  buscar(q);
}
async function buscar(q){
  const res = $("res"); if (!res) return;
  if (q.length < 2) {
    if (!cats) { try { cats = await api("/api/categorias"); } catch (e) { res.innerHTML = error(e.message, "vExplorar('')"); return; } }
    const col = ["#7C2D12","#1F5130","#3B3470","#B07A12","#1D4E89","#5B1A2B","#2F5D62","#5C3B26","#6B6B2A"];
    const gc = (href, n, c) => '<a class="gc" href="' + href + '" style="background:linear-gradient(140deg,' + c + ',' + c + 'aa);text-decoration:none">' + esc(n) + '</a>';
    res.innerHTML = '<div class="fila-tit"><h2>' + t("porGenero") + '</h2></div><div class="g2">' + cats.libros.map((c, i) => gc("#/cat/libros/" + c.id, c.nombre, col[i % 9])).join("") + '</div>' +
      '<div class="fila-tit"><h2>' + t("porTema") + '</h2></div><div class="g2">' + cats.podcasts.map((c, i) => gc("#/cat/podcasts/" + c.id, c.nombre, col[(i + 3) % 9])).join("") + '</div>';
    return;
  }
  res.innerHTML = '<div class="lista" style="margin-top:10px">' + skLista() + '</div>';
  try {
    const d = await api("/api/buscar?q=" + encodeURIComponent(q));
    if ($("q") && $("q").value.trim() !== q) return;
    if (!d.libros.length && !d.podcasts.length) { res.innerHTML = '<div class="vacio"><b>' + t("sinRes") + '</b>' + esc(t("sinResTxt", q)) + '</div>'; return; }
    let h = "";
    if (d.libros.length) h += '<div class="fila-tit"><h2>' + t("audiolibros") + '</h2></div><div class="lista">' + d.libros.slice(0, 20).map(x => row(x)).join("") + '</div>';
    if (d.podcasts.length) h += '<div class="fila-tit"><h2>' + t("podcasts") + '</h2></div><div class="lista">' + d.podcasts.slice(0, 15).map(x => row(x)).join("") + '</div>';
    res.innerHTML = h;
  } catch (e) { res.innerHTML = error(e.message, "buscar(document.getElementById('q').value.trim())"); }
}

async function vCategoria(tipo, id){
  if (!cats) cats = await api("/api/categorias");
  const lista = tipo === "podcasts" ? cats.podcasts : cats.libros;
  const nombreFila = cacheInicio && (cacheInicio.filas.find(f => f.id === id) || {}).titulo;
  const c = lista.find(x => x.id === id) || { nombre: nombreFila || (tipo === "podcasts" ? t("podcasts") : t("masEscuchados")) };
  V.innerHTML = barraVolver() + '<h1>' + esc(c.nombre) + '</h1><p class="sub">' + (tipo === "podcasts" ? t("podcasts") : t("audiolibrosGratis")) + '</p><div class="grid" id="g" style="margin-top:18px">' +
    Array.from({length:9}, () => '<div><div class="sk" style="aspect-ratio:1"></div></div>').join("") + '</div><div id="g-mas"></div>';
  let pagina = 1;
  const cargar = async () => {
    const d = tipo === "podcasts" ? await api("/api/podcasts?genero=" + encodeURIComponent(id)) : await api("/api/libros?pagina=" + pagina + (id && id !== "todos" ? "&cat=" + encodeURIComponent(id) : ""));
    const items = tipo === "podcasts" ? d.podcasts : d.libros;
    const g = $("g"); if (!g) return;
    if (pagina === 1) g.innerHTML = "";
    g.insertAdjacentHTML("beforeend", items.map(item).join(""));
    if (!g.children.length) g.outerHTML = '<div class="vacio"><b>' + t("nadaAca") + '</b>' + t("otroGenero") + '</div>';
    const m = $("g-mas");
    if (tipo !== "podcasts" && id !== "seleccion" && d.total > pagina * 30) { m.innerHTML = '<button class="mas">' + t("cargarMas") + '</button>'; m.firstChild.onclick = () => { pagina++; m.innerHTML = ""; cargar(); }; }
  };
  await cargar();
}

// ================= Podcasts =================
let cacheTop = null;
async function vPodcasts(irTop){
  if (!cats) cats = await api("/api/categorias").catch(() => null);
  let h = '<h1>' + t("podcasts") + '</h1>';
  if (E.subs.length) h += '<div class="fila-tit"><h2>' + t("tusPods") + '</h2></div><div class="carr">' + E.subs.map(item).join("") + '</div>';
  if (cats) h += '<div class="fila-tit"><h2>' + t("temas") + '</h2></div><div class="chips">' + cats.podcasts.map(c => '<a class="chip" href="#/cat/podcasts/' + c.id + '" style="color:inherit;text-decoration:none">' + esc(c.nombre) + '</a>').join("") + '</div>';
  h += '<div class="fila-tit"><h2>' + t("top50") + '</h2></div>';
  if (cats && cats.paises) h += '<div class="chips" style="margin-bottom:6px">' + cats.paises.map(c => '<button class="chip" data-pais="' + c.id + '" aria-pressed="' + (c.id === E.pais) + '">' + esc(c.nombre) + '</button>').join("") + '</div>';
  h += '<div class="lista" id="top">' + (cacheTop && cacheTop.pais === E.pais ? "" : skLista()) + '</div>';
  V.innerHTML = h;
  V.querySelectorAll("[data-pais]").forEach(b => b.onclick = () => { elegirPais(b.dataset.pais); vPodcasts(irTop); });
  if (irTop && $("top")) $("top").previousElementSibling.previousElementSibling.scrollIntoView({ block:"start" });
  const on = V.querySelector('[data-pais][aria-pressed="true"]'); if (on) on.scrollIntoView({ inline:"center", block:"nearest" });
  if (!cacheTop || cacheTop.pais !== E.pais) { const pais = E.pais; const d = await api("/api/podcasts"); cacheTop = { pais, lista:d.podcasts }; if (pais !== E.pais) return; }
  if ($("top")) $("top").innerHTML = cacheTop.lista.map((x, i) => row(x).replace('<div class="cv', '<span class="num">' + (i + 1) + '</span><div class="cv')).join("");
}

// ================= Nuevos episodios =================
// De los podcasts que seguís; si todavía no seguís ninguno, de los más escuchados de tu país.
async function vNuevos(){
  const conSubs = E.subs.length > 0;
  V.innerHTML = barraVolver() + '<h1>' + t("chipNuevos") + '</h1><p class="sub">' + t(conSubs ? "nuevosTxtSubs" : "nuevosTxtTop") + '</p><div class="lista" id="nv" style="margin-top:14px">' + skLista(8) + '</div>';
  let pods = E.subs.slice(0, 12);
  if (!conSubs) {
    if (!cacheTop || cacheTop.pais !== E.pais) { const pais = E.pais; const d = await api("/api/podcasts"); cacheTop = { pais, lista:d.podcasts }; }
    pods = cacheTop.lista.slice(0, 10);
  }
  const fichasP = await Promise.all(pods.map(x => (fichas["p:" + x.id] ? Promise.resolve(fichas["p:" + x.id]) : api("/api/podcast/" + x.id).then(p => fichas["p:" + x.id] = p)).catch(() => null)));
  if (rutaActual() !== "/nuevos") return;
  const eps = [];
  fichasP.forEach(p => { if (!p) return; p.episodios.slice(0, conSubs ? 3 : 2).forEach(e => eps.push({ p, e })); });
  eps.sort((a, b) => new Date(b.e.fecha || 0) - new Date(a.e.fecha || 0));
  const lista = eps.slice(0, 40);
  $("nv").innerHTML = lista.length ? lista.map(({ p, e }, i) => '<button class="row" data-nv="' + i + '">' + cover(Object.assign({}, p, e.portada ? { portada:e.portada } : {})) + '<div class="info"><small>' + esc(fecha(e.fecha)) + ' · ' + esc(p.titulo) + '</small><b>' + esc(e.titulo) + '</b><small>' + (e.duracion ? largo(e.duracion) : "") + '</small></div><span class="ic">' + ICO.playC + '</span></button>').join("") : '<div class="vacio">' + t("nuevosVacio") + '</div>';
  V.querySelectorAll("[data-nv]").forEach(b => b.onclick = () => {
    const { p, e } = lista[+b.dataset.nv];
    reproducir(p, [{ titulo:e.titulo, url:e.url, duracion:e.duracion, portada:e.portada, fecha:e.fecha, tamano:e.tamano }], 0, false);
  });
}

// ================= Biblioteca =================
function vBiblioteca(s){
  const segs = [["escuchando", t("escuchando")], ["lista", t("miLista")], ["podcasts", t("podcasts")], ["descargas", t("descargas")]];
  let h = '<div class="tit-fila"><h1>' + t("biblioteca") + '</h1><a class="hd-btn" href="#/ajustes" aria-label="' + t("ajustes") + '">' + ICO.ajustes + '</a></div><div class="seg">' +
    segs.map(([id, n]) => '<button aria-pressed="' + (id === s) + '" onclick="location.replace(\'#/biblioteca/' + id + '\')">' + n + '</button>').join("") + '</div><div class="lista" style="margin-top:8px">';
  if (s === "escuchando") {
    h += E.recientes.length ? E.recientes.map((r, i) => {
      const pr = E.progreso[r.pista.url] || {}; const pct = pr.dur ? Math.min(100, pr.t / pr.dur * 100) : 0;
      return '<button class="row" data-rec="' + i + '">' + cover(r.item) + '<div class="info"><b>' + esc(r.item.titulo) + '</b><small>' + esc(r.pista.titulo) + '</small><div class="prog"><i style="width:' + pct + '%"></i></div></div><span class="ic">' + ICO.playC + '</span></button>';
    }).join("") : vacio("vacioEsc");
  } else if (s === "lista") {
    h += E.lista.length ? E.lista.map(x => row(x)).join("") : vacio("vacioLista");
  } else if (s === "podcasts") {
    h += E.subs.length ? E.subs.map(x => row(x)).join("") : vacio("vacioPods");
  } else {
    const ds = Object.entries(E.desc).sort((a, b) => b[1].ts - a[1].ts), cand = conCandado();
    h += '<div class="espacio-bar"><span>' + (esPremium() ? t("espacioPremium") : t("espacioUsado", Math.round(minGuardados()), limiteMin())) + '</span>' + (esPremium() ? '' : '<button class="link" id="esp-mas">' + t("hacetePremium") + '</button>') + '</div>';
    h += ds.length ? ds.map(([url, d]) => '<div class="row"><button class="row" style="border:0;padding:0" data-dl="' + esc(url) + '">' + cover(d.item) + '<div class="info"><b>' + (cand.has(url) ? "🔒 " : "") + esc(d.pista.titulo) + '</b><small>' + esc(d.item.titulo) + (d.bytes ? " · " + megas(d.bytes) : "") + (cand.has(url) ? " · " + t("bloqueado") : "") + '</small></div></button><button class="dl ok" data-borrar="' + esc(url) + '" aria-label="' + t("borrar") + '">' + ICO.bajado + '</button></div>').join("") : vacio("vacioDesc");
  }
  V.innerHTML = h + '</div>';
  V.querySelectorAll("[data-rec]").forEach(b => b.onclick = () => continuar(E.recientes[+b.dataset.rec]));
  V.querySelectorAll("[data-dl]").forEach(b => b.onclick = () => { const d = E.desc[b.dataset.dl]; reproducir(d.item, [d.pista], 0, false); });
  V.querySelectorAll("[data-borrar]").forEach(b => b.onclick = () => confirmar(t("borrarDescarga"), async () => { await DL.borrar(b.dataset.borrar); toast(t("borrado")); vBiblioteca("descargas"); }));
  if ($("esp-mas")) $("esp-mas").onclick = () => muro(conCandado().size ? "candado" : "espacio", () => vBiblioteca("descargas"));
}
const vacio = k => '<div class="vacio"><b>' + t(k) + '</b>' + t(k + "Txt") + '</div>';

// ================= Ajustes =================
function vAjustes(){
  const total = Object.values(E.desc).reduce((a, d) => a + (d.bytes || 0), 0), n = Object.keys(E.desc).length;
  V.innerHTML = barraVolver() + '<h1>' + t("ajustes") + '</h1>' +
    '<p class="lbl">' + t("premium") + '</p><div class="grupo">' +
      (esPremium() ? '<div class="op"><span>' + t("sosPremium") + '</span><small>✓</small></div>' : '<button class="op" id="aj-premium" style="color:var(--accent);font-weight:700"><span>' + t("hacetePremium") + '</span><small>›</small></button>') +
      '<div class="op"><span>' + (esPremium() ? t("espacioPremium") : t("espacioUsado", Math.round(minGuardados()), limiteMin())) + '</span></div>' +
      (esPremium() ? '' : '<div class="op"><span>' + t("creditosDormir", E.creditos.dormir) + '</span></div><div class="op"><span>' + t("creditosTele", E.creditos.tele) + '</span></div>') +
      '<button class="op" id="aj-restaurar">' + t("restaurar") + '</button>' +
      (PRUEBA_PAGOS ? (esPremium() ? '<button class="op peligro" id="aj-quitar">' + t("quitarPremium") + '</button>' : '') + '<button class="op" id="aj-reinicio">' + t("reiniciarPrueba") + '</button>' : '') +
    '</div>' + (PRUEBA_PAGOS ? '<p class="aviso" style="text-align:left">' + t("modoPrueba") + '</p>' : '') +
    '<p class="lbl">' + t("idioma") + '</p><div class="grupo">' + IDIOMAS.map(([id, nom]) => '<button class="op' + (id === L ? " on" : "") + '" data-idioma="' + id + '"><span>' + nom + '</span>' + (id === L ? "✓" : "") + '</button>').join("") + '</div><p class="aviso" style="text-align:left">' + t("idiomaTxt") + '</p>' +
    (cats && cats.paises ? '<p class="lbl">' + t("paisRanking") + '</p><div class="grupo">' + cats.paises.map(c => '<button class="op' + (c.id === E.pais ? " on" : "") + '" data-paisaj="' + c.id + '"><span>' + esc(c.nombre) + '</span>' + (c.id === E.pais ? "✓" : "") + '</button>').join("") + '</div>' : '') +
    '<p class="lbl">' + t("descargas") + '</p><div class="grupo"><div class="op"><span>' + t("espacio") + '</span><small>' + (n ? megas(total) + " (" + n + ")" : "0 MB") + '</small></div>' + (n ? '<button class="op peligro" id="aj-borrar">' + t("borrarTodas") + '</button>' : '') + '</div>' +
    '<p class="lbl">' + t("acerca") + '</p><div class="grupo">' +
      '<a class="op" href="' + abs("/privacidad?l=" + L) + '" target="_blank" rel="noopener">' + t("privacidad") + '<small>↗</small></a>' +
      '<a class="op" href="' + abs("/terminos?l=" + L) + '" target="_blank" rel="noopener">' + t("terminos") + '<small>↗</small></a>' +
      '<a class="op" href="mailto:dmith.builds@gmail.com?subject=Audiolibros%20Gratis">' + t("contacto") + '<small>dmith.builds@gmail.com</small></a>' +
      '<div class="op"><span>' + t("version") + '</span><small>' + VERSION + '</small></div></div>' +
    '<p class="lbl">' + t("tabClips") + '</p><div class="grupo"><button class="op" id="aj-gustos">' + t("reiniciarGustos") + '</button></div><p class="aviso" style="text-align:left">' + t("gustosTxt") + '</p>' +
    '<p class="lbl">' + t("creditos") + '</p><p class="sub" style="line-height:1.6">' + t("creditosTxt") + '</p>';
  V.querySelectorAll("[data-idioma]").forEach(b => b.onclick = () => cambiarIdioma(b.dataset.idioma));
  V.querySelectorAll("[data-paisaj]").forEach(b => b.onclick = () => { elegirPais(b.dataset.paisaj); vAjustes(); });
  if (!cats) api("/api/categorias").then(c => { cats = c; if (rutaActual() === "/ajustes") vAjustes(); }).catch(() => {});
  if ($("aj-premium")) $("aj-premium").onclick = () => muro("ajustes");
  if ($("aj-restaurar")) $("aj-restaurar").onclick = () => restaurarCompras();
  if ($("aj-quitar")) $("aj-quitar").onclick = () => { E.premium = false; guardar(); toast(t("premiumQuitado")); vAjustes(); };
  if ($("aj-reinicio")) $("aj-reinicio").onclick = () => { E.creditos = { dormir:PREMIUM.dormir, tele:PREMIUM.tele }; E.extra = null; E.clipsVistos = 0; guardar(); toast(t("reiniciado")); vAjustes(); };
  if ($("aj-gustos")) $("aj-gustos").onclick = () => { E.gustos = {}; guardar(); CL.lista = []; CL.pagina = 0; CL.hayMas = true; toast(t("gustosOk")); };
  if ($("aj-borrar")) $("aj-borrar").onclick = () => confirmar(t("borrarTodasQ"), async () => { for (const u of Object.keys(E.desc)) await DL.borrar(u); vAjustes(); });
}
function elegirPais(p){ if (p === E.pais) return; E.pais = p; guardar(); cacheInicio = null; CL.lista = []; CL.pagina = 0; CL.hayMas = true; }
function cambiarIdioma(id){
  if (id === L) return;
  L = E.idioma = id; E.pais = paisInicial(id); guardar(); CL.lista = []; CL.pagina = 0; CL.hayMas = true;
  cacheInicio = null; cats = null; cacheTop = null; for (const k in fichas) delete fichas[k];
  CONFIG = { afiliado:null }; api("/api/config").then(c => CONFIG = c).catch(() => {});
  traducirFijos(); pintarSueno(sueñoMin); if (P.item) pintarFicha();
  vAjustes();
}

// ================= Ficha de libro =================
const fichas = {};
async function traerLibro(id){ return fichas["l:" + id] || (fichas["l:" + id] = await api("/api/libro/" + encodeURIComponent(id))); }
function filaPista(item, p, i, tipo){
  const pr = E.progreso[p.url]; const visto = pr && pr.dur && pr.t / pr.dur > .95;
  const izq = tipo === "libro" ? '<span class="num">' + (visto ? "✓" : p.n || i + 1) + '</span>' : '';
  const arriba = tipo === "podcast" ? '<small>' + esc(fecha(p.fecha)) + '</small>' : '';
  const abajo = visto ? (tipo === "podcast" ? t("escuchado") : (p.duracion ? fmt(p.duracion) : ""))
    : (p.duracion ? (tipo === "podcast" ? largo(p.duracion) : fmt(p.duracion)) : "") + (pr && pr.t > 5 ? " · " + t("quedan", largo(pr.dur - pr.t)) : "");
  return '<div class="row" data-i="' + i + '" style="cursor:pointer">' + izq + '<div class="info">' + arriba + '<b>' + esc(p.titulo) + '</b><small>' + abajo + '</small></div><div class="acc">' + botonDL(p) + (tipo === "podcast" ? '<span class="ic">' + ICO.playC + '</span>' : '') + '</div></div>';
}
function botonDL(p){
  const u = pistaUrl(p, true), d = E.desc[u], b = DL.bajando[u];
  if (d) return '<button class="dl ok" data-dl="' + esc(u) + '" aria-label="' + t("descargado") + '">' + ICO.bajado + '</button>';
  if (b) return '<button class="dl bajando" data-dl="' + esc(u) + '" aria-label="' + t("descargando") + '"><span class="pc">' + (b.pct ? b.pct + "%" : "") + '</span></button>';
  return '<button class="dl" data-dl="' + esc(u) + '" aria-label="' + t("descargar") + '">' + ICO.bajar + '</button>';
}
function conectarFilas(item, pistas, seguido){
  V.querySelectorAll("#d-caps [data-i]").forEach(r => r.onclick = e => {
    const i = +r.dataset.i, b = e.target.closest(".dl");
    if (b) { e.stopPropagation(); return tocarDL(item, pistas[i]); }
    reproducir(item, pistas, i, seguido);
  });
}
async function vLibro(id){
  V.innerHTML = barraVolver() + '<div class="det"><div class="sk" style="width:200px;aspect-ratio:1"></div><div class="sk" style="height:22px;width:70%;margin-top:18px"></div></div>';
  const b = await traerLibro(id);
  const ult = E.recientes.find(r => r.item.id === b.id && r.item.tipo === "libro");
  const nc = b.capitulos.length;
  const tags = [b.licencia === "Dominio público" ? t("gratis") : "", largo(b.duracion), nc + " " + (nc === 1 ? t("capitulo") : t("capitulos")), b.capitulos[0] && b.capitulos[0].voces ? t("tresVoces") : ""].filter(Boolean);
  V.innerHTML = barraVolver() + '<div class="det">' + cover(b) + '<h1>' + esc(b.titulo) + '</h1><p class="sub">' + esc(b.autor) + '</p><div class="meta-l">' + tags.map(x => '<span>' + esc(x) + '</span>').join("") + '</div></div>' +
    '<div class="acciones"><button class="btn" id="d-play">' + ICO.play + (ult ? t("seguirEsc") : t("escuchar")) + '</button><button class="btn sec" id="d-lista" aria-label="' + t("miLista") + '"></button>' + (nc > 1 ? '<button class="btn sec" id="d-todo" aria-label="' + t("descargarTodo") + '">' + ICO.bajar + '</button>' : '') + '</div>' +
    (CONFIG.afiliado && !b.propio ? '<button class="btn pap" id="d-pap">' + ICO.libro + t("comprarPapel") + '</button><p class="aviso">' + t("avisoAfiliado") + '</p>' : '') +
    (b.descripcion ? '<div class="desc corta" id="d-desc">' + esc(b.descripcion) + '</div><button class="link" id="d-mas" style="margin-top:6px">' + t("leerMas") + '</button>' : '') +
    '<div class="fila-tit"><h2>' + t("capitulosT") + '</h2></div><div class="lista" id="d-caps">' + b.capitulos.map((c, i) => filaPista(b, c, i, "libro")).join("") + '</div>' +
    '<p class="fuente">' + (b.lectores && b.lectores.length ? esc(t("leidoPor", b.lectores.join(", "))) + "<br>" : "") + esc(b.fuente) + " · " + t("dominioPublico") + '</p>';
  const dl = $("d-lista"), x = corto(b);
  const pintar = () => dl.innerHTML = enLista(x) ? ICO.ok : ICO.mas;
  pintar(); dl.onclick = () => { alternarLista(x); pintar(); };
  $("d-play").onclick = () => ult ? continuar(ult) : reproducir(b, b.capitulos, 0);
  if ($("d-todo")) $("d-todo").onclick = () => { let n = 0; for (const c of b.capitulos) { if (E.desc[pistaUrl(c, true)]) continue; if (!DL.bajar(x, c)) break; n++; } if (n) toast(t("descargando")); };
  if ($("d-pap")) $("d-pap").onclick = () => abrirAfuera(CONFIG.afiliado.url.replace("{q}", encodeURIComponent(b.titulo + " " + b.autor)));
  conectarFilas(b, b.capitulos, true);
  leerMas();
  marcarSonando();
}
function leerMas(){
  if (!$("d-mas")) return;
  const d = $("d-desc");
  if (d.scrollHeight <= d.clientHeight + 4) { d.classList.remove("corta"); $("d-mas").remove(); }
  else $("d-mas").onclick = e => { d.classList.remove("corta"); e.target.remove(); };
}
async function escucharLibro(id){
  const ult = E.recientes.find(r => r.item.id === id);
  if (ult) return continuar(ult);
  try { const b = await traerLibro(id); reproducir(b, b.capitulos, 0); } catch (e) { toast(e.message); }
}
function alternarLista(x){
  const i = E.lista.findIndex(l => l.id === x.id && l.tipo === x.tipo);
  if (i >= 0) { E.lista.splice(i, 1); toast(t("sacadoLista")); } else { E.lista.unshift(corto(x)); toast(t("agregadoLista")); }
  guardar();
}
function abrirAfuera(url){
  if (NATIVO && PLUG.Browser) PLUG.Browser.open({ url });
  else window.open(url, "_blank", "noopener");
}

// ================= Ficha de podcast =================
async function vPodcast(id){
  V.innerHTML = barraVolver() + '<div class="det"><div class="sk" style="width:200px;aspect-ratio:1;border-radius:12px"></div><div class="sk" style="height:22px;width:70%;margin-top:18px"></div></div>';
  const p = fichas["p:" + id] || (fichas["p:" + id] = await api("/api/podcast/" + id));
  const pistas = p.episodios.map(e => ({ titulo:e.titulo, url:e.url, duracion:e.duracion, portada:e.portada, fecha:e.fecha, tamano:e.tamano }));
  V.innerHTML = barraVolver() + '<div class="det">' + cover(p) + '<h1>' + esc(p.titulo) + '</h1><p class="sub">' + esc(p.autor) + '</p><div class="meta-l">' + [p.genero, p.episodios.length + " " + t("episodios")].filter(Boolean).map(x => '<span>' + esc(x) + '</span>').join("") + '</div></div>' +
    '<div class="acciones"><button class="btn" id="p-sus"></button><button class="btn sec" id="p-ult" aria-label="' + t("escuchar") + '">' + ICO.play + '</button></div>' +
    (p.descripcion ? '<div class="desc corta" id="d-desc">' + esc(p.descripcion) + '</div><button class="link" id="d-mas" style="margin-top:6px">' + t("leerMas") + '</button>' : '') +
    '<div class="fila-tit"><h2>' + t("episodiosT") + '</h2></div><div class="lista" id="d-caps">' + (pistas.length ? pistas.map((e, i) => filaPista(p, e, i, "podcast")).join("") : '<div class="vacio">' + t("sinEpisodios") + '</div>') + '</div>' +
    '<p class="fuente">' + t("audioPodcast") + '</p>';
  const bs = $("p-sus"), x = corto(p);
  const pintar = () => { const s = suscripto(p.id); bs.innerHTML = s ? ICO.ok + t("siguiendo") : ICO.mas + t("seguir"); bs.className = s ? "btn sec" : "btn"; bs.style.flex = "1"; };
  pintar(); bs.onclick = () => { const i = E.subs.findIndex(s => s.id === p.id); if (i >= 0) E.subs.splice(i, 1); else { E.subs.unshift(x); toast(t("ahoraSeguis", p.titulo)); } guardar(); pintar(); };
  $("p-ult").onclick = () => pistas.length && reproducir(p, pistas, 0, false);
  conectarFilas(p, pistas, false);
  leerMas();
  marcarSonando();
}

// ================= Descargas =================
// En la app: se guardan como archivo en el teléfono (Capacitor Filesystem).
// En el navegador: se guardan en la caché del navegador, si el sitio del audio lo permite.
const CACHE_AUDIO = "ag-audio-v1";
const DL = {
  bajando: {},
  cola: [],
  activo: 0,
  nombre(url){ return "audio/" + hash(url).toString(36) + "-" + url.length + ".mp3"; },
  bajar(item, p){
    const url = pistaUrl(p, true);
    if (E.desc[url] || this.bajando[url]) return true;
    if (!puedeGuardar()) { muro("espacio", () => this.bajar(item, p)); return false; }
    this.bajando[url] = { pct:0 };
    this.cola.push({ item:corto(item), p, url });
    this.refrescar(url);
    this.siguiente();
    return true;
  },
  async siguiente(){
    if (this.activo >= 2 || !this.cola.length) return;
    const tarea = this.cola.shift(); this.activo++;
    try {
      const r = await (NATIVO ? this.bajarNativo(tarea) : this.bajarWeb(tarea));
      E.desc[tarea.url] = { item:tarea.item, pista:{ titulo:tarea.p.titulo, url:tarea.p.url, duracion:tarea.p.duracion, voces:tarea.p.voces, texto:tarea.p.texto }, bytes:r.bytes, uri:r.uri || null, ts:Date.now() };
      guardar();
      if (!this.cola.length) toast(t("descargaLista"));
    } catch (e) {
      toast(e.message === "cors" ? t("descargaWeb") : /quota|space|espacio/i.test(e.message) ? t("sinEspacio") : t("descargaError"));
      this.cola = this.cola.filter(x => { if (x.item.id === tarea.item.id) { delete this.bajando[x.url]; this.refrescar(x.url); return false; } return true; });
    }
    delete this.bajando[tarea.url];
    this.refrescar(tarea.url);
    this.activo--; this.siguiente();
  },
  async bajarWeb({ p, url }){
    if (!("caches" in window)) throw new Error("cors");
    let r;
    try { r = await fetch(abs(url), { mode:"cors" }); } catch (e) { throw new Error(navigator.onLine === false ? "red" : "cors"); }
    if (!r.ok) throw new Error("HTTP " + r.status);
    const total = +r.headers.get("content-length") || p.tamano || 0;
    let blob;
    if (r.body && r.body.getReader) {
      const lector = r.body.getReader(), partes = []; let n = 0, ult = 0;
      for (;;) {
        const { done, value } = await lector.read(); if (done) break;
        partes.push(value); n += value.length;
        if (total && Date.now() - ult > 400) { ult = Date.now(); this.bajando[url] = { pct:Math.min(99, Math.round(n / total * 100)) }; this.refrescar(url); }
      }
      blob = new Blob(partes, { type:"audio/mpeg" });
    } else blob = await r.blob();
    const c = await caches.open(CACHE_AUDIO);
    await c.put(url, new Response(blob, { headers:{ "Content-Type":"audio/mpeg", "Content-Length":String(blob.size) } }));
    return { bytes:blob.size };
  },
  async bajarNativo({ url }){
    const FS = PLUG.Filesystem; if (!FS) throw new Error("sin plugin");
    const path = this.nombre(url);
    const prog = PLUG.FileTransfer || FS;
    let escucha = null;
    try { escucha = await prog.addListener("progress", ev => { if (ev.url === abs(url) && ev.contentLength) { this.bajando[url] = { pct:Math.min(99, Math.round(ev.bytes / ev.contentLength * 100)) }; this.refrescar(url); } }); } catch (e) {}
    try {
      const { uri } = await FS.getUri({ directory:"DATA", path });
      if (PLUG.FileTransfer) await PLUG.FileTransfer.downloadFile({ url:abs(url), path:uri, progress:true });
      else await FS.downloadFile({ url:abs(url), path, directory:"DATA", recursive:true, progress:true });
      const st = await FS.stat({ directory:"DATA", path });
      return { bytes:st.size || 0, uri };
    } finally { if (escucha && escucha.remove) escucha.remove(); }
  },
  async fuente(url){
    const d = E.desc[url]; if (!d) return null;
    try {
      if (NATIVO && d.uri) return window.Capacitor.convertFileSrc(d.uri);
      const c = await caches.open(CACHE_AUDIO), r = await c.match(url);
      if (!r) { delete E.desc[url]; guardar(); return null; }
      return URL.createObjectURL(await r.blob());
    } catch (e) { return null; }
  },
  async borrar(url){
    const d = E.desc[url]; if (!d) return;
    try {
      if (NATIVO && PLUG.Filesystem) await PLUG.Filesystem.deleteFile({ directory:"DATA", path:this.nombre(url) });
      else if ("caches" in window) await (await caches.open(CACHE_AUDIO)).delete(url);
    } catch (e) {}
    delete E.desc[url]; guardar();
  },
  refrescar(url){
    V.querySelectorAll('.dl[data-dl]').forEach(b => {
      if (b.dataset.dl !== url) return;
      const r = b.closest("[data-i]"); if (!r) return;
      const p = { url:url }; b.outerHTML = botonDL(Object.assign(p, { voces:null }));
    });
  }
};
function tocarDL(item, p){
  const u = pistaUrl(p, true);
  if (E.desc[u]) confirmar(t("borrarDescarga"), async () => { await DL.borrar(u); DL.refrescar(u); toast(t("borrado")); });
  else if (!DL.bajando[u]) DL.bajar(item, p);
}

// ================= Premium, créditos y publicidad =================
// Gratis: 60 min sin internet (+20 por video, hasta 3 videos por día; al otro día vuelve a 60),
// Dormir 5 usos y Chromecast 3 usos (para siempre; un video da 1 uso más), publicidad cada 8 clips.
// Premium: todo sin límite y sin publicidad.
// Mientras no estén RevenueCat (PLUG.Purchases) ni AppLovin (PLUG.AppLovin), compras y anuncios son de prueba.
const PREMIUM = { base:60, porVideo:20, videosDia:3, cadaClips:8, dormir:5, tele:3 };
const PRUEBA_PAGOS = !(NATIVO && PLUG.Purchases), PRUEBA_ANUNCIOS = !(NATIVO && PLUG.AppLovin);
if (!E.creditos) E.creditos = { dormir:PREMIUM.dormir, tele:PREMIUM.tele };
const esPremium = () => !!E.premium;
const hoyStr = () => { const d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); };
function extraHoy(){ if (!E.extra || E.extra.dia !== hoyStr()) E.extra = { dia:hoyStr(), min:0, videos:0 }; return E.extra; }
const limiteMin = () => esPremium() ? Infinity : PREMIUM.base + extraHoy().min;
// Minutos de una pista: la duración que conocemos, o la estimamos por el tamaño (audio de ~64 kbps).
const minDe = (p, bytes) => ((p && p.duracion) || (bytes ? bytes / 8000 : (p && p.tamano ? p.tamano / 8000 : 1800))) / 60;
const minGuardados = () => Object.values(E.desc).reduce((a, d) => a + minDe(d.pista, d.bytes), 0);
const minEnCola = () => DL.cola.reduce((a, x) => a + minDe(x.p), 0) + 0;
// Lo guardado que pasa del límite de hoy queda con candado (se escucha con internet, no sin internet).
function conCandado(){
  const s = new Set(); if (esPremium()) return s;
  const lim = limiteMin(); let acc = 0;
  Object.entries(E.desc).sort((a, b) => a[1].ts - b[1].ts).forEach(([u, d]) => { if (acc >= lim) s.add(u); acc += minDe(d.pista, d.bytes); });
  return s;
}
function puedeGuardar(){ return esPremium() || minGuardados() + minEnCola() < limiteMin(); }
function gastarCredito(k){
  if (esPremium()) return true;
  if ((E.creditos[k] || 0) <= 0) return false;
  E.creditos[k]--; guardar();
  toast(t("usosQuedan", E.creditos[k]));
  return true;
}

// Ventana de publicidad. tipo "premio" = hay que verla entera; "corte" = se puede cerrar a los 5 s.
// Con AppLovin conectado se usa el anuncio real; si no, una ventana de prueba.
function verAnuncio(tipo){
  if (!PRUEBA_ANUNCIOS) {
    const ap = PLUG.AppLovin;
    return (tipo === "premio" ? ap.showRewarded() : ap.showInterstitial()).then(r => tipo !== "premio" || !!(r && r.rewarded)).catch(() => false);
  }
  return new Promise(ok => {
    const sonaba = !A.paused, clip = !AC.paused;
    A.pause(); RES.forEach(a => a.pause());
    const seg = tipo === "premio" ? 10 : 5;
    const el = document.createElement("div"); el.className = "anuncio";
    el.innerHTML = '<div class="an-top"><span>' + t("anuncio") + '</span><button class="an-x" disabled>' + t("seCierraEn", seg) + '</button></div>' +
      '<div class="an-c"><div class="an-logo">' + ICO.auris + '</div><b>' + t("anuncioPrueba") + '</b><p>' + t("anuncioPruebaTxt") + '</p><div class="an-bar"><i></i></div></div>';
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.classList.add("on"); el.querySelector(".an-bar i").style.transition = "width " + seg + "s linear"; el.querySelector(".an-bar i").style.width = "100%"; });
    let q = seg; const x = el.querySelector(".an-x");
    const tm = setInterval(() => { q--; if (q > 0) x.textContent = t("seCierraEn", q); else { clearInterval(tm); x.disabled = false; x.textContent = "✕ " + t("cerrar"); } }, 1000);
    x.onclick = () => { if (x.disabled) return; el.remove(); if (sonaba) A.play().catch(() => {}); ok(true); void clip; };
  });
}

// Pantalla para pasar a Premium (motivo: espacio, candado, dormir, tele o ajustes).
function muro(motivo, alGanar){
  const ex = extraHoy(), quedan = PREMIUM.videosDia - ex.videos;
  const tit = { espacio:"muroEspacio", candado:"muroCandado", dormir:"muroDormir", tele:"muroTele" }[motivo];
  const conVideo = motivo === "espacio" || motivo === "candado" ? (quedan > 0 ? "20" : "no") : (motivo === "dormir" || motivo === "tele" ? "1" : "");
  const el = document.createElement("div"); el.className = "muro";
  el.innerHTML = '<div class="mu-c"><button class="mu-x" aria-label="' + t("cerrar") + '">✕</button>' +
    '<div class="mu-logo">' + ICO.auris + '</div>' +
    (tit ? '<h2>' + t(tit) + '</h2><p class="mu-txt">' + t(tit + "Txt", PREMIUM.base + ex.min) + '</p>' : '<h2>' + t("hacetePremium") + '</h2>') +
    '<ul class="mu-ben">' + ["benSinPubli", "benSinLimite", "benDormir", "benTele"].map(k => '<li>' + ICO.ok + t(k) + '</li>').join("") + '</ul>' +
    '<button class="btn mu-plan" data-plan="anual"><span>' + t("planAnio") + '</span><small>' + t("ahorro") + '</small></button>' +
    '<button class="btn sec mu-plan" data-plan="mensual"><span>' + t("planMes") + '</span></button>' +
    (conVideo === "20" ? '<button class="mu-video" data-video="20">▶ ' + t("verVideo20") + '<small>' + t("quedanVideos", quedan) + '</small></button>' : '') +
    (conVideo === "no" ? '<p class="mu-nota">' + t("sinVideosHoy") + '</p>' : '') +
    (conVideo === "1" ? '<button class="mu-video" data-video="1">▶ ' + t("verVideo1") + '</button>' : '') +
    '<button class="link mu-rest">' + t("restaurar") + '</button>' + (PRUEBA_PAGOS ? '<p class="mu-nota">' + t("modoPrueba") + '</p>' : '') + '</div>';
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("on"));
  const cerrar = () => { el.classList.remove("on"); setTimeout(() => el.remove(), 250); };
  el.querySelector(".mu-x").onclick = cerrar;
  el.onclick = e => { if (e.target === el) cerrar(); };
  el.querySelectorAll(".mu-plan").forEach(b => b.onclick = () => comprar(b.dataset.plan).then(ok => { if (ok) { cerrar(); if (alGanar) alGanar(); } }));
  el.querySelector(".mu-rest").onclick = () => restaurarCompras().then(ok => { if (ok) cerrar(); });
  const bv = el.querySelector(".mu-video");
  if (bv) bv.onclick = async () => {
    cerrar();
    const visto = await verAnuncio("premio");
    if (!visto) return toast(t("anuncioCortado"));
    if (bv.dataset.video === "20") { const e2 = extraHoy(); e2.videos++; e2.min += PREMIUM.porVideo; guardar(); toast(t("ganaste20")); }
    else { const k = motivo === "dormir" ? "dormir" : "tele"; E.creditos[k] = (E.creditos[k] || 0) + 1; guardar(); toast(t("ganaste1")); }
    refrescarPremium();
    if (alGanar) alGanar();
  };
}
function comprar(plan){
  if (!PRUEBA_PAGOS) {
    // RevenueCat: paquetes "$rc_monthly" y "$rc_annual" de la oferta actual.
    const RC = PLUG.Purchases;
    return RC.getOfferings().then(o => {
      const pk = o.current && o.current.availablePackages.find(p => p.packageType === (plan === "anual" ? "ANNUAL" : "MONTHLY"));
      if (!pk) throw new Error("sin paquete");
      return RC.purchasePackage({ aPackage:pk });
    }).then(r => activarSiCorresponde(r && r.customerInfo)).catch(() => false);
  }
  return new Promise(ok => {
    const h = $("hoja");
    h.innerHTML = '<div class="agarre"></div><h3>' + t("compraPrueba") + '</h3><p class="sub" style="margin:0 4px 8px">' + t("compraPruebaTxt") + ' (' + t(plan === "anual" ? "planAnio" : "planMes") + ')</p><button class="op" style="color:var(--accent);font-weight:700" id="h-si">' + t("activarPrueba") + '</button><button class="op" id="h-no">' + t("cancelar") + '</button>';
    h.classList.add("on", "sobre"); $("hoja-fondo").classList.add("on", "sobre");
    $("h-si").onclick = () => { cerrarHoja(); E.premium = true; guardar(); toast(t("premiumOk")); refrescarPremium(); ok(true); };
    $("h-no").onclick = () => { cerrarHoja(); ok(false); };
  });
}
function activarSiCorresponde(info){
  const activo = !!(info && info.entitlements && info.entitlements.active && info.entitlements.active.premium);
  E.premium = activo; guardar(); refrescarPremium();
  if (activo) toast(t("premiumOk"));
  return activo;
}
function restaurarCompras(){
  if (PRUEBA_PAGOS) { toast(t("modoPrueba")); return Promise.resolve(false); }
  return PLUG.Purchases.restorePurchases().then(r => activarSiCorresponde(r && r.customerInfo)).catch(() => false);
}
// Repinta lo que depende de Premium en la pantalla actual.
function refrescarPremium(){
  const r = rutaActual();
  if (r === "/ajustes") vAjustes();
  else if (r === "/biblioteca/descargas") vBiblioteca("descargas");
}

// ================= Reproductor =================
const A = $("audio");
const P = { item:null, pistas:[], i:0, seguido:true, texto:null };
// Chromecast: mientras se transmite, el reproductor de la tele manda y el del teléfono queda en pausa.
const CS = { listo:false, activo:false, player:null, ctrl:null, cargando:false, carga:0, fin:false, ultimo:0 };
const ahora = () => CS.activo ? (CS.player.currentTime || 0) : A.currentTime;
const durAhora = () => (CS.activo && CS.player.duration) ? CS.player.duration : A.duration;
function irA(x){ if (CS.activo) { CS.player.currentTime = x; CS.ctrl.seek(); } else A.currentTime = x; }
function pausar(){ if (CS.activo) { if (!CS.player.isPaused) CS.ctrl.playOrPause(); } else A.pause(); }
function tocarYa(){ if (CS.activo) { if (CS.player.isPaused) CS.ctrl.playOrPause(); } else A.play().catch(() => {}); }
const VELS = [1, 1.25, 1.5, 1.75, 2, .75];
let VOCES = [], urlLocal = null;

// La url de la pista con la voz elegida (para libros narrados por nosotros).
function pistaUrl(p, cruda){ const u = p.voces ? (p.voces[E.voz] || p.url) : p.url; return cruda ? u : abs(u); }
function claveProg(p){ return p.url; }

// seguido = al terminar un capítulo pasa al siguiente (libros sí, podcasts no)
function reproducir(item, pistas, i, seguido = true, desde = null){
  P.item = corto(item); P.pistas = pistas; P.i = i; P.seguido = seguido;
  cargarPista(desde, true);
  abrirMini();
}
function continuar(r){ reproducir(r.item, r.pistas, r.i, r.item.tipo === "libro"); }
async function ponerFuente(p){
  const u = pistaUrl(p, true);
  let local = null;
  if (E.desc[u] && conCandado().has(u)) {
    // Con candado: con internet se escucha desde la red; sin internet, hay que destrabar.
    if (navigator.onLine === false) { muro("candado", () => cargarPista(null, true)); throw new Error("candado"); }
  } else local = await DL.fuente(u);
  if (urlLocal && urlLocal !== local && urlLocal.startsWith("blob:")) URL.revokeObjectURL(urlLocal);
  urlLocal = local;
  A.src = local || pistaUrl(p);
}
async function cargarPista(desde, tocar){
  const p = P.pistas[P.i]; if (!p) return;
  const pr = E.progreso[claveProg(p)];
  const t0 = desde != null ? desde : (pr && pr.dur && pr.t / pr.dur < .97 ? Math.max(0, pr.t - 3) : 0);
  $("full").classList.add("cargando"); pintarPlay(true);
  pintarFicha();
  registrarReciente();
  try { await ponerFuente(p); } catch (e) { $("full").classList.remove("cargando"); pintarPlay(); return; }
  if (P.pistas[P.i] !== p) return;
  A.playbackRate = E.vel;
  A.addEventListener("loadedmetadata", () => { if (t0) A.currentTime = Math.min(t0, (A.duration || t0 + 1) - 1); A.playbackRate = E.vel; }, { once:true });
  if (CS.activo) mandarACast(t0);
  else if (tocar) A.play().catch(() => { $("full").classList.remove("cargando"); pintarPlay(); });
  // Texto y voces (solo libros narrados por nosotros)
  $("f-voces").hidden = !p.voces;
  P.texto = null; $("f-texto").hidden = true; $("texto").innerHTML = "";
  if (p.texto) {
    try {
      const tx = await (await fetch(abs(p.texto))).json();
      if (P.pistas[P.i] !== p) return;
      P.texto = tx; pintarTexto();
    } catch (e) {}
  }
  if (p.voces && !VOCES.length) { try { VOCES = (await (await fetch(abs("/contenido/propios.json"))).json()).voces; } catch (e) {} }
  pintarVoces();
}
function registrarReciente(){
  const p = P.pistas[P.i];
  const r = { item:P.item, pistas:P.pistas.length > 60 ? P.pistas.slice(Math.max(0, P.i - 10), P.i + 50) : P.pistas, i:0, pista:{ titulo:p.titulo, url:p.url } };
  r.i = r.pistas.indexOf(p);
  E.recientes = [r].concat(E.recientes.filter(x => !(x.item.id === P.item.id && x.item.tipo === P.item.tipo))).slice(0, 30);
  guardar();
}
function pintarFicha(){
  const p = P.pistas[P.i], x = P.item;
  const img = Object.assign({}, x, p.portada ? { portada:p.portada } : {});
  $("mini-cv").outerHTML = cover(img).replace('class="cv', 'id="mini-cv" class="cv');
  $("f-cv").outerHTML = cover(img).replace('class="cv', 'id="f-cv" class="cv');
  $("mini-t").textContent = x.tipo === "podcast" ? p.titulo : x.titulo;
  $("mini-s").textContent = x.tipo === "podcast" ? x.titulo : p.titulo;
  $("f-t").textContent = x.tipo === "podcast" ? p.titulo : x.titulo;
  $("f-s").textContent = x.tipo === "podcast" ? x.titulo : (x.autor ? x.autor + " · " : "") + p.titulo;
  $("f-tipo").textContent = x.tipo === "podcast" ? t("podcast") : t("capituloDe", P.i + 1, P.pistas.length);
  $("ant").disabled = P.i <= 0 && x.tipo === "libro";
  $("sig").disabled = P.i >= P.pistas.length - 1;
  $("vel").textContent = E.vel + "×";
  $("vel").classList.toggle("on", E.vel !== 1);
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({ title:$("f-t").textContent, artist:x.tipo === "podcast" ? x.titulo : x.autor, album:x.tipo === "podcast" ? x.autor : p.titulo,
      artwork: img.portada ? [{ src:abs(img.portada), sizes:"512x512", type:"image/jpeg" }] : [] });
  }
  marcarSonando();
}
function marcarSonando(){
  if (!P.item) return;
  if (rutaActual() !== ruta(P.item).slice(1)) return;
  const actual = P.pistas[P.i] && P.pistas[P.i].url;
  V.querySelectorAll("#d-caps [data-i]").forEach(b => b.classList.toggle("on", (b.querySelector("b") || {}).textContent === (P.pistas[P.i] || {}).titulo && !!actual));
}
function pintarPlay(cargando){
  const sonando = CS.activo ? !CS.player.isPaused : !A.paused;
  if (CS.activo && CS.cargando) cargando = true;
  const ico = cargando ? ICO.carga : sonando ? ICO.pause : ICO.play;
  $("play").innerHTML = ico; $("mini-play").innerHTML = ico;
  $("play").setAttribute("aria-label", sonando ? "Pausa" : t("escuchar"));
  $("mini-play").setAttribute("aria-label", sonando ? "Pausa" : t("escuchar"));
}
function abrirMini(){ $("mini").classList.add("on"); }
function abrirFull(){ $("full").classList.add("on"); $("full").setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; }
function cerrarFull(silencioso){
  if (!$("full").classList.contains("on")) return;
  $("full").classList.remove("on"); $("full").setAttribute("aria-hidden", "true"); document.body.style.overflow = "";
  if (!silencioso && rutaActual() === "/reproductor") history.back();
}
$("mini").onclick = e => { if (!e.target.closest("#mini-play")) location.hash = "#/reproductor"; };
$("f-cerrar").onclick = () => rutaActual() === "/reproductor" ? history.back() : cerrarFull(true);
$("f-ir").onclick = () => { const r = ruta(P.item); cerrarFull(true); location.replace(r); };

const alternar = () => { if (!A.src) return; if (CS.activo) return CS.ctrl.playOrPause(); A.paused ? A.play().catch(() => {}) : A.pause(); };
$("play").onclick = alternar; $("mini-play").onclick = alternar;
const saltar = s => { const d = durAhora(); if (d) irA(Math.max(0, Math.min(d - .5, ahora() + s))); };
$("atras").onclick = () => saltar(-15);
$("adel").onclick = () => saltar(30);
function irPista(d){ const n = P.i + d; if (n < 0 || n >= P.pistas.length) { if (d < 0) irA(0); return; } guardarProgreso(); P.i = n; cargarPista(null, true); }
$("ant").onclick = () => (ahora() > 5 && P.item.tipo === "libro") ? irA(0) : irPista(-1);
$("sig").onclick = () => irPista(1);
$("vel").onclick = () => { E.vel = VELS[(VELS.indexOf(E.vel) + 1) % VELS.length]; A.playbackRate = E.vel; velCast(); guardar(); pintarFicha(); };

A.onplay = () => pintarPlay();
A.onplaying = () => { $("full").classList.remove("cargando"); pintarPlay(); };
A.onwaiting = () => pintarPlay(true);
A.onpause = () => { pintarPlay(); guardarProgreso(); };
A.onerror = () => { $("full").classList.remove("cargando"); pintarPlay(); if (A.src) toast(navigator.onLine === false ? t("sinInternet") : t("noAudio")); };
A.onended = () => alTerminar();
function alTerminar(){
  guardarProgreso(true);
  if (finCapitulo) { finCapitulo = false; sueñoMin = 0; pintarSueno(0); toast(t("buenasNoches")); return; }
  if (P.seguido && P.i < P.pistas.length - 1) irPista(1);
}

let ultGuardado = 0;
function guardarProgreso(fin){
  const p = P.pistas[P.i], d = durAhora(); if (!p || !d || !isFinite(d)) return;
  if (CS.activo && CS.fin && !fin) return;
  E.progreso[claveProg(p)] = { t: fin ? d : ahora(), dur: d, ts: Date.now() };
  const k = Object.keys(E.progreso); if (k.length > 800) k.sort((a, b) => E.progreso[a].ts - E.progreso[b].ts).slice(0, 200).forEach(x => delete E.progreso[x]);
  guardar();
}
let ultimaFr = null;
A.ontimeupdate = () => { if (!CS.activo) pintarTiempo(A.currentTime, A.duration); };
function pintarTiempo(tt, d){
  d = d || (P.pistas[P.i] || {}).duracion || 0;
  const pct = d ? Math.min(100, tt / d * 100) : 0;
  if (!arrastrando) { $("fill").style.width = pct + "%"; $("knob").style.left = pct + "%"; }
  $("mini-p").style.width = pct + "%";
  $("cur").textContent = fmt(tt); $("dur").textContent = "-" + fmt((d - tt) / (E.vel || 1));
  if (Date.now() - ultGuardado > 5000) { ultGuardado = Date.now(); guardarProgreso(); }
  if (P.texto) resaltar(tt);
  if ("mediaSession" in navigator && d && navigator.mediaSession.setPositionState) { try { navigator.mediaSession.setPositionState({ duration:d, position:Math.min(tt, d), playbackRate:E.vel || 1 }); } catch (e) {} }
}

// Barra de progreso arrastrable
let arrastrando = false;
function posBarra(e){ const r = $("bar").getBoundingClientRect(); return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); }
$("bar").addEventListener("pointerdown", e => { if (!durAhora()) return; arrastrando = true; $("bar").setPointerCapture(e.pointerId); const x = posBarra(e); $("fill").style.width = x * 100 + "%"; $("knob").style.left = x * 100 + "%"; });
$("bar").addEventListener("pointermove", e => { if (!arrastrando) return; const x = posBarra(e); $("fill").style.width = x * 100 + "%"; $("knob").style.left = x * 100 + "%"; $("cur").textContent = fmt(x * durAhora()); });
$("bar").addEventListener("pointerup", e => { if (!arrastrando) return; arrastrando = false; irA(posBarra(e) * durAhora()); });

// Controles de la pantalla bloqueada y auriculares
if ("mediaSession" in navigator) {
  const ms = navigator.mediaSession;
  ms.setActionHandler("play", () => tocarYa());
  ms.setActionHandler("pause", () => pausar());
  ms.setActionHandler("seekbackward", () => saltar(-15));
  ms.setActionHandler("seekforward", () => saltar(30));
  try { ms.setActionHandler("previoustrack", () => irPista(-1)); ms.setActionHandler("nexttrack", () => irPista(1)); ms.setActionHandler("seekto", e => irA(e.seekTime)); } catch (e) {}
}

// Temporizador para dormir
let sueñoT = null, finCapitulo = false, sueñoMin = 0;
function pintarSueno(min){ $("sueno-t").textContent = min === "fin" ? t("finCap") : min ? min + " min" : t("dormir"); $("sueno").classList.toggle("on", !!min); }
$("sueno").onclick = () => {
  if (!esPremium() && !sueñoMin && (E.creditos.dormir || 0) <= 0) return muro("dormir", () => $("sueno").onclick());
  elegirSueno();
};
const elegirSueno = () => hoja(t("apagarEn"), [[t("desactivado"), 0], [t("min15"), 15], [t("min30"), 30], [t("min45"), 45], [t("hora1"), 60], [t("alTerminar"), "fin"]], v => {
  if (v && !sueñoMin && !gastarCredito("dormir")) return muro("dormir");
  clearTimeout(sueñoT); finCapitulo = false; sueñoMin = v;
  if (v === "fin") finCapitulo = true;
  else if (v) sueñoT = setTimeout(() => { pausar(); sueñoMin = 0; pintarSueno(0); }, v * 60000);
  pintarSueno(v);
}, sueñoMin);

// Lista de capítulos / episodios
$("f-caps").onclick = () => hoja(P.item.tipo === "podcast" ? t("episodiosT") : t("capitulosT"), P.pistas.map((p, i) => [(P.item.tipo === "libro" ? (i + 1) + ". " : "") + p.titulo, i]), i => { if (i !== P.i) { guardarProgreso(); P.i = i; cargarPista(null, true); } }, P.i);

function hoja(titulo, ops, fn, actual){
  const h = $("hoja");
  h.innerHTML = '<div class="agarre"></div><h3>' + esc(titulo) + '</h3>' + ops.map(([tx, v], k) => '<button class="op' + (v === actual ? " on" : "") + '" data-k="' + k + '"><span>' + esc(tx) + '</span>' + (v === actual ? "✓" : "") + '</button>').join("");
  h.classList.add("on"); $("hoja-fondo").classList.add("on");
  h.querySelectorAll(".op").forEach(b => b.onclick = () => { cerrarHoja(); fn(ops[+b.dataset.k][1]); });
  const on = h.querySelector(".op.on"); if (on) on.scrollIntoView({ block:"center" });
}
function confirmar(pregunta, fn){
  const h = $("hoja");
  h.innerHTML = '<div class="agarre"></div><h3>' + esc(pregunta) + '</h3><button class="op" style="color:#FF8A80;font-weight:700" id="h-si">' + t("borrar") + '</button><button class="op" id="h-no">' + t("cancelar") + '</button>';
  h.classList.add("on"); $("hoja-fondo").classList.add("on");
  $("h-si").onclick = () => { cerrarHoja(); fn(); };
  $("h-no").onclick = cerrarHoja;
}
function cerrarHoja(){ $("hoja").classList.remove("on", "sobre"); $("hoja-fondo").classList.remove("on", "sobre"); }
$("hoja-fondo").onclick = cerrarHoja;

// Voces y texto sincronizado (libros narrados por nosotros)
function pintarVoces(){
  const p = P.pistas[P.i]; if (!p || !p.voces) return;
  $("voces").innerHTML = VOCES.filter(v => p.voces[v.id]).map(v => '<button class="voz" data-id="' + v.id + '" aria-pressed="' + (v.id === E.voz) + '"><b>' + esc(v.nombre) + '</b><small>' + esc(v.desc) + '</small></button>').join("");
  $("voces").querySelectorAll(".voz").forEach(b => b.onclick = () => cambiarVoz(b.dataset.id));
}
async function cambiarVoz(id){
  if (id === E.voz) return;
  let desde = 0;
  if (P.texto) { const k = fraseActual(A.currentTime); E.voz = id; desde = P.texto.voces[id].marcas[k][2]; }
  else { desde = A.currentTime; E.voz = id; }
  guardar();
  const seguir = !A.paused;
  A.pause();
  await ponerFuente(P.pistas[P.i]); A.playbackRate = E.vel;
  A.addEventListener("loadedmetadata", () => { A.currentTime = desde; A.playbackRate = E.vel; if (seguir) A.play(); }, { once:true });
  if (seguir) A.play().catch(() => {});
  pintarVoces();
}
const spans = {};
function pintarTexto(){
  const tx = P.texto; $("texto").innerHTML = ""; ultimaFr = null;
  tx.parrafos.forEach((frases, pi) => {
    const p = document.createElement("p");
    frases.forEach((f, fi) => { const s = document.createElement("span"); s.className = "fr"; s.textContent = f + " "; s.onclick = () => irAFrase(pi, fi); spans[pi + "-" + fi] = s; p.appendChild(s); });
    $("texto").appendChild(p);
  });
  $("f-texto").hidden = false;
}
function marcasVoz(){ return (P.texto.voces[E.voz] || Object.values(P.texto.voces)[0]).marcas; }
function fraseActual(tt){ const m = marcasVoz(); let k = 0; for (let i = 0; i < m.length; i++) if (m[i][2] <= tt + .05) k = i; return k; }
function irAFrase(pi, fi){ const m = marcasVoz().find(x => x[0] === pi && x[1] === fi); if (m) { A.currentTime = m[2]; A.play(); } }
function resaltar(tt){
  const m = marcasVoz()[fraseActual(tt)], s = spans[m[0] + "-" + m[1]];
  if (s === ultimaFr) return;
  if (ultimaFr) ultimaFr.classList.remove("on");
  s.classList.add("on"); ultimaFr = s;
  if (!A.paused && $("full").classList.contains("on")) { const r = s.getBoundingClientRect(); if (r.top < 60 || r.bottom > innerHeight - 40) s.scrollIntoView({ behavior:"smooth", block:"center" }); }
}

// ================= Transmitir a la tele (Chromecast / AirPlay) =================
// En el navegador: AirPlay en iPhone/Mac (Safari) y Chromecast donde Chrome lo permita.
// En la app compilada: Chromecast con el plugin nativo (PLUG.Chromecast) y AirPlay del sistema.
const CAST = { disponible:false, conectado:false };
function pintarCast(){
  const disp = CAST.disponible || CAST.cc;
  document.querySelectorAll("[data-cast], #f-cast").forEach(b => { b.hidden = !disp; b.classList.toggle("on", CAST.conectado); });
}

// Chromecast con el kit oficial de Google (Chrome en Android y en la compu).
// Manda a la tele la portada, el título y el autor, así se ve la imagen y no solo el audio.
const ES_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
if (!NATIVO && !ES_IOS && /Chrome\//.test(navigator.userAgent)) {
  window.__onGCastApiAvailable = ok => { if (ok) try { iniciarCast(); } catch (e) {} };
  const sc = document.createElement("script");
  sc.src = "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"; sc.async = true;
  document.head.appendChild(sc);
}
function iniciarCast(){
  const cf = cast.framework, ctx = cf.CastContext.getInstance();
  ctx.setOptions({ receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID, autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED });
  CS.player = new cf.RemotePlayer(); CS.ctrl = new cf.RemotePlayerController(CS.player); CS.listo = true; CS.modo = "web";
  const E2 = cf.RemotePlayerEventType;
  ctx.addEventListener(cf.CastContextEventType.CAST_STATE_CHANGED, e => { CAST.cc = e.castState !== cf.CastState.NO_DEVICES_AVAILABLE; CAST.conectado = e.castState === cf.CastState.CONNECTED || (!!A.webkitCurrentPlaybackTargetIsWireless); pintarCast(); });
  ctx.addEventListener(cf.CastContextEventType.SESSION_STATE_CHANGED, e => {
    const S = cf.SessionState;
    if (e.sessionState === S.SESSION_STARTED) { CS.activo = true; gastarCredito("tele"); if (A.src && P.pistas[P.i]) mandarACast(A.currentTime); }
    else if (e.sessionState === S.SESSION_RESUMED) { CS.activo = true; seguirFin(ctx.getCurrentSession()); }
    else if (e.sessionState === S.SESSION_ENDED) {
      const tt = CS.ultimo; CS.activo = false; CS.cargando = false;
      if (tt && A.src) { try { A.currentTime = tt; } catch (er) {} }
      pintarPlay(); guardarProgreso();
    }
  });
  CS.ctrl.addEventListener(E2.CURRENT_TIME_CHANGED, () => {
    if (!CS.activo) return;
    if (CS.player.currentTime) CS.ultimo = CS.player.currentTime;
    pintarTiempo(CS.player.currentTime || 0, CS.player.duration);
    if (Date.now() - ultGuardado > 5000) { ultGuardado = Date.now(); guardarProgreso(); }
  });
  CS.ctrl.addEventListener(E2.IS_PAUSED_CHANGED, () => { if (CS.activo) { pintarPlay(); guardarProgreso(); } });
  CS.ctrl.addEventListener(E2.PLAYER_STATE_CHANGED, () => { if (!CS.activo) return; if (CS.player.playerState === "PLAYING" || CS.player.playerState === "PAUSED") CS.cargando = false; pintarPlay(CS.player.playerState === "BUFFERING"); });
}
const tipoAudio = u => /\.m4a|\.mp4|\.aac/i.test(u) ? "audio/mp4" : /\.ogg|\.opus/i.test(u) ? "audio/ogg" : /\.wav/i.test(u) ? "audio/wav" : "audio/mpeg";
function mandarACast(desde){
  if (CS.modo === "nat") return mandarANativo(desde);
  const s = cast.framework.CastContext.getInstance().getCurrentSession(), p = P.pistas[P.i], x = P.item;
  if (!s || !p) return;
  const url = pistaUrl(p); // siempre la de internet: la tele no puede leer lo descargado en el teléfono
  const mi = new chrome.cast.media.MediaInfo(url, tipoAudio(url));
  mi.streamType = chrome.cast.media.StreamType.BUFFERED;
  const md = new chrome.cast.media.MusicTrackMediaMetadata();
  md.title = $("f-t").textContent;
  md.artist = x.tipo === "podcast" ? x.titulo : (x.autor || "");
  md.albumName = x.tipo === "podcast" ? (x.autor || "") : p.titulo;
  const img = abs(p.portada || x.portada);
  if (img) md.images = [new chrome.cast.Image(img)];
  mi.metadata = md;
  const req = new chrome.cast.media.LoadRequest(mi);
  req.currentTime = desde || 0; req.autoplay = true; req.playbackRate = E.vel || 1;
  A.pause();
  CS.fin = false; CS.cargando = true; CS.ultimo = desde || 0; pintarPlay(true);
  s.loadMedia(req).then(() => { CS.cargando = false; seguirFin(s); pintarPlay(); $("full").classList.remove("cargando"); },
    () => { CS.cargando = false; pintarPlay(); $("full").classList.remove("cargando"); toast(t("noAudio")); });
}
// Cuando la tele termina el capítulo, pasamos al siguiente como en el teléfono.
function seguirFin(s){
  const m = s && s.getMediaSession(); if (!m) return;
  const id = ++CS.carga;
  m.addUpdateListener(() => {
    if (id !== CS.carga || !CS.activo) return;
    if (m.playerState === chrome.cast.media.PlayerState.IDLE && m.idleReason === chrome.cast.media.IdleReason.FINISHED) { CS.carga++; CS.fin = true; alTerminar(); }
  });
}
function velCast(){
  if (!CS.activo || CS.modo !== "web") return;
  const s = cast.framework.CastContext.getInstance().getCurrentSession(), m = s && s.getMediaSession();
  if (m) s.sendMessage("urn:x-cast:com.google.cast.media", { type:"SET_PLAYBACK_RATE", playbackRate:E.vel, mediaSessionId:m.mediaSessionId, requestId:Date.now() % 1e9 }).catch(() => {});
}

// Chromecast en la app del iPhone / Android (plugin nativo de Google Cast).
// El plugin avisa los cambios de estado; el segundo a segundo lo calculamos acá.
if (NATIVO && PLUG.Chromecast) {
  const CC = PLUG.Chromecast, est = { t:0, en:0, jugando:false };
  CS.modo = "nat"; CS.listo = true;
  CS.player = { currentTime:0, duration:0, isPaused:true, playerState:"IDLE" };
  CS.ctrl = {
    playOrPause(){ (CS.player.isPaused ? CC.mediaPlay() : CC.mediaPause()); CS.player.isPaused = !CS.player.isPaused; est.jugando = !CS.player.isPaused; est.t = CS.player.currentTime; est.en = Date.now(); pintarPlay(); },
    seek(){ est.t = CS.player.currentTime; est.en = Date.now(); CC.mediaSeek({ currentTime:CS.player.currentTime }); }
  };
  const actualizar = m => {
    if (!m) return;
    if (typeof m.currentTime === "number") { est.t = m.currentTime; est.en = Date.now(); CS.player.currentTime = m.currentTime; }
    if (m.media && m.media.duration) CS.player.duration = m.media.duration;
    if (m.playerState) {
      CS.player.playerState = m.playerState;
      est.jugando = m.playerState === "PLAYING";
      CS.player.isPaused = m.playerState !== "PLAYING" && m.playerState !== "BUFFERING";
      if (m.playerState === "PLAYING" || m.playerState === "PAUSED") CS.cargando = false;
    }
    if (CS.activo) { pintarPlay(m.playerState === "BUFFERING"); guardarProgreso(); }
    if (CS.activo && m.playerState === "IDLE" && m.idleReason === "FINISHED" && CS.carga > 0) { CS.carga = 0; CS.fin = true; alTerminar(); }
  };
  const empezo = () => { CS.activo = true; CAST.conectado = true; pintarCast(); gastarCredito("tele"); if (A.src && P.pistas[P.i]) mandarACast(A.currentTime); };
  const termino = () => {
    if (!CS.activo) return;
    const tt = CS.ultimo; CS.activo = false; CS.cargando = false; CAST.conectado = false; pintarCast();
    if (tt && A.src) { try { A.currentTime = tt; } catch (er) {} }
    pintarPlay(); guardarProgreso();
  };
  CC.addListener("RECEIVER_LISTENER", e => { CAST.cc = !!(e && (e.available || e.isAvailable)); pintarCast(); });
  CC.addListener("SESSION_STARTED", empezo);
  CC.addListener("SESSION_RESUMED", () => { CS.activo = true; CAST.conectado = true; pintarCast(); });
  CC.addListener("SESSION_ENDED", termino);
  CC.addListener("MEDIA_UPDATE", actualizar);
  CC.addListener("MEDIA_LOAD", actualizar);
  setInterval(() => {
    if (!CS.activo || CS.modo !== "nat") return;
    if (est.jugando) CS.player.currentTime = est.t + (Date.now() - est.en) / 1000 * (E.vel || 1);
    if (CS.player.currentTime) CS.ultimo = CS.player.currentTime;
    pintarTiempo(CS.player.currentTime, CS.player.duration);
  }, 1000);
  Promise.resolve(CC.initialize({ appId:"CC1AD845" })).catch(() => {});
}
function mandarANativo(desde){
  const p = P.pistas[P.i], x = P.item; if (!p) return;
  const url = pistaUrl(p), img = abs(p.portada || x.portada);
  A.pause();
  CS.fin = false; CS.cargando = true; CS.ultimo = desde || 0; CS.carga = 1;
  CS.player.currentTime = desde || 0; CS.player.duration = A.duration || p.duracion || 0;
  pintarPlay(true);
  PLUG.Chromecast.loadMedia({
    contentId:url, contentType:tipoAudio(url), streamType:"buffered", autoPlay:true, currentTime:desde || 0,
    duration:CS.player.duration || 0,
    metadata:{ metadataType:0, title:$("f-t").textContent, subtitle:x.tipo === "podcast" ? x.titulo : (x.autor || p.titulo || ""), images: img ? [{ url:img }] : [] }
  }).then(m => { CS.cargando = false; $("full").classList.remove("cargando"); if (m && m.media && m.media.duration) CS.player.duration = m.media.duration; pintarPlay(); },
    () => { CS.cargando = false; $("full").classList.remove("cargando"); pintarPlay(); toast(t("noAudio")); });
}
if (window.WebKitPlaybackTargetAvailabilityEvent) {
  A.addEventListener("webkitplaybacktargetavailabilitychanged", e => { CAST.disponible = e.availability === "available"; pintarCast(); });
  A.addEventListener("webkitcurrentplaybacktargetiswirelesschanged", () => { CAST.conectado = !!A.webkitCurrentPlaybackTargetIsWireless; pintarCast(); });
} else if (A.remote && A.remote.watchAvailability) {
  A.remote.watchAvailability(d => { CAST.disponible = d; pintarCast(); }).catch(() => { CAST.disponible = false; pintarCast(); });
  ["connecting", "connect", "disconnect"].forEach(ev => A.remote.addEventListener(ev, () => { CAST.conectado = A.remote.state !== "disconnected"; pintarCast(); }));
}
// El Chromecast es de Premium: los demás tienen 3 usos gratis (AirPlay es del sistema y queda libre).
function permisoTele(){
  if (esPremium() || CS.activo) return true;
  if ((E.creditos.tele || 0) > 0) return true;
  muro("tele", () => transmitir());
  return false;
}
function transmitir(){
  if (!A.src) { toast(t("castPrimero")); return; }
  if (CS.modo === "nat") {
    const cc = () => PLUG.Chromecast.requestSession().catch(() => {});
    // Si hay Chromecast y también teles con AirPlay, que elija.
    if (!CS.activo && CAST.cc && CAST.disponible && A.webkitShowPlaybackTargetPicker)
      return hoja(t("transmitir"), [["Chromecast", "cc"], ["AirPlay", "ap"]], v => v === "cc" ? (permisoTele() && cc()) : A.webkitShowPlaybackTargetPicker());
    if (CS.activo || CAST.cc) return permisoTele() && cc();
  }
  if (CS.modo === "web" && (CAST.cc || CS.activo)) return permisoTele() && cast.framework.CastContext.getInstance().requestSession().catch(() => {});
  if (A.webkitShowPlaybackTargetPicker) return A.webkitShowPlaybackTargetPicker();
  if (A.remote && A.remote.prompt) return A.remote.prompt().catch(e => { if (e && e.name !== "AbortError") toast(t("castNo")); });
  toast(t("castNo"));
}
document.addEventListener("click", e => { if (e.target.closest("[data-cast], #f-cast")) transmitir(); });
new MutationObserver(() => pintarCast()).observe(V, { childList:true });

// ================= Varios =================
let toastT = null;
function toast(m){ const el = $("toast"); el.textContent = m; el.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("on"), 2800); }
addEventListener("pagehide", () => guardarProgreso());
document.addEventListener("visibilitychange", () => { if (document.hidden) guardarProgreso(); });
// Botón "atrás" de Android en la app: cierra hojas y reproductor antes de salir.
if (NATIVO && PLUG.App) PLUG.App.addListener("backButton", () => {
  if ($("hoja").classList.contains("on")) return cerrarHoja();
  if (rutaActual() !== "/" && rutaActual() !== "") return history.back();
  PLUG.App.minimizeApp ? PLUG.App.minimizeApp() : PLUG.App.exitApp();
});
traducirFijos();
pintarPlay();
router();
