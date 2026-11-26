/* The Gilded Acorn, version A. Culprit: Lady Bushwick (her own key, hid it in her hatbox). */
SQH.addCase({
  id: 'gilded-acorn-a',
  story: 'gilded-acorn',
  roomState: { trophy: { window: 'open' } },
  clues: [
    { id: 'lock', room: 'trophy', spot: 'case', prop: 'case', draw: false, cat: 'physical', big: true,
      name: 'The display case',
      see: 'The glass case is still locked. The glass is whole and the lock hasn\'t a single scratch. The velvet cushion inside is empty.',
      think: 'Nobody smashed or forced this case. It was opened with a key.' },
    { id: 'smear', room: 'trophy', spot: 'case', at: [872, 520], prop: 'smear', cat: 'physical',
      name: 'Lipstick smear',
      see: 'A smudge of rose-pink lipstick on the glass, just above the keyhole.',
      think: 'Someone leaned in close to the lock. Someone who wears rose-pink lipstick.' },
    { id: 't-bushwick', room: 'trophy', who: 'bushwick', face: 'smug', cat: 'testimony',
      name: 'Lady Bushwick: the key',
      see: '"Only the President carries a key to that case, Mr. Holmes, and it has not left my chain all evening." She dabs at her rose-pink lipstick.',
      think: 'So the only key to the case belongs to Lady Bushwick.' },
    { id: 't-pip', room: 'trophy', who: 'pip', face: 'shocked', cat: 'testimony',
      name: 'Pip: what he heard',
      see: '"I was polishing the fire irons when the lights went low, sir. I heard a little click from over by the case. Like a key turning."',
      think: 'A click, not breaking glass. That fits a key.' },
    { id: 'sill', room: 'trophy', spot: 'sill', prop: 'window', draw: false, cat: 'physical',
      name: 'Wet window sill',
      see: 'Rain has soaked the sill of the open window. The wet dust on it is perfectly smooth: no prints, no scuffs, no marks at all.',
      think: 'Nobody climbed in or out of this window tonight.' },
    { id: 'dent', room: 'trophy', spot: 'wall', prop: 'dent', cat: 'physical', herring: true,
      name: 'Dent in the wall',
      see: 'A round dent in the wood panel, about the size of an acorn. There is dust inside it.',
      think: 'Was a slingshot fired in here? Pip carries one in his pocket.' },
    { id: 'note', room: 'trophy', spot: 'fireplace', prop: 'burnt-note', cat: 'document', big: true,
      name: 'Half-burned letter',
      see: 'A letter, half burned in the grate: "...the orchard has failed... the Society\'s savings are gone... must sell it before Friday\'s audit... H.B."',
      think: 'Someone with the initials H.B. needs a great deal of money, fast.' },
    { id: 'hatbox', room: 'trophy', spot: 'coatstand', prop: 'hatbox', cat: 'physical', needs: ['note'], big: true,
      lock: 'A lady\'s hatbox, tied with ribbon. We can\'t open someone\'s hatbox without a good reason. Find one first.',
      name: 'Hatbox',
      see: 'Inside the hatbox: an empty velvet pouch, sprinkled with flakes of gold leaf.',
      think: 'Something gilded was hidden in here, very recently.' }
  ],
  deductions: [
    { id: 'd-key', from: ['lock', 't-bushwick'], kind: 'deductive', name: 'The President\'s key',
      text: 'The case was opened with a key, and the only key belongs to Lady Bushwick. So her key opened the case.' },
    { id: 'd-smear', from: ['smear', 't-bushwick'], kind: 'inductive', name: 'Rose-pink lipstick',
      text: 'The lipstick by the keyhole is Lady Bushwick\'s shade. She was bending over the lock.' }
  ],
  answers: [
    { id: 'a1', who: 'bushwick', correct: true, proof: ['d-key', 'hatbox'],
      text: 'Lady Bushwick opened the case with her own key while the lights were low, and hid the Gilded Acorn in her hatbox. She had lost the Society\'s savings and planned to sell it before the audit.' },
    { id: 'a2', who: 'pip',
      text: 'Pip Chestnut cracked the case open with a slingshot shot in the dark, then grabbed the acorn to sell it.',
      ruledOutBy: { lock: 'The case isn\'t cracked at all, Holmes. The glass is whole and the lock hasn\'t a scratch.' } },
    { id: 'a3', who: 'thistlewick',
      text: 'Colonel Thistlewick picked the lock with his pocketknife and hid the acorn inside his walking cane.',
      ruledOutBy: { lock: 'That lock hasn\'t a single scratch on it. Nobody picked it.', 't-pip': 'Pip heard one clean click, like a key, not someone fiddling at a lock.' } },
    { id: 'a4', who: null,
      text: 'A cat burglar climbed the ivy, slipped in through the open window, and escaped the same way with the acorn.',
      ruledOutBy: { sill: 'The wet sill is perfectly smooth. Nobody climbed through that window.' } },
    { id: 'a5', who: 'pip',
      text: 'Pip Chestnut grabbed the acorn and lowered it out of the window on a string to a friend waiting in the street.',
      ruledOutBy: { sill: 'There isn\'t a mark on that wet sill, Holmes. Nothing was lowered out of the window.' } }
  ],
  walkthrough: [
    { text: 'The case was locked, whole and unscratched. That is the observation. The inference: it was opened with a key, not forced. Pip\'s click agrees.', uses: ['lock', 't-pip'] },
    { text: 'Lady Bushwick told us the only key never left her chain. Put the two together and the deduction is certain: her key opened the case.', uses: ['t-bushwick', 'd-key'] },
    { text: 'Her rose-pink lipstick sat right beside the keyhole, so she had leaned close to the lock.', uses: ['smear', 'd-smear'] },
    { text: 'The half-burned letter signed H.B. gave the motive: the Society\'s savings were gone. The hatbox gave the hiding place: an empty pouch dusted with gold.', uses: ['note', 'hatbox'] },
    { text: 'The burglar and string theories fail, because the wet sill was untouched.', uses: ['sill'] },
    { text: 'Faced with the evidence, Lady Bushwick handed back the Gilded Acorn from inside her glove, and promised to tell the Society the truth about its savings.', uses: [] }
  ],
  traps: [
    { id: 'dent', why: 'The dent made Pip and his slingshot look guilty, but the case was never broken, and the dust inside the dent shows it is old. A dent only proves that something once hit the wall.' }
  ]
});
