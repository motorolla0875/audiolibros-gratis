// Idiomas que se sumaron después de español, inglés y portugués (esos están en server.js).
// Para cada idioma: cómo buscar libros en archive.org, países de los rankings de podcasts,
// nombres de las filas, géneros, temas de podcasts (palabras para buscar en Apple) y radios.

module.exports = {
  fr: {
    lang: '(fre OR fra OR French OR français OR Français)', pais: 'fr', rb: 'french', mundo: 'Monde francophone',
    paises: [['fr', 'France'], ['ca', 'Canada'], ['be', 'Belgique'], ['ch', 'Suisse']],
    palabras: 'le les des du et avec pour dans sur une est pas qui vous nous mon ton son au aux ce cette histoires',
    t: { seleccion: 'Notre sélection', topLibros: 'Top 10 livres audio', topPods: 'Podcasts les plus écoutés', podHistoria: "Podcasts d'histoire", podCuentos: 'Récits en podcast', populares: 'Les plus écoutés', destacado: 'À la une', topEn: 'N° {n} en {p}', gratis: 'Gratuit', radios: 'Radios en direct' },
    cat: { cuentos: 'Nouvelles', novela: 'Romans', poesia: 'Poésie', infantil: 'Jeunesse', historia: 'Histoire', filosofia: 'Philosophie', teatro: 'Théâtre', misterio: 'Mystère et horreur' },
    gen: { historia: ['Histoire', ['histoire', 'histoire de france', 'biographie']], ciencia: ['Sciences', ['science', 'astronomie', 'technologie']], cuentos: ['Contes et récits', ['contes', 'histoires pour dormir', 'fiction audio']],
      terror: ['Horreur et mystère', ['horreur', 'mystère', 'faits divers', 'paranormal']], negocios: ['Business', ['business', 'entrepreneuriat', 'finances personnelles', 'marketing']], humor: ['Humour', ['humour', 'comédie', 'drôle']],
      bienestar: ['Bien-être', ['méditation', 'bien-être', 'psychologie']], aprender: ['Apprendre', ['apprendre', 'éducation', 'philosophie']], deportes: ['Sport', ['football', 'sport']], audiolibros: ['Livres audio en podcast', ['livre audio', 'livres audio']] },
    radio: { noticias: 'Infos', musica: 'Musique', deportes: 'Sport' }
  },
  de: {
    lang: '(ger OR deu OR German OR Deutsch)', pais: 'de', rb: 'german', mundo: 'Deutschsprachig',
    paises: [['de', 'Deutschland'], ['at', 'Österreich'], ['ch', 'Schweiz']],
    palabras: 'der die das und mit von fur ist nicht ein eine den dem zu auf im uber geschichte geschichten mein dein wir ihr',
    t: { seleccion: 'Unsere Auswahl', topLibros: 'Top 10 Hörbücher', topPods: 'Meistgehörte Podcasts', podHistoria: 'Geschichts-Podcasts', podCuentos: 'Geschichten als Podcast', populares: 'Meistgehört', destacado: 'Empfohlen', topEn: 'Nr. {n} in {p}', gratis: 'Kostenlos', radios: 'Live-Radio' },
    cat: { cuentos: 'Erzählungen', novela: 'Romane', poesia: 'Gedichte', infantil: 'Kinder', historia: 'Geschichte', filosofia: 'Philosophie', teatro: 'Theater', misterio: 'Krimi und Grusel' },
    gen: { historia: ['Geschichte', ['geschichte', 'biografie', 'zweiter weltkrieg']], ciencia: ['Wissenschaft', ['wissenschaft', 'astronomie', 'technik']], cuentos: ['Geschichten', ['geschichten', 'gute nacht geschichten', 'hörspiel']],
      terror: ['Krimi und Grusel', ['true crime', 'krimi', 'mystery', 'gruselig']], negocios: ['Wirtschaft', ['wirtschaft', 'gründer', 'finanzen', 'marketing']], humor: ['Comedy', ['comedy', 'lustig', 'humor']],
      bienestar: ['Wohlbefinden', ['meditation', 'achtsamkeit', 'psychologie']], aprender: ['Lernen', ['lernen', 'bildung', 'philosophie']], deportes: ['Sport', ['fußball', 'sport']], audiolibros: ['Hörbücher als Podcast', ['hörbuch', 'hörbücher']] },
    radio: { noticias: 'Nachrichten', musica: 'Musik', deportes: 'Sport' }
  },
  it: {
    lang: '(ita OR Italian OR italiano OR Italiano)', pais: 'it', rb: 'italian', mundo: 'Mondo italofono',
    paises: [['it', 'Italia'], ['ch', 'Svizzera']],
    palabras: 'il gli della delle dei degli per che sono non nel nella storia storie mio tuo noi voi',
    t: { seleccion: 'La nostra selezione', topLibros: 'Top 10 audiolibri', topPods: 'Podcast più ascoltati', podHistoria: 'Podcast di storia', podCuentos: 'Racconti in podcast', populares: 'I più ascoltati', destacado: 'In evidenza', topEn: 'N. {n} in {p}', gratis: 'Gratis', radios: 'Radio in diretta' },
    cat: { cuentos: 'Racconti', novela: 'Romanzi', poesia: 'Poesia', infantil: 'Bambini', historia: 'Storia', filosofia: 'Filosofia', teatro: 'Teatro', misterio: 'Mistero e horror' },
    gen: { historia: ['Storia', ['storia', 'storia italiana', 'biografie']], ciencia: ['Scienza', ['scienza', 'astronomia', 'tecnologia']], cuentos: ['Racconti', ['racconti', 'favole', 'storie per dormire']],
      terror: ['Mistero e horror', ['true crime', 'mistero', 'horror', 'cronaca nera']], negocios: ['Business', ['business', 'imprenditori', 'finanza personale', 'marketing']], humor: ['Comicità', ['comicità', 'comedy', 'risate']],
      bienestar: ['Benessere', ['meditazione', 'benessere', 'psicologia']], aprender: ['Imparare', ['imparare', 'cultura', 'filosofia']], deportes: ['Sport', ['calcio', 'sport']], audiolibros: ['Audiolibri in podcast', ['audiolibro', 'audiolibri']] },
    radio: { noticias: 'Notizie', musica: 'Musica', deportes: 'Sport' }
  },
  nl: {
    lang: '(dut OR nld OR Dutch OR Nederlands)', pais: 'nl', rb: 'dutch', mundo: 'Nederlandstalig',
    paises: [['nl', 'Nederland'], ['be', 'België']],
    palabras: 'het een van met voor niet zijn wij ik jij verhalen geschiedenis',
    t: { seleccion: 'Onze keuze', topLibros: 'Top 10 luisterboeken', topPods: 'Meest beluisterde podcasts', podHistoria: 'Geschiedenispodcasts', podCuentos: 'Verhalen als podcast', populares: 'Meest beluisterd', destacado: 'Uitgelicht', topEn: 'Nr. {n} in {p}', gratis: 'Gratis', radios: 'Live radio' },
    cat: { cuentos: 'Verhalen', novela: 'Romans', poesia: 'Poëzie', infantil: 'Kinderen', historia: 'Geschiedenis', filosofia: 'Filosofie', teatro: 'Toneel', misterio: 'Mysterie en horror' },
    gen: { historia: ['Geschiedenis', ['geschiedenis', 'biografie', 'tweede wereldoorlog']], ciencia: ['Wetenschap', ['wetenschap', 'sterrenkunde', 'technologie']], cuentos: ['Verhalen', ['verhalen', 'luisterverhalen', 'sprookjes']],
      terror: ['Mysterie en misdaad', ['true crime', 'misdaad', 'mysterie']], negocios: ['Zakelijk', ['ondernemen', 'geld', 'marketing']], humor: ['Humor', ['humor', 'comedy', 'grappig']],
      bienestar: ['Welzijn', ['meditatie', 'mindfulness', 'psychologie']], aprender: ['Leren', ['leren', 'onderwijs', 'filosofie']], deportes: ['Sport', ['voetbal', 'sport']], audiolibros: ['Luisterboeken als podcast', ['luisterboek', 'luisterboeken']] },
    radio: { noticias: 'Nieuws', musica: 'Muziek', deportes: 'Sport' }
  },
  pl: {
    lang: '(pol OR Polish OR polski OR Polski)', pais: 'pl', rb: 'polish', mundo: 'Cały świat',
    paises: [['pl', 'Polska']],
    palabras: 'nie sie jest dla ze jak czy oraz tylko historie opowiesci',
    t: { seleccion: 'Nasz wybór', topLibros: 'Top 10 audiobooków', topPods: 'Najpopularniejsze podcasty', podHistoria: 'Podcasty historyczne', podCuentos: 'Opowieści w podcastach', populares: 'Najczęściej słuchane', destacado: 'Polecane', topEn: 'Nr {n} w kraju: {p}', gratis: 'Za darmo', radios: 'Radio na żywo' },
    cat: { cuentos: 'Opowiadania', novela: 'Powieści', poesia: 'Poezja', infantil: 'Dla dzieci', historia: 'Historia', filosofia: 'Filozofia', teatro: 'Dramat', misterio: 'Kryminał i horror' },
    gen: { historia: ['Historia', ['historia', 'historia polski', 'biografie']], ciencia: ['Nauka', ['nauka', 'astronomia', 'technologia']], cuentos: ['Opowieści', ['opowiadania', 'bajki', 'słuchowisko']],
      terror: ['Kryminał i groza', ['kryminalne', 'true crime', 'zagadki']], negocios: ['Biznes', ['biznes', 'finanse osobiste', 'marketing']], humor: ['Humor', ['humor', 'komedia', 'śmieszne']],
      bienestar: ['Dobrostan', ['medytacja', 'psychologia', 'rozwój osobisty']], aprender: ['Nauka języków i wiedza', ['edukacja', 'nauka angielskiego', 'filozofia']], deportes: ['Sport', ['piłka nożna', 'sport']], audiolibros: ['Audiobooki w podcastach', ['audiobook', 'audiobooki']] },
    radio: { noticias: 'Wiadomości', musica: 'Muzyka', deportes: 'Sport' }
  },
  tr: {
    lang: '(tur OR Turkish OR Türkçe)', pais: 'tr', rb: 'turkish', mundo: 'Tüm dünya',
    paises: [['tr', 'Türkiye']],
    palabras: 've bir ile icin bu ben sen biz siz hikaye hikayeler tarih nasil neden',
    t: { seleccion: 'Seçtiklerimiz', topLibros: 'İlk 10 sesli kitap', topPods: 'En çok dinlenen podcast\'ler', podHistoria: 'Tarih podcast\'leri', podCuentos: 'Hikâye podcast\'leri', populares: 'En çok dinlenenler', destacado: 'Öne çıkan', topEn: '{p} listesinde {n}. sırada', gratis: 'Ücretsiz', radios: 'Canlı radyo' },
    cat: { cuentos: 'Öyküler', novela: 'Romanlar', poesia: 'Şiir', infantil: 'Çocuk', historia: 'Tarih', filosofia: 'Felsefe', teatro: 'Tiyatro', misterio: 'Gizem ve korku' },
    gen: { historia: ['Tarih', ['tarih', 'osmanlı', 'biyografi']], ciencia: ['Bilim', ['bilim', 'astronomi', 'teknoloji']], cuentos: ['Hikâyeler', ['hikaye', 'masal', 'sesli öykü']],
      terror: ['Gizem ve korku', ['korku', 'gizem', 'suç']], negocios: ['İş dünyası', ['girişimcilik', 'finans', 'pazarlama']], humor: ['Mizah', ['mizah', 'komedi']],
      bienestar: ['İyi yaşam', ['meditasyon', 'psikoloji', 'kişisel gelişim']], aprender: ['Öğren', ['eğitim', 'ingilizce öğren', 'felsefe']], deportes: ['Spor', ['futbol', 'spor']], audiolibros: ['Podcast\'te sesli kitaplar', ['sesli kitap']] },
    radio: { noticias: 'Haberler', musica: 'Müzik', deportes: 'Spor' }
  },
  id: {
    lang: '(ind OR Indonesian OR Indonesia OR "Bahasa Indonesia")', pais: 'id', rb: 'indonesian', mundo: 'Seluruh dunia',
    paises: [['id', 'Indonesia']],
    palabras: 'dan yang di dengan untuk ini itu dari ke kita kamu aku cerita sejarah ngobrol obrolan',
    t: { seleccion: 'Pilihan kami', topLibros: 'Top 10 buku audio', topPods: 'Podcast paling banyak didengar', podHistoria: 'Podcast sejarah', podCuentos: 'Cerita dalam podcast', populares: 'Paling banyak didengar', destacado: 'Unggulan', topEn: 'No. {n} di {p}', gratis: 'Gratis', radios: 'Radio langsung' },
    cat: { cuentos: 'Cerita pendek', novela: 'Novel', poesia: 'Puisi', infantil: 'Anak-anak', historia: 'Sejarah', filosofia: 'Filsafat', teatro: 'Drama', misterio: 'Misteri dan horor' },
    gen: { historia: ['Sejarah', ['sejarah', 'sejarah indonesia', 'biografi']], ciencia: ['Sains', ['sains', 'astronomi', 'teknologi']], cuentos: ['Cerita', ['cerita', 'dongeng', 'cerita sebelum tidur']],
      terror: ['Horor dan misteri', ['horor', 'misteri', 'cerita seram']], negocios: ['Bisnis', ['bisnis', 'keuangan', 'pemasaran']], humor: ['Komedi', ['komedi', 'lucu']],
      bienestar: ['Kesejahteraan', ['meditasi', 'psikologi', 'kesehatan mental']], aprender: ['Belajar', ['belajar', 'pendidikan', 'belajar bahasa inggris']], deportes: ['Olahraga', ['sepak bola', 'olahraga']], audiolibros: ['Buku audio dalam podcast', ['buku audio', 'audiobook']] },
    radio: { noticias: 'Berita', musica: 'Musik', deportes: 'Olahraga' }
  },
  ru: {
    lang: '(rus OR Russian OR русский OR Русский)', pais: 'ru', rb: 'russian', mundo: 'Весь мир', escritura: /[Ѐ-ӿ]/,
    paises: [['ru', 'Россия'], ['kz', 'Казахстан'], ['by', 'Беларусь']],
    t: { seleccion: 'Наш выбор', topLibros: 'Топ-10 аудиокниг', topPods: 'Самые популярные подкасты', podHistoria: 'Подкасты об истории', podCuentos: 'Рассказы в подкастах', populares: 'Самые популярные', destacado: 'Рекомендуем', topEn: '№ {n}: {p}', gratis: 'Бесплатно', radios: 'Радио в эфире' },
    cat: { cuentos: 'Рассказы', novela: 'Романы', poesia: 'Поэзия', infantil: 'Детям', historia: 'История', filosofia: 'Философия', teatro: 'Драматургия', misterio: 'Детективы и ужасы' },
    gen: { historia: ['История', ['история', 'биографии', 'история россии']], ciencia: ['Наука', ['наука', 'астрономия', 'технологии']], cuentos: ['Рассказы', ['рассказы', 'сказки', 'аудиоспектакль']],
      terror: ['Детективы и мистика', ['тру крайм', 'мистика', 'страшные истории']], negocios: ['Бизнес', ['бизнес', 'финансы', 'маркетинг']], humor: ['Юмор', ['юмор', 'комедия', 'стендап']],
      bienestar: ['Здоровье и психология', ['медитация', 'психология']], aprender: ['Учёба', ['образование', 'английский язык', 'философия']], deportes: ['Спорт', ['футбол', 'спорт']], audiolibros: ['Аудиокниги в подкастах', ['аудиокнига', 'аудиокниги']] },
    radio: { noticias: 'Новости', musica: 'Музыка', deportes: 'Спорт' }
  },
  ar: {
    lang: '(ara OR Arabic OR العربية)', pais: 'sa', rb: 'arabic', mundo: 'العالم العربي', escritura: /[؀-ۿ]/,
    paises: [['sa', 'السعودية'], ['ae', 'الإمارات'], ['eg', 'مصر'], ['ma', 'المغرب'], ['jo', 'الأردن'], ['kw', 'الكويت'], ['qa', 'قطر']],
    t: { seleccion: 'اختياراتنا', topLibros: 'أفضل 10 كتب صوتية', topPods: 'البودكاست الأكثر استماعًا', podHistoria: 'بودكاست التاريخ', podCuentos: 'قصص في البودكاست', populares: 'الأكثر استماعًا', destacado: 'مميز', topEn: 'رقم {n} في {p}', gratis: 'مجاني', radios: 'راديو مباشر' },
    cat: { cuentos: 'قصص قصيرة', novela: 'روايات', poesia: 'شعر', infantil: 'أطفال', historia: 'تاريخ', filosofia: 'فلسفة', teatro: 'مسرح', misterio: 'غموض ورعب' },
    gen: { historia: ['تاريخ', ['تاريخ', 'سيرة', 'تاريخ اسلامي']], ciencia: ['علوم', ['علوم', 'فلك', 'تقنية']], cuentos: ['قصص', ['قصص', 'حكايات', 'روايات صوتية']],
      terror: ['رعب وغموض', ['رعب', 'غموض', 'جرائم']], negocios: ['أعمال', ['ريادة اعمال', 'مال', 'تسويق']], humor: ['كوميديا', ['كوميديا', 'ضحك']],
      bienestar: ['صحة نفسية', ['تأمل', 'علم النفس', 'تطوير الذات']], aprender: ['تعلّم', ['تعليم', 'تعلم الانجليزية', 'فلسفة']], deportes: ['رياضة', ['كرة القدم', 'رياضة']], audiolibros: ['كتب صوتية في البودكاست', ['كتاب صوتي', 'كتب صوتية']] },
    radio: { noticias: 'أخبار', musica: 'موسيقى', deportes: 'رياضة' }
  },
  hi: {
    lang: '(hin OR Hindi OR हिन्दी OR हिंदी)', pais: 'in', rb: 'hindi', mundo: 'पूरी दुनिया', escritura: /[ऀ-ॿ]/, aceptaIngles: true,
    paises: [['in', 'भारत']],
    t: { seleccion: 'हमारी पसंद', topLibros: 'टॉप 10 ऑडियोबुक', topPods: 'सबसे ज़्यादा सुने गए पॉडकास्ट', podHistoria: 'इतिहास के पॉडकास्ट', podCuentos: 'कहानियों के पॉडकास्ट', populares: 'सबसे ज़्यादा सुने गए', destacado: 'खास', topEn: '{p} में नंबर {n}', gratis: 'मुफ़्त', radios: 'लाइव रेडियो' },
    cat: { cuentos: 'कहानियाँ', novela: 'उपन्यास', poesia: 'कविता', infantil: 'बच्चों के लिए', historia: 'इतिहास', filosofia: 'दर्शन', teatro: 'नाटक', misterio: 'रहस्य और डर' },
    gen: { historia: ['इतिहास', ['इतिहास', 'history hindi', 'जीवनी']], ciencia: ['विज्ञान', ['विज्ञान', 'science hindi', 'टेक्नोलॉजी']], cuentos: ['कहानियाँ', ['कहानियाँ', 'hindi stories', 'कहानी']],
      terror: ['डर और रहस्य', ['horror hindi', 'डरावनी कहानियाँ', 'crime hindi']], negocios: ['बिज़नेस', ['business hindi', 'पैसा', 'शेयर बाज़ार']], humor: ['कॉमेडी', ['comedy hindi', 'कॉमेडी']],
      bienestar: ['सेहत और मन', ['ध्यान', 'meditation hindi', 'मनोविज्ञान']], aprender: ['सीखें', ['शिक्षा', 'english speaking', 'gyan']], deportes: ['खेल', ['क्रिकेट', 'cricket hindi']], audiolibros: ['ऑडियोबुक पॉडकास्ट', ['audiobook hindi', 'ऑडियोबुक']] },
    radio: { noticias: 'समाचार', musica: 'संगीत', deportes: 'खेल' }
  },
  ja: {
    lang: '(jpn OR Japanese OR 日本語)', pais: 'jp', rb: 'japanese', mundo: '全世界', escritura: /[぀-ヿ]/,
    paises: [['jp', '日本']],
    t: { seleccion: 'おすすめ', topLibros: 'オーディオブック トップ10', topPods: '人気のポッドキャスト', podHistoria: '歴史のポッドキャスト', podCuentos: '物語のポッドキャスト', populares: '人気', destacado: '注目', topEn: '{p}で{n}位', gratis: '無料', radios: 'ライブラジオ' },
    cat: { cuentos: '短編', novela: '小説', poesia: '詩', infantil: '子ども向け', historia: '歴史', filosofia: '哲学', teatro: '戯曲', misterio: 'ミステリー・ホラー' },
    gen: { historia: ['歴史', ['歴史', '日本史', '世界史']], ciencia: ['科学', ['科学', '宇宙', 'テクノロジー']], cuentos: ['物語', ['朗読', '物語', '怪談']],
      terror: ['ホラー・ミステリー', ['怪談', 'ミステリー', '事件']], negocios: ['ビジネス', ['ビジネス', 'お金', 'マーケティング']], humor: ['お笑い', ['お笑い', '芸人', 'ラジオ']],
      bienestar: ['ウェルネス', ['瞑想', '心理学', 'マインドフルネス']], aprender: ['学び', ['英語', '勉強', '哲学']], deportes: ['スポーツ', ['野球', 'サッカー', 'スポーツ']], audiolibros: ['朗読ポッドキャスト', ['朗読', 'オーディオブック']] },
    radio: { noticias: 'ニュース', musica: '音楽', deportes: 'スポーツ' }
  },
  ko: {
    lang: '(kor OR Korean OR 한국어)', pais: 'kr', rb: 'korean', mundo: '전 세계', escritura: /[가-힯ᄀ-ᇿ]/,
    paises: [['kr', '대한민국']],
    t: { seleccion: '추천 모음', topLibros: '오디오북 TOP 10', topPods: '인기 팟캐스트', podHistoria: '역사 팟캐스트', podCuentos: '이야기 팟캐스트', populares: '인기', destacado: '추천', topEn: '{p} {n}위', gratis: '무료', radios: '라이브 라디오' },
    cat: { cuentos: '단편', novela: '소설', poesia: '시', infantil: '어린이', historia: '역사', filosofia: '철학', teatro: '희곡', misterio: '미스터리·공포' },
    gen: { historia: ['역사', ['역사', '한국사', '세계사']], ciencia: ['과학', ['과학', '우주', '기술']], cuentos: ['이야기', ['오디오 드라마', '낭독', '동화']],
      terror: ['공포·미스터리', ['공포', '미스터리', '사건']], negocios: ['비즈니스', ['경제', '재테크', '마케팅']], humor: ['코미디', ['코미디', '예능']],
      bienestar: ['웰빙', ['명상', '심리학', '마음']], aprender: ['배우기', ['영어 공부', '교육', '철학']], deportes: ['스포츠', ['축구', '야구', '스포츠']], audiolibros: ['오디오북 팟캐스트', ['오디오북', '책 낭독']] },
    radio: { noticias: '뉴스', musica: '음악', deportes: '스포츠' }
  },
  zh: {
    lang: '(chi OR zho OR Chinese OR 中文 OR Mandarin)', pais: 'tw', rb: 'chinese', mundo: '全世界', escritura: /[一-鿿]/,
    paises: [['tw', '台湾'], ['hk', '香港'], ['sg', '新加坡']],
    t: { seleccion: '精选', topLibros: '有声书前 10 名', topPods: '热门播客', podHistoria: '历史播客', podCuentos: '故事播客', populares: '最多收听', destacado: '推荐', topEn: '{p} 第 {n} 名', gratis: '免费', radios: '直播电台' },
    cat: { cuentos: '短篇故事', novela: '小说', poesia: '诗歌', infantil: '儿童', historia: '历史', filosofia: '哲学', teatro: '戏剧', misterio: '悬疑与恐怖' },
    gen: { historia: ['历史', ['历史', '歷史', '中国历史']], ciencia: ['科学', ['科学', '科學', '天文']], cuentos: ['故事', ['故事', '有声小说', '睡前故事']],
      terror: ['恐怖与悬疑', ['恐怖', '悬疑', '懸疑']], negocios: ['商业', ['商业', '商業', '理财']], humor: ['喜剧', ['喜剧', '脱口秀', '搞笑']],
      bienestar: ['身心健康', ['冥想', '心理学', '心理學']], aprender: ['学习', ['学英语', '學英文', '哲学']], deportes: ['体育', ['体育', '足球', '籃球']], audiolibros: ['有声书播客', ['有声书', '有聲書']] },
    radio: { noticias: '新闻', musica: '音乐', deportes: '体育' }
  }
};
