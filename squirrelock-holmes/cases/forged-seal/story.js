/* MEDIUM story: The Forged Seal. Two rooms (the Counting Room is locked at first), four suspects. */
SQH.addStory({
  id: 'forged-seal',
  tier: 'medium',
  title: 'The Forged Seal',
  blurb: 'An order stamped with the bank\'s own wax seal empties the hospital\'s Winter Fund.',
  question: 'Who forged the order that emptied the Winter Fund, and how was it sealed?',
  rooms: [
    { id: 'office', name: 'Manager\'s Office', art: 'bank-office' },
    { id: 'counting', name: 'Counting Room', art: 'counting-room' }
  ],
  suspects: [
    { id: 'cashew', name: 'Mr. Cornelius Cashew', short: 'Mr. Cashew', role: 'Bank manager and keeper of the seal ring' },
    { id: 'sorrel', name: 'Miss Ivy Sorrel', short: 'Miss Sorrel', role: 'Head clerk' },
    { id: 'burrows', name: 'Barnaby Burrows', short: 'Burrows', role: 'Night watchman' },
    { id: 'pinecroft', name: 'Percy Pinecroft', short: 'Pinecroft', role: 'Engraver who made the bank\'s seal ring' }
  ],
  briefing: [
    { who: 'nutson', face: 'shocked', text: 'Mr. Holmes! A messenger from Chestnut & Co. Savings Hollow. He says it\'s dreadfully urgent!' },
    { who: 'watson', face: 'neutral', text: 'An order with the bank\'s own wax seal had the hospital\'s Winter Fund paid out. Five hundred gold acorns, gone!' },
    { who: 'holmes', face: 'suspicious', text: 'And the manager swears he never wrote it. A seal, a signature, and a lie hiding somewhere between them.' },
    { who: 'watson', face: 'neutral', text: 'The seal on the order is gnawed along one edge. Odd, isn\'t it?' }
  ]
});
