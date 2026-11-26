/* The Gilded Acorn, version C. Culprit: Colonel Thistlewick (unscrewed the back panel, hollow cane). */
SQH.addCase({
  id: 'gilded-acorn-c',
  story: 'gilded-acorn',
  roomState: { trophy: { window: 'open' } },
  clues: [
    { id: 'lock', room: 'trophy', spot: 'case', prop: 'case', draw: false, cat: 'physical', big: true,
      name: 'The display case',
      see: 'The case is still locked and the glass is whole. A fine film of dust lies in the keyhole, undisturbed.',
      think: 'No key has turned in this lock tonight. So how did the acorn get out?' },
    { id: 'screws', room: 'trophy', spot: 'casebase', prop: 'screws', cat: 'physical', big: true,
      name: 'Screws on the back panel',
      see: 'The back panel of the case is held on by four brass screws. Every screw head has fresh, bright scratches.',
      think: 'Someone unscrewed this panel recently, then put it back.' },
    { id: 't-colonel', room: 'trophy', who: 'thistlewick', face: 'smug', cat: 'testimony',
      name: 'The Colonel: his complaint',
      see: '"I stood by the window the whole minute, sir! And frankly, that acorn came from MY family\'s oak. The Society pinched it fifty years ago!"',
      think: 'A strong motive, and he offers it freely.' },
    { id: 't-pip', room: 'trophy', who: 'pip', face: 'neutral', cat: 'testimony',
      name: 'Pip: what he heard',
      see: '"When the lights went low I heard a squeak, squeak, squeak from over by the case, sir. Like a little screw turning."',
      think: 'Not the click of a key. The squeak of screws.' },
    { id: 'note', room: 'trophy', spot: 'table', prop: 'receipt', cat: 'document',
      name: 'Ironmonger\'s receipt',
      see: 'A receipt from Grimble & Sons, Ironmongers: "Hollowing one walking cane, six inches deep, with screw-off silver knob. Paid. Col. F. Thistlewick."',
      think: 'Why would anyone want a hollow walking cane?' },
    { id: 'cane', room: 'trophy', spot: 'coatstand', prop: 'cane', cat: 'physical', needs: ['note'], big: true,
      lock: 'The Colonel\'s walking cane leans on the coat stand. It looks perfectly ordinary. Is there a reason to look closer?',
      name: 'Walking cane',
      see: 'Twist the silver knob and it comes right off. The cane is hollow, and its inside is sprinkled with flakes of gold leaf.',
      think: 'Something gilded rode inside this cane tonight.' },
    { id: 'prints', room: 'trophy', spot: 'rug', prop: 'prints', cat: 'physical', herring: true,
      name: 'Muddy tail prints',
      see: 'Muddy tail prints cross the rug from the window toward the case. The mud is dry and cracked.',
      think: 'Did someone come in from the wet garden?' },
    { id: 'sill', room: 'trophy', spot: 'sill', prop: 'window', draw: false, cat: 'physical',
      name: 'Wet window sill',
      see: 'Rain drips onto the sill of the open window, but the wet dust on it is smooth. No prints, no marks.',
      think: 'Nobody has climbed through this window since the rain began.' }
  ],
  deductions: [
    { id: 'd-panel', from: ['lock', 'screws'], kind: 'deductive', name: 'The back way in',
      text: 'No key turned in the lock, but the back panel\'s screws were freshly turned. The thief opened the case from the back.' },
    { id: 'd-squeak', from: ['screws', 't-pip'], kind: 'inductive', name: 'Squeaking screws',
      text: 'The squeaks Pip heard were the back panel\'s screws being turned in the dark.' }
  ],
  answers: [
    { id: 'c1', who: 'thistlewick', correct: true, proof: ['d-panel', 'cane'],
      text: 'Colonel Thistlewick unscrewed the back panel of the case while the lights were low, and hid the Gilded Acorn in his hollow cane. He believes it was taken from his family long ago.' },
    { id: 'c2', who: 'bushwick',
      text: 'Lady Bushwick opened the case with her President\'s key and hid the acorn in her hatbox.',
      ruledOutBy: { lock: 'There\'s dust in the keyhole, undisturbed. No key turned in that lock tonight.' } },
    { id: 'c3', who: 'pip',
      text: 'Pip Chestnut cracked the case with a slingshot shot and grabbed the acorn to sell.',
      ruledOutBy: { lock: 'The glass is whole, Holmes. Nobody cracked that case.' } },
    { id: 'c4', who: null,
      text: 'A cat burglar climbed in through the open window, took the acorn, and left those muddy tail prints on the rug.',
      ruledOutBy: { sill: 'The wet sill is smooth. Nobody has climbed through since the rain began.', prints: 'That mud is dry and cracked. Those prints are hours old.' } },
    { id: 'c5', who: 'pip',
      text: 'Pip Chestnut opened the case with a spare key and slipped the acorn into his polishing rag.',
      ruledOutBy: { lock: 'Dust lies undisturbed in the keyhole. No key was used at all.' } }
  ],
  walkthrough: [
    { text: 'Dust in the keyhole meant no key was used, and yet the case was whole.', uses: ['lock'] },
    { text: 'Fresh scratches on the back panel\'s screws, and the squeaks Pip heard. Deduction: the case was opened from the back.', uses: ['screws', 't-pip', 'd-squeak', 'd-panel'] },
    { text: 'The ironmonger\'s receipt told us the Colonel owned a hollow cane, and the cane still held flakes of gold.', uses: ['note', 'cane'] },
    { text: 'The Colonel gave us his own motive: he believes the acorn belonged to his family.', uses: ['t-colonel'] },
    { text: 'The burglar theory fails twice: a smooth wet sill, and old, dry tail prints.', uses: ['sill', 'prints'] },
    { text: 'The Colonel grumbled, then handed over the acorn from his coat pocket. The Society agreed to look into his family\'s claim, properly this time.', uses: [] }
  ],
  traps: [
    { id: 'prints', why: 'The muddy tail prints pointed to a burglar from the window, but the mud was dry and cracked. They were made hours before the lights dipped.' }
  ]
});
