/* EASY story: The Gilded Acorn. One room, three suspects.
   Every version (case-a, case-b, case-c) uses this room, these suspects and this briefing,
   so the player can't tell which version they got. */
SQH.addStory({
  id: 'gilded-acorn',
  tier: 'easy',
  title: 'The Gilded Acorn',
  blurb: 'A golden prize vanishes from a locked glass case during one minute of darkness.',
  question: 'Who took the Gilded Acorn, and how did they do it?',
  rooms: [
    { id: 'trophy', name: 'Trophy Room', art: 'trophy-room' }
  ],
  suspects: [
    { id: 'bushwick', name: 'Lady Hazel Bushwick', short: 'Lady Bushwick', role: 'President of the Royal Acorn Society' },
    { id: 'pip', name: 'Pip Chestnut', short: 'Pip', role: 'The Society\'s young porter' },
    { id: 'thistlewick', name: 'Colonel Filbert Thistlewick', short: 'the Colonel', role: 'Retired explorer' }
  ],
  briefing: [
    { who: 'watson', face: 'shocked', text: 'Holmes! The Gilded Acorn has vanished from the Royal Acorn Society, right out of a locked glass case!' },
    { who: 'holmes', face: 'smug', text: 'During the single minute the gaslights dipped low, with only three guests in the room. Delightful.' },
    { who: 'watson', face: 'neutral', text: 'Lady Bushwick, the porter Pip Chestnut, and Colonel Thistlewick. Which one of them did it?' },
    { who: 'holmes', face: 'suspicious', text: 'Observe first, Watson. Conclusions come later.' }
  ]
});
