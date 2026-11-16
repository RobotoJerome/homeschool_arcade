/*
 * SKATE MODE DATA — Shred the Globe
 * ---------------------------------
 * Every fact and every skater below was checked against the linked source
 * (Wikipedia article text) in November 2026. Source codes:
 *   "w:Title"  -> https://en.wikipedia.org/wiki/Title
 *   "b:Slug"   -> https://www.britannica.com/place/Slug
 *
 * Only places with verifiable skateboarding history are included, so Skate
 * Mode asks about these 32 countries and 22 states (the map still shows all).
 * "hide" = extra words blurred out in FLAG FLIP clues so they don't give the answer away.
 */
window.SKATE = {
  countries: {
    us: {
      hide: ["American", "California", "Californian"],
      facts: [
        { t: "Skateboarding was born here in the late 1940s or early 1950s, when California surfers wanted something to ride when the waves were flat. They called it 'sidewalk surfing'.", src: ["w:Skateboarding"] },
        { t: "In 1999, Tony Hawk landed the first documented '900' — two and a half full spins in the air — at the X Games.", src: ["w:Tony_Hawk", "w:X_Games"] }
      ],
      skaters: [
        { n: "Tony Hawk", d: "Vert legend from San Diego; first documented 900 (1999)", w: "Tony_Hawk" },
        { n: "Rodney Mullen", d: "Invented the flatground ollie, kickflip & heelflip", w: "Rodney_Mullen" },
        { n: "Nyjah Huston", d: "15 X Games golds; Olympic bronze at Paris 2024", w: "Nyjah_Huston" },
        { n: "Jagger Eaton", d: "Won skateboarding's first-ever Olympic medal (bronze, 2021); silver in 2024", w: "Jagger_Eaton" }
      ]
    },
    br: {
      hide: ["Brazilian"],
      facts: [
        { t: "When skateboarding debuted at the Tokyo 2020 Olympics, Brazil won three silver medals — by Kelvin Hoefler, Rayssa Leal, and Pedro Barros.", src: ["w:Kelvin_Hoefler", "w:Rayssa_Leal", "w:Pedro_Barros"] },
        { t: "Rayssa Leal went viral as a little kid with a video of a heelflip in a fairy costume. Tony Hawk shared it, and fans still call her 'Fadinha' — the Little Fairy of Skateboarding.", src: ["w:Rayssa_Leal"] }
      ],
      skaters: [
        { n: "Rayssa Leal", d: "Olympic silver (2020) and bronze (2024) in street", w: "Rayssa_Leal" },
        { n: "Bob Burnquist", d: "Born in Rio; first ever fakie 900 (2010); has his own permanent MegaRamp", w: "Bob_Burnquist" },
        { n: "Letícia Bufoni", d: "São Paulo street star; six-time X Games gold medalist", w: "Letícia_Bufoni" },
        { n: "Pedro Barros", d: "Park silver medalist at Tokyo 2020", w: "Pedro_Barros" },
        { n: "Gui Khury", d: "First person ever to land a 1080 on a vert ramp", w: "Gui_Khury" }
      ]
    },
    jp: {
      hide: ["Japanese"],
      facts: [
        { t: "Yuto Horigome won the first-ever Olympic gold in men's street skateboarding at Tokyo 2020 — then defended it at Paris 2024.", src: ["w:Yuto_Horigome_(skateboarder)"] },
        { t: "Momiji Nishiya won women's street gold at Tokyo 2020 at just 13, making her the youngest person ever to win an Olympic gold medal for Japan.", src: ["w:Momiji_Nishiya"] }
      ],
      skaters: [
        { n: "Yuto Horigome", d: "Two-time Olympic street champion (2020, 2024)", w: "Yuto_Horigome_(skateboarder)" },
        { n: "Momiji Nishiya", d: "Olympic street gold at age 13 (Tokyo 2020)", w: "Momiji_Nishiya" },
        { n: "Sakura Yosozumi", d: "First Olympic women's park champion (Tokyo 2020)", w: "Sakura_Yosozumi" },
        { n: "Cocona Hiraki", d: "Park silver at Tokyo 2020 at age 12 — and again at Paris 2024", w: "Cocona_Hiraki" },
        { n: "Coco Yoshizawa", d: "Women's street gold at Paris 2024", w: "Coco_Yoshizawa" },
        { n: "Funa Nakayama", d: "Olympic bronze (2020); first Asian woman on the cover of Thrasher", w: "Funa_Nakayama" }
      ]
    },
    au: {
      hide: ["Australian", "Australia's"],
      facts: [
        { t: "Keegan Palmer won the first-ever Olympic men's park gold at Tokyo 2020, then won it again at Paris 2024.", src: ["w:Keegan_Palmer"] },
        { t: "Arisa Trew won park gold at Paris 2024 at age 14, becoming the country's youngest Olympic champion ever. She was also the first female skater to land a 720 and a 900 in competition.", src: ["w:Arisa_Trew"] }
      ],
      skaters: [
        { n: "Keegan Palmer", d: "Two-time Olympic park champion (2020, 2024)", w: "Keegan_Palmer" },
        { n: "Arisa Trew", d: "Grew up on the Gold Coast; Olympic park gold at 14", w: "Arisa_Trew" },
        { n: "Tas Pappas", d: "Melbourne vert star of the 1990s", w: "Tas_Pappas" },
        { n: "Shane O'Neill", d: "Melbourne street pro; member of Street League's '9 Club'", w: "Shane_O'Neill_(skateboarder)" },
        { n: "Chloe Covell", d: "Street skater at the Paris 2024 Olympics", w: "Chloe_Covell" }
      ]
    },
    gb: {
      hide: ["British", "Britain", "England", "English"],
      facts: [
        { t: "The skate spot in the Undercroft beneath London's Southbank Centre is hailed as the birthplace of British skateboarding.", src: ["w:Southbank_Centre"] },
        { t: "Sky Brown won bronze in park at Tokyo 2020, becoming Great Britain's youngest-ever Olympic medalist — and won bronze again at Paris 2024.", src: ["w:Sky_Brown"] }
      ],
      skaters: [
        { n: "Sky Brown", d: "Two-time Olympic bronze medalist in park", w: "Sky_Brown" },
        { n: "Geoff Rowley", d: "From Liverpool; Thrasher Skater of the Year 2000", w: "Geoff_Rowley" },
        { n: "Tom Penny", d: "Grew up skating in Oxford; Flip Skateboards pro", w: "Tom_Penny" },
        { n: "Lola Tambling", d: "British park champion; skated at Paris 2024", w: "Lola_Tambling" }
      ]
    },
    ca: {
      hide: ["Canadian"],
      facts: [
        { t: "Mark Appleyard was named Thrasher magazine's Skater of the Year in 2003.", src: ["w:Mark_Appleyard"] },
        { t: "Andy Anderson is famous for mixing old-school freestyle tricks with modern skating — and for always wearing a helmet, which is very unusual for a pro skater.", src: ["w:Andy_Anderson_(skateboarder)"] }
      ],
      skaters: [
        { n: "Mark Appleyard", d: "Thrasher Skater of the Year 2003", w: "Mark_Appleyard" },
        { n: "Andy Anderson", d: "Creative freestyle-meets-street style", w: "Andy_Anderson_(skateboarder)" },
        { n: "Pierre-Luc Gagnon", d: "Canadian pro known by his initials, 'PLG'", w: "Pierre-Luc_Gagnon" },
        { n: "Ryan Decenzo", d: "Street skater who has competed in more than 20 X Games", w: "Ryan_Decenzo" },
        { n: "Annie Guglia", d: "Montreal skater who competed at Tokyo 2020", w: "Annie_Guglia" }
      ]
    },
    fr: {
      hide: ["French"],
      facts: [
        { t: "At the Paris 2024 Olympics, the skateboarding contests were held right in the heart of the capital, at the Place de la Concorde.", src: ["w:Skateboarding_at_the_2024_Summer_Olympics"] },
        { t: "Vincent Matheron from Marseille skated in the very first Olympic men's park event, at Tokyo 2020.", src: ["w:Vincent_Matheron"] }
      ],
      skaters: [
        { n: "Aurélien Giraud", d: "Street pro from Lyon", w: "Aurélien_Giraud" },
        { n: "Vincent Matheron", d: "Park skater from Marseille; Tokyo 2020 Olympian", w: "Vincent_Matheron" },
        { n: "Lucas Puig", d: "Grew up in Toulouse; rides for Palace Skateboards", w: "Lucas_Puig" },
        { n: "Charlotte Hym", d: "Street skater — and a neuroscientist!", w: "Charlotte_Hym" }
      ]
    },
    es: {
      hide: ["Spanish"],
      facts: [
        { t: "The plaza in front of Barcelona's Museum of Contemporary Art (MACBA) is known as one of the most iconic skate spots in the world.", src: ["w:Barcelona_Museum_of_Contemporary_Art"] },
        { t: "Danny León finished 9th in the men's park event at Tokyo 2020, skateboarding's Olympic debut.", src: ["w:Danny_León"] }
      ],
      skaters: [
        { n: "Danny León", d: "Park skater; 9th at Tokyo 2020", w: "Danny_León" },
        { n: "Jaime Mateu", d: "From Palma de Mallorca; 4th at the 2018 park World Championships", w: "Jaime_Mateu" }
      ]
    },
    de: {
      hide: ["German"],
      facts: [
        { t: "The city of Münster was a skateboarding hot spot in the 1990s: Willy Santos won the Münster World Cup street contest in 1997, and Arto Saari took silver at the world championships there in 1998.", src: ["w:Willy_Santos", "w:Arto_Saari"] },
        { t: "Lilly Stoephasius, a three-time national park champion, skated in the first-ever Olympic women's park event at Tokyo 2020.", src: ["w:Lilly_Stoephasius"] }
      ],
      skaters: [
        { n: "Lilly Stoephasius", d: "Three-time national park champion; Tokyo 2020 Olympian", w: "Lilly_Stoephasius" },
        { n: "Tyler Edtmayer", d: "From Lenggries; Olympic park skater in 2020 and 2024", w: "Tyler_Edtmayer" }
      ]
    },
    se: {
      hide: ["Swedish", "Swede"],
      facts: [
        { t: "Bryggeriets Gymnasium in Malmö is a high school that includes skateboarding as part of the curriculum.", src: ["w:Oskar_Rozenberg"] },
        { t: "In the 1980s, Per Welinder was a freestyle star of Powell-Peralta's famous 'Bones Brigade', and Tony Magnusson invented tricks and co-owned H-Street Skateboards.", src: ["w:Per_Welinder", "w:Tony_Magnusson"] }
      ],
      skaters: [
        { n: "Oskar Rozenberg", d: "From Malmö; competed in park at Tokyo 2020", w: "Oskar_Rozenberg" },
        { n: "Ali Boulala", d: "Born in Stockholm; appeared in Flip's 'Sorry' videos", w: "Ali_Boulala" },
        { n: "Per Welinder", d: "Bones Brigade freestyle legend", w: "Per_Welinder" },
        { n: "Tony Magnusson", d: "Trick inventor; co-owner of H-Street and Osiris", w: "Tony_Magnusson" }
      ]
    },
    dk: {
      hide: ["Danish", "Dane"],
      facts: [
        { t: "At Tokyo 2020, Copenhagen's Rune Glifberg became the oldest skateboarder ever to compete at the Olympics — at age 46.", src: ["w:Rune_Glifberg"] },
        { t: "Viktor Solmunde, a World Skateboarding Championship bronze medalist, represented the country at Paris 2024.", src: ["w:Viktor_Solmunde"] }
      ],
      skaters: [
        { n: "Rune Glifberg", d: "'The Danish Destroyer'; 12 X Games medals", w: "Rune_Glifberg" },
        { n: "Viktor Solmunde", d: "Paris 2024 Olympian", w: "Viktor_Solmunde" }
      ]
    },
    fi: {
      hide: ["Finnish", "Finn"],
      facts: [
        { t: "Arto Saari, born in Seinäjoki, was named Thrasher's Skater of the Year in 2001 — one of only two Europeans ever to win it.", src: ["w:Arto_Saari"] },
        { t: "Heili Sirviö skated in the women's park event at the Paris 2024 Olympics when she was just 13.", src: ["w:Heili_Sirviö"] }
      ],
      skaters: [
        { n: "Arto Saari", d: "Thrasher Skater of the Year 2001; also a photographer", w: "Arto_Saari" },
        { n: "Heili Sirviö", d: "Paris 2024 park Olympian", w: "Heili_Sirviö" },
        { n: "Lizzie Armanto", d: "American-Finnish pro on Tony Hawk's Birdhouse team", w: "Lizzie_Armanto" }
      ]
    },
    no: {
      hide: ["Norwegian"],
      facts: [
        { t: "From 1978 to 1989, owning, selling, or using a skateboard was against the law here, because of how many injuries boards were causing.", src: ["w:Skateboarding"] },
        { t: "During the ban, skaters kept going anyway — building ramps hidden in the forest and other secret spots.", src: ["w:Skateboarding"] }
      ],
      skaters: []
    },
    nl: {
      hide: ["Dutch"],
      facts: [
        { t: "Keet Oldenbeuving was the youngest athlete on the team at Tokyo 2020 — and she carried the flag at the opening ceremony.", src: ["w:Keet_Oldenbeuving"] },
        { t: "Roos Zwetsloot finished 5th in the very first Olympic women's street final at Tokyo 2020.", src: ["w:Roos_Zwetsloot"] }
      ],
      skaters: [
        { n: "Keet Oldenbeuving", d: "Street skater and Tokyo 2020 flag bearer", w: "Keet_Oldenbeuving" },
        { n: "Roos Zwetsloot", d: "5th in women's street at Tokyo 2020", w: "Roos_Zwetsloot" },
        { n: "Candy Jacobs", d: "Silver at the 2018 European Championships", w: "Candy_Jacobs" }
      ]
    },
    it: {
      hide: ["Italian"],
      facts: [
        { t: "Asia Lanzi skated in women's street at Tokyo 2020, the first time skateboarding was ever in the Olympics.", src: ["w:Asia_Lanzi"] },
        { t: "Alessandro Mazzara, from Erice in Sicily, finished 12th in the men's park event at Tokyo 2020.", src: ["w:Alessandro_Mazzara"] }
      ],
      skaters: [
        { n: "Asia Lanzi", d: "Tokyo 2020 street Olympian", w: "Asia_Lanzi" },
        { n: "Alessandro Mazzara", d: "Park skater from Sicily", w: "Alessandro_Mazzara" }
      ]
    },
    pt: {
      hide: ["Portuguese"],
      facts: [
        { t: "Gustavo Ribeiro won bronze in street at the 2019 World Skateboarding Championship.", src: ["w:Gustavo_Ribeiro"] },
        { t: "In 2022, Ribeiro won the Street League Skateboarding Super Crown — one of the biggest titles in street skating. He's also a two-time Olympian (2020, 2024).", src: ["w:Gustavo_Ribeiro"] }
      ],
      skaters: [
        { n: "Gustavo Ribeiro", d: "SLS Super Crown champion (2022)", w: "Gustavo_Ribeiro" }
      ]
    },
    ar: {
      hide: ["Argentine", "Argentinian"],
      facts: [
        { t: "Milton Martinez was named Thrasher magazine's Skater of the Year in 2019.", src: ["w:Milton_Martinez"] },
        { t: "Matías Dell Olio, a World Skateboarding Championship silver medalist, represented the country at Paris 2024.", src: ["w:Matías_Dell_Olio"] }
      ],
      skaters: [
        { n: "Milton Martinez", d: "Thrasher Skater of the Year 2019", w: "Milton_Martinez" },
        { n: "Matías Dell Olio", d: "World Championship silver medalist; Paris 2024 Olympian", w: "Matías_Dell_Olio" }
      ]
    },
    cl: {
      hide: ["Chilean"],
      facts: [
        { t: "Josefina Tapia, a three-time national park champion, competed in the first-ever Olympic women's park event at Tokyo 2020.", src: ["w:Josefina_Tapia"] }
      ],
      skaters: [
        { n: "Josefina Tapia", d: "Three-time national park champion; Tokyo 2020 Olympian", w: "Josefina_Tapia" }
      ]
    },
    pe: {
      hide: ["Peruvian"],
      facts: [
        { t: "Ángelo Caro skated in the men's street event at Tokyo 2020, and he has won medals at the World Championships and the Pan American Games.", src: ["w:Ángelo_Caro"] }
      ],
      skaters: [
        { n: "Ángelo Caro", d: "Tokyo 2020 street Olympian", w: "Ángelo_Caro" }
      ]
    },
    co: {
      hide: ["Colombian"],
      facts: [
        { t: "Jhancarlos González skated in men's street at Tokyo 2020 and won a Dew Tour men's street qualifier.", src: ["w:Jhancarlos_González"] }
      ],
      skaters: [
        { n: "Jhancarlos González", d: "Tokyo 2020 street Olympian", w: "Jhancarlos_González" }
      ]
    },
    za: {
      hide: ["South African"],
      facts: [
        { t: "Dallas Oberholzer skated in the Olympic park event at Tokyo 2020 at age 46 — and came back to compete again at Paris 2024.", src: ["w:Dallas_Oberholzer"] },
        { t: "Skateistan, a charity that teaches kids through skateboarding, opened a skate school in Johannesburg in 2014.", src: ["w:Skateistan"] }
      ],
      skaters: [
        { n: "Dallas Oberholzer", d: "Two-time Olympic park skater (2020, 2024)", w: "Dallas_Oberholzer" },
        { n: "Brandon Valjalo", d: "Olympic street skater who hosts events across Africa", w: "Brandon_Valjalo" }
      ]
    },
    cn: {
      hide: ["Chinese"],
      facts: [
        { t: "SMP Skatepark in Shanghai, finished in 2004, was once the largest skatepark in the world.", src: ["w:Skateboarding_in_China"] },
        { t: "At 14, Cui Chenxi won women's street gold at the 2023 Asian Games in Hangzhou — the youngest Chinese gold medalist in Asian Games history.", src: ["w:Cui_Chenxi"] }
      ],
      skaters: [
        { n: "Cui Chenxi", d: "Asian Games street champion at 14", w: "Cui_Chenxi" },
        { n: "Zeng Wenhui", d: "6th in the first Olympic women's street final (2021)", w: "Zeng_Wenhui" }
      ]
    },
    ph: {
      hide: ["Filipino", "Filipina"],
      facts: [
        { t: "Margielyn Didal from Cebu City won gold in women's street skateboarding at the 2018 Asian Games.", src: ["w:Margielyn_Didal"] },
        { t: "Willy Santos was one of the original skaters on Tony Hawk's Birdhouse team and TransWorld Skateboarding's 1992 skater of the year.", src: ["w:Willy_Santos"] }
      ],
      skaters: [
        { n: "Margielyn Didal", d: "2018 Asian Games street champion", w: "Margielyn_Didal" },
        { n: "Willy Santos", d: "Original Birdhouse team member", w: "Willy_Santos" }
      ]
    },
    id: {
      hide: ["Indonesian"],
      facts: [
        { t: "Bunga Nyimas won bronze in street at the 2018 Asian Games at age 12, the youngest medalist of those Games.", src: ["w:Bunga_Nyimas"] },
        { t: "Sanggoe Darma Tanjung is a two-time Asian Games silver medalist in street skateboarding.", src: ["w:Sanggoe_Darma_Tanjung"] }
      ],
      skaters: [
        { n: "Bunga Nyimas", d: "Asian Games medalist at age 12", w: "Bunga_Nyimas" },
        { n: "Sanggoe Darma Tanjung", d: "Two-time Asian Games silver medalist", w: "Sanggoe_Darma_Tanjung" }
      ]
    },
    th: {
      hide: ["Thai"],
      facts: [
        { t: "Vareeraya Sukasem became the first skateboarder from the country ever to compete at the Olympics, at Paris 2024.", src: ["w:Vareeraya_Sukasem"] },
        { t: "Street legend Eric Koston, Thrasher's Skater of the Year in 1996, was born here.", src: ["w:Eric_Koston"] }
      ],
      skaters: [
        { n: "Vareeraya Sukasem", d: "First Olympic skateboarder from the country (2024)", w: "Vareeraya_Sukasem" },
        { n: "Eric Koston", d: "Born here; co-owner of The Berrics", w: "Eric_Koston" }
      ]
    },
    nz: {
      hide: ["Kiwi"],
      facts: [
        { t: "Levi Hawken — pro skater, sculptor, and graffiti artist — is famous for hill bombing the steep streets of Auckland.", src: ["w:Levi_Hawken"] }
      ],
      skaters: [
        { n: "Levi Hawken", d: "Auckland hill-bomb legend and artist", w: "Levi_Hawken" }
      ]
    },
    pl: {
      hide: ["Polish"],
      facts: [
        { t: "Amelia Brodka, a two-time European park champion, qualified for the first-ever Olympic women's park event and runs the Exposure Skate organization.", src: ["w:Amelia_Brodka"] }
      ],
      skaters: [
        { n: "Amelia Brodka", d: "Two-time European park champion", w: "Amelia_Brodka" }
      ]
    },
    be: {
      hide: ["Belgian"],
      facts: [
        { t: "Axel Cruysberghs and Lore Bruggeman both skated street for the country at Tokyo 2020, the first Olympics with skateboarding.", src: ["w:Axel_Cruysberghs", "w:Lore_Bruggeman"] }
      ],
      skaters: [
        { n: "Axel Cruysberghs", d: "X Games and Tokyo 2020 street skater", w: "Axel_Cruysberghs" },
        { n: "Lore Bruggeman", d: "Tokyo 2020 street Olympian", w: "Lore_Bruggeman" }
      ]
    },
    sk: {
      hide: ["Slovak"],
      facts: [
        { t: "At Paris 2024, Richard Tury became the first skateboarder ever to represent the country at the Olympics — and he made the men's street final, finishing 5th.", src: ["w:Richard_Tury"] }
      ],
      skaters: [
        { n: "Richard Tury", d: "5th in men's street at Paris 2024", w: "Richard_Tury" }
      ]
    },
    af: {
      hide: ["Afghan"],
      facts: [
        { t: "Skateistan began in Kabul in 2007, when Australian skater Oliver Percovich arrived with three skateboards and started skating in the streets with local kids.", src: ["w:Skateistan"] },
        { t: "Skateistan grew into an international charity that now runs skate schools in several countries, and more than half of its students are girls.", src: ["w:Skateistan"] }
      ],
      skaters: []
    },
    in: {
      hide: ["Indian"],
      facts: [
        { t: "Janwaar Castle, in a village in Madhya Pradesh, is the country's first rural skatepark — and it's free for the village kids.", src: ["w:Skateboarding_in_India"] },
        { t: "Asha Gond from Madhya Pradesh represented the country at the 2018 World Skateboarding Championship. The 2021 Netflix film 'Skater Girl' is believed to be based on her story.", src: ["w:Asha_Gond"] }
      ],
      skaters: [
        { n: "Asha Gond", d: "2018 World Championship competitor; leads Barefoot Skateboarders", w: "Asha_Gond" }
      ]
    },
    sn: {
      hide: ["Senegalese"],
      facts: [
        { t: "In November 2026, Dakar hosted skateboarding at the Youth Olympic Games, at the Tour de l'Oeuf skatepark.", src: ["w:Skateboarding_at_the_2026_Summer_Youth_Olympics"] },
        { t: "The 2026 Youth Olympics in Dakar were the first Olympic (IOC) event ever held in Africa.", src: ["w:2026_Summer_Youth_Olympics"] }
      ],
      skaters: []
    }
  },

  states: {
    ca: {
      hide: ["Californian"],
      facts: [
        { t: "In the mid-1970s the Z-Boys, a crew of skaters from Santa Monica and Venice, became legends who changed how the world skated.", src: ["w:Z-Boys"] },
        { t: "Vans — now one of the most famous skate-shoe brands — opened its very first store in Anaheim in 1966.", src: ["w:Vans"] }
      ],
      skaters: [
        { n: "Tony Hawk", d: "Born and raised in San Diego; first documented 900", w: "Tony_Hawk" },
        { n: "Nyjah Huston", d: "Born in Davis; 15 X Games golds", w: "Nyjah_Huston" },
        { n: "Tony Alva", d: "Santa Monica Z-Boy and vert pioneer", w: "Tony_Alva" },
        { n: "Stacy Peralta", d: "Venice Z-Boy who became a film director", w: "Stacy_Peralta" },
        { n: "Mark Gonzales", d: "From South Gate; a pioneer of street skating", w: "Mark_Gonzales" },
        { n: "Paul Rodriguez", d: "'P-Rod', born in Tarzana, LA; 4 X Games golds", w: "Paul_Rodriguez_(skateboarder)" }
      ]
    },
    fl: {
      hide: [],
      facts: [
        { t: "Alan 'Ollie' Gelfand invented the ollie — the jump almost every skate trick is built on — and it stayed mostly a Florida trick until he visited California in 1978.", src: ["w:Skateboarding", "w:Alan_Gelfand"] },
        { t: "Kona Skatepark in Jacksonville, opened in 1977, is the oldest surviving commercial skatepark in the world.", src: ["w:Kona_Skatepark"] }
      ],
      skaters: [
        { n: "Rodney Mullen", d: "Born and raised in Gainesville; 'godfather of street skating'", w: "Rodney_Mullen" },
        { n: "Andrew Reynolds", d: "Lakeland native; co-founded Baker Skateboards", w: "Andrew_Reynolds_(skateboarder)" },
        { n: "Jamie Foy", d: "From Deerfield Beach; Thrasher Skater of the Year 2017 & 2024", w: "Jamie_Foy" },
        { n: "Elissa Steamer", d: "Born in Fort Myers; playable in the first five Tony Hawk's Pro Skater games", w: "Elissa_Steamer" },
        { n: "Zion Wright", d: "Grew up in Jupiter; Tokyo 2020 park Olympian", w: "Zion_Wright" }
      ]
    },
    al: {
      hide: [],
      facts: [
        { t: "Jamie Thomas, who grew up in Dothan, founded Zero Skateboards — and is nicknamed 'The Chief'.", src: ["w:Jamie_Thomas"] }
      ],
      skaters: [
        { n: "Jamie Thomas", d: "Grew up in Dothan; founder of Zero Skateboards", w: "Jamie_Thomas" }
      ]
    },
    az: {
      hide: [],
      facts: [
        { t: "Aaron 'Jaws' Homoki, from Phoenix, is famous for surviving enormous drops and clearing gigantic gaps.", src: ["w:Aaron_Homoki"] },
        { t: "Brighton Zeuner, born in Scottsdale, won X Games park gold in 2017 at just 13 — the youngest champion in X Games history at the time.", src: ["w:Brighton_Zeuner"] }
      ],
      skaters: [
        { n: "Aaron 'Jaws' Homoki", d: "Big-drop specialist from Phoenix", w: "Aaron_Homoki" },
        { n: "Brighton Zeuner", d: "Born in Scottsdale; two-time X Games park gold", w: "Brighton_Zeuner" },
        { n: "Alana Smith", d: "From Mesa; Tokyo 2020 street Olympian", w: "Alana_Smith_(skateboarder)" }
      ]
    },
    ct: {
      hide: [],
      facts: [
        { t: "Brian Anderson, a Connecticut native, was named Thrasher magazine's Skater of the Year in 1999.", src: ["w:Brian_Anderson_(skateboarder)"] },
        { t: "Alexis Sablone, who grew up in Old Saybrook, finished 4th in the first-ever Olympic women's street final at Tokyo 2020.", src: ["w:Alexis_Sablone"] }
      ],
      skaters: [
        { n: "Brian Anderson", d: "Thrasher Skater of the Year 1999", w: "Brian_Anderson_(skateboarder)" },
        { n: "Alexis Sablone", d: "Grew up in Old Saybrook; Tokyo 2020 Olympian", w: "Alexis_Sablone" }
      ]
    },
    ga: {
      hide: [],
      facts: [
        { t: "Grant Taylor, born in Atlanta, was Thrasher's Skater of the Year in 2011 — and his dad, Thomas Taylor, was a pro skater too.", src: ["w:Grant_Taylor_(skateboarder)"] }
      ],
      skaters: [
        { n: "Grant Taylor", d: "Born in Atlanta; Thrasher Skater of the Year 2011", w: "Grant_Taylor_(skateboarder)" }
      ]
    },
    hi: {
      hide: ["Hawaiian"],
      facts: [
        { t: "Christian Hosoi, who grew up in Los Angeles and Hawaii, invented famous airs like the Christ Air and the Rocket Air.", src: ["w:Christian_Hosoi"] },
        { t: "Heimana Reynolds, born in Honolulu, won the 2019 World Skate Championships in park and competed at Tokyo 2020.", src: ["w:Heimana_Reynolds"] }
      ],
      skaters: [
        { n: "Christian Hosoi", d: "Invented the Rocket Air; founded Hosoi Skates in 1984", w: "Christian_Hosoi" },
        { n: "Heimana Reynolds", d: "Born in Honolulu; 2019 park world champion", w: "Heimana_Reynolds" },
        { n: "Jordyn Barratt", d: "Skater and surfer raised in Haleiwa", w: "Jordyn_Barratt" }
      ]
    },
    il: {
      hide: [],
      facts: [
        { t: "Chaz Ortiz, who grew up in the Chicago suburbs, became the youngest person ever to win the Dew Tour Championship.", src: ["w:Chaz_Ortiz"] }
      ],
      skaters: [
        { n: "Chaz Ortiz", d: "Youngest Dew Tour champion", w: "Chaz_Ortiz" }
      ]
    },
    ks: {
      hide: [],
      facts: [
        { t: "Sean Malto, from Lansing, won the 2011 Street League Skateboarding Championship.", src: ["w:Sean_Malto"] }
      ],
      skaters: [
        { n: "Sean Malto", d: "2011 Street League champion", w: "Sean_Malto" }
      ]
    },
    ky: {
      hide: [],
      facts: [
        { t: "Louisville's Extreme Park, opened in 2002, is famous for its giant 24-foot (7.3 m) concrete full pipe.", src: ["w:David_Armstrong_Extreme_Park"] },
        { t: "The park became nationally famous after it was featured in Tony Hawk's Gigantic Skatepark Tour.", src: ["w:David_Armstrong_Extreme_Park"] }
      ],
      skaters: []
    },
    md: {
      hide: [],
      facts: [
        { t: "Bucky Lasek, born in Baltimore, started skateboarding at 12 after his bike was stolen — and became a vert superstar.", src: ["w:Bucky_Lasek"] },
        { t: "Ruby Lilley, born on a farm in Ocean City, represented the United States at the Paris 2024 Olympics.", src: ["w:Ruby_Lilley"] }
      ],
      skaters: [
        { n: "Bucky Lasek", d: "Baltimore-born vert legend", w: "Bucky_Lasek" },
        { n: "Ruby Lilley", d: "Paris 2024 Olympian", w: "Ruby_Lilley" }
      ]
    },
    ma: {
      hide: [],
      facts: [
        { t: "Nora Vasconcellos, from Pembroke, was the first female skateboarder ever signed to Adidas.", src: ["w:Nora_Vasconcellos"] }
      ],
      skaters: [
        { n: "Nora Vasconcellos", d: "From Pembroke; Adidas pro", w: "Nora_Vasconcellos" },
        { n: "Brandon Westgate", d: "Born in Wareham; street pro", w: "Brandon_Westgate" }
      ]
    },
    mi: {
      hide: [],
      facts: [
        { t: "Josh Kalis, born in Grand Rapids, became famous in the late 1990s as part of Philadelphia's legendary LOVE Park street scene.", src: ["w:Josh_Kalis"] }
      ],
      skaters: [
        { n: "Josh Kalis", d: "Grand Rapids-born LOVE Park legend", w: "Josh_Kalis" }
      ]
    },
    nj: {
      hide: [],
      facts: [
        { t: "Mike Vallely, who grew up in Edison, is a street-skating legend — and was the lead singer of the punk band Black Flag from 2013 to 2025.", src: ["w:Mike_Vallely"] }
      ],
      skaters: [
        { n: "Mike Vallely", d: "Grew up in Edison; 'Mike V'", w: "Mike_Vallely" },
        { n: "Ishod Wair", d: "Raised in Bordentown; started skating at 9", w: "Ishod_Wair" },
        { n: "Ricky Oyola", d: "Born in Pemberton; Philadelphia street legend", w: "Ricky_Oyola" }
      ]
    },
    nm: {
      hide: [],
      facts: [
        { t: "Mariah Duran, from Albuquerque, was named to the first-ever US Olympic skateboarding team, for Tokyo 2020.", src: ["w:Mariah_Duran"] }
      ],
      skaters: [
        { n: "Mariah Duran", d: "Albuquerque street skater; Tokyo 2020 Olympian", w: "Mariah_Duran" }
      ]
    },
    ny: {
      hide: [],
      facts: [
        { t: "Supreme opened its first store on Lafayette Street in Manhattan in 1994 — with a layout built so skaters could skate inside.", src: ["w:Supreme_(brand)"] },
        { t: "The Brooklyn Banks, brick banks under the Manhattan side of the Brooklyn Bridge, are a legendary skate spot.", src: ["w:Brooklyn_Banks"] }
      ],
      skaters: [
        { n: "Tyshawn Jones", d: "Born in Manhattan; Thrasher Skater of the Year 2018 & 2022", w: "Tyshawn_Jones" },
        { n: "Harold Hunter", d: "NYC skater who starred in the 1995 film 'Kids'", w: "Harold_Hunter" },
        { n: "Keith Hufnagel", d: "Grew up in Manhattan; founded the brand HUF", w: "Keith_Hufnagel" },
        { n: "Elliot Sloan", d: "Born and raised in NYC; 16 X Games medals", w: "Elliot_Sloan" }
      ]
    },
    oh: {
      hide: [],
      facts: [
        { t: "Rob Dyrdek built the world's first 'skate plaza' in his hometown of Kettering in 2005.", src: ["w:Rob_Dyrdek"] },
        { t: "Dyrdek also founded Street League Skateboarding, a pro street contest series, in 2010.", src: ["w:Street_League_Skateboarding"] }
      ],
      skaters: [
        { n: "Rob Dyrdek", d: "Born in Kettering; pro skater and TV star", w: "Rob_Dyrdek" }
      ]
    },
    or: {
      hide: [],
      facts: [
        { t: "Burnside Skatepark in Portland was the first DIY skatepark: skaters started pouring concrete under the Burnside Bridge, without permission, on Halloween night 1990.", src: ["w:Burnside_Skatepark"] },
        { t: "Danny Way, born in Portland, once jumped the Great Wall of China on a skateboard using a MegaRamp.", src: ["w:Danny_Way"] }
      ],
      skaters: [
        { n: "Danny Way", d: "Born in Portland; two-time Thrasher Skater of the Year", w: "Danny_Way" }
      ]
    },
    pa: {
      hide: [],
      facts: [
        { t: "Philadelphia's LOVE Park became one of the most famous skate spots on Earth in the 1990s and 2000s — even though the city kept banning skating there.", src: ["w:Love_Park"] },
        { t: "Stevie Williams, who grew up in Philadelphia, founded the skate brand DGK.", src: ["w:Stevie_Williams", "w:Josh_Kalis"] }
      ],
      skaters: [
        { n: "Stevie Williams", d: "Philly street legend; founder of DGK", w: "Stevie_Williams" },
        { n: "Chris Cole", d: "Grew up in Langhorne", w: "Chris_Cole_(skateboarder)" }
      ]
    },
    ri: {
      hide: [],
      facts: [
        { t: "The very first X Games were held in the summer of 1995, in Providence and Newport.", src: ["w:X_Games"] }
      ],
      skaters: []
    },
    tx: {
      hide: [],
      facts: [
        { t: "Vert legend Jeff Phillips grew up in Dallas and started skating at age 10 — his grandmother gave him his first board in 1973.", src: ["w:Jeff_Phillips_(skateboarder)"] }
      ],
      skaters: [
        { n: "Jeff Phillips", d: "Dallas-raised pro skater", w: "Jeff_Phillips_(skateboarder)" }
      ]
    },
    wa: {
      hide: [],
      facts: [
        { t: "Mitchie Brusco, who started skating at age 3 in Kirkland, was the first skateboarder ever to land a 1260 — three and a half spins! — in competition.", src: ["w:Mitchie_Brusco"] }
      ],
      skaters: [
        { n: "Mitchie Brusco", d: "First 1260 in competition", w: "Mitchie_Brusco" }
      ]
    }
  }
};
